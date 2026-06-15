---
name: ts-project-planner
description: >
  Three-layer project orchestrator implementing dual-track agile. Layer D
  (Discovery) runs Idea → Explore → Validate → Decide to produce a
  Ready-for-Delivery buffer (.ai/discovery.json). Layer 0 (Backlog) syncs ready
  items into a release map + epic backlog (.ai/ts-project-planner/plan.json).
  Layer 1 (Delivery) sequences epics per release and drives ts-deliver-router as
  a per-epic sub-loop. Activate whenever a user wants to plan a large project,
  run discovery on an idea, decide whether to build/kill/reduce-scope something,
  break down a vision into MVP and iterations, manage an epic backlog, start or
  close a release, check iteration or discovery progress, or coordinate multiple
  epics across a release cycle. Also activate on: "how do I manage this whole
  project", "what should we build next", "is this idea worth building", "what
  epics are next", "plan my MVP", "start iteration", "what's in discovery",
  "what's the status across all epics", "break this down into manageable
  pieces". Works with ts-deliver-router — do NOT replace it. Reads and writes
  shared artifacts in .ai/ workspace root per WORKSPACE.md convention.
---

# ts-project-planner

A three-layer orchestrator implementing **dual-track agile** (Discovery +
Delivery, per Aktia) for projects too large for a single ts-deliver-router
cycle.

- **Layer D — Discovery**: cheap, fast, killable learning loops. Turns raw
  ideas into a validated, Ready-for-Delivery buffer.
- **Layer 0 — Backlog**: syncs the Ready-for-Delivery buffer into a release map
  and epic backlog.
- **Layer 1 — Delivery**: sequences epics per release, drives
  ts-deliver-router as a per-epic sub-loop.

Both tracks run **continuously and in parallel** — Discovery for the next
release runs while Delivery ships the current one. A feedback hook from
ts-deliver-router re-enters Discovery when Delivery surfaces a new unknown.

**Does not replace ts-deliver-router.** Calls it.

---

## Workspace

All artifacts follow the `.ai/` workspace convention defined in
`references/workspace-spec.md`. Read it before first use.

```
.ai/                          ← workspace root
├── domain.json               ← shared: ES domain model (read here)
├── discovery.json            ← shared: Discovery backlog + Ready-for-Delivery buffer
├── iteration.json            ← shared: current release state (primary writer)
├── risks.md                  ← shared: risk register (primary writer)
├── decisions/                ← shared: ADRs (read + append)
├── ts-deliver-router/         ← private to ts-deliver-router (append-only on discovery.json)
└── ts-project-planner/
    ├── plan.json             ← private: full project backlog
    └── retrospectives/       ← private: per-iteration retros
```

---

## Architecture

```
Layer D — Discovery (this skill)
  /ts-discover idea "<desc>"        → seed discovery.json, status=idea
  /ts-discover explore <id>         → Problem Understanding + Solution Exploration
  /ts-discover validate <id>        → Validation (council-advisor, tows-strategy-analyst)
  /ts-discover decide <id> [...]    → build|kill|keep-learning|reduce-scope
  /ts-discover status               → kanban view of discovery backlog
  /ts-discover idea --from-router   → feedback intake from ts-deliver-router

         status=ready items
              │
              ▼
Layer 0 — Backlog (this skill)
  /ts-project plan --new   → vision interview → seed Discovery with candidate ideas
  /ts-project plan --sync  → pull status=ready items → .ai/ts-project-planner/plan.json
  /ts-project status       → cross-iteration progress
  /ts-project refine       → update backlog after each iteration

Layer 1 — Delivery (this skill, orchestrates Layer 2)
  /ts-iteration start <release>  → load epics → .ai/iteration.json
  /ts-iteration next             → advance to next epic → /ts-router init
  /ts-iteration close            → release tag + retro + promote next

Layer 2 — ts-deliver-router (separate skill, called per epic)
  /ts-router init  →  ...7-phase spine...  →  /ts-router refine
```

---

## Discovery State Machine

`.ai/discovery.json` holds the Discovery backlog — the data model that all
`/ts-discover` commands operate on.

### Schema

```json
{
  "project": "<name>",
  "ideas": [
    {
      "id": "idea-001",
      "title": "General Ledger module",
      "status": "idea|exploring|validating|ready|reduce-scope|keep-learning|killed",
      "source_epic": null,
      "keep_learning_count": 0,
      "riskiest_assumptions": [
        { "assumption": "Multi-currency required from day 1", "risk": "H", "validated": false }
      ],
      "exploration_output": {
        "domain_events": [], "commands": [], "aggregates": [],
        "bounded_contexts": [], "acpl_pattern_group": "G2+G3"
      },
      "validation_output": {
        "feasibility": "feasible|risky|infeasible",
        "council_verdict": "<summary>",
        "decision_rationale": "<why>"
      },
      "decision": "build|kill|keep-learning|reduce-scope|null",
      "ready_epics": [],
      "synced_to_plan": false,
      "notes": ""
    }
  ]
}
```

### State Transitions

```
                ┌──────────── keep-learning (count++) ────────────┐
                │                                                   │
idea ──explore──┴──> exploring ──validate──> validating ───────────┘
  ▲                       │                       │
  │                       │ (low-uncertainty:      ├──decide build──────────> ready
  │                       │  skip validate)        ├──decide kill───────────> killed (+ADR)
  │                       └────decide build────────┘
  │                                                 └──decide reduce-scope──> reduce-scope
  └─────────────────────────────────────────────────────(splits into 2 new
                                                            'idea' entries,
                                                            origin linked)
```

`source_epic` (non-null) marks entries created via `--from-router` — the
feedback path from ts-deliver-router.

### WIP Limit

Max **3** ideas concurrently with `status` in `{exploring, validating}`
combined. `/ts-discover explore <id>` is blocked if the limit is already
reached — finish or defer an in-flight idea first.

### Stale Rule

After **3** `keep-learning` decisions on the same idea
(`keep_learning_count >= 3`), `/ts-discover status` flags it `stale` and
surfaces it for a forced decision (`build` / `kill` / `reduce-scope`).

### Dedup (for `--from-router` entries)

Before creating a new entry from `/ts-discover idea --from-router`, normalize
the incoming `description` (lowercase, strip punctuation) and compare token
sets (Jaccard similarity) against the `title` of every existing entry
regardless of status. If similarity > 0.5 with an existing entry:
- Do NOT create a new entry.
- Append to that entry's `notes`:
  `"duplicate feedback received from <source_epic> on <date>"`.

---

## Work Unit Types

Three types — each maps to a different ts-deliver-router registry profile.
An idea's type is typically set at `/ts-discover decide build` time, based on
`exploration_output` and `validation_output`.

| Type | Active Phases | Gates | Mutation Target | Branch |
|---|---|---|---|---|
| **epic** | Full 7 phases | G1 + G2 | Per stage (60→85%) | `feat/<name>` |
| **refactor** | Think→Build→Review→Test→Reflect (no Ship) | G1 only | 90% (regression guard) | `refactor/<name>` |
| **bugfix** | Plan→Build→Test→Ship (no Think/Reflect) | G2 only | 80% | `fix/<name>` |

At `/ts-router init`, the `type` field in `iteration.json` pre-populates the
registry profile — phases are activated/skipped automatically.

---

## Commands

Commands are grouped by layer and ordered in typical flow sequence: Discovery
first, then Backlog sync, then Delivery orchestration.

### `/ts-discover idea "<desc>"`

Seeds the Discovery backlog with a new candidate.

```
1. Read .ai/discovery.json (create if missing: { project, ideas: [] })
2. Append new entry: { id: "idea-<NNN>", title: "<desc>", status: "idea",
   source_epic: null, keep_learning_count: 0, riskiest_assumptions: [],
   exploration_output: {}, validation_output: {}, decision: null,
   ready_epics: [], synced_to_plan: false, notes: "" }
3. Confirm: "idea-<NNN> '<desc>' added — status=idea"
```

`/ts-project plan --new` calls this command once per candidate module/feature
area identified during its vision interview.

---

### `/ts-discover explore <id>`

Problem Understanding + Solution Exploration. WIP-limited.

```
1. Check WIP: count ideas with status in {exploring, validating}.
   → If already 3: "WIP limit reached (3/3) — finish or defer an in-flight
     idea first." STOP.
2. Run ts-event-storming-facilitator:
   → domain_events, commands, aggregates, bounded_contexts
   → consult ts-acpl problem-frame-map.md → acpl_pattern_group
3. Run first-principles-agent:
   → challenge the framing → riskiest_assumptions[] (each tagged H/M/L)
4. Write idea.exploration_output, idea.riskiest_assumptions
5. idea.status = "exploring"
6. Confirm: "idea-<NNN> explored. Riskiest: <top H-risk assumption, if any>.
   <Validation required|Validation optional — no H-risk assumptions>."
```

---

### `/ts-discover validate <id>`

Validation. Mandatory only if `riskiest_assumptions` contains an `H`-risk
item; otherwise optional (low-uncertainty ideas may skip straight to
`/ts-discover decide build`).

```
1. Run council-advisor: pressure-test each H-risk assumption
2. Run tows-strategy-analyst: assess strategic fit
3. Optionally run critical-thinker for sequencing/dependency challenges
4. Write idea.validation_output = { feasibility, council_verdict,
   decision_rationale }
5. idea.status = "validating"
6. Confirm: "idea-<NNN> validated — feasibility: <feasible|risky|infeasible>"
```

---

### `/ts-discover decide <id> [build|kill|keep-learning|reduce-scope]`

The decision point. Behavior depends on the chosen outcome.

```
build:
  - idea.status = "ready"
  - idea.ready_epics = ["EPIC-<SLUG>"]  (one or more, derived from
    exploration_output.bounded_contexts — usually one epic per idea unless
    bounded_contexts suggests a natural split)
  - idea.decision = "build"
  - Epic is NOT yet in plan.json — awaits /ts-project plan --sync
  - If validation was skipped (low uncertainty): note
    "validation skipped — no H-risk assumptions"
  - Confirm: "idea-<NNN> ready. Epic(s): <ready_epics>. Run
    /ts-project plan --sync to add to backlog."

kill:
  - idea.status = "killed"
  - idea.decision = "kill"
  - Write .ai/decisions/ADR-<NNN>.md documenting the kill rationale
    (from validation_output.decision_rationale)
  - Entry remains in discovery.json for audit — never deleted
  - Confirm: "idea-<NNN> killed. ADR-<NNN> written."

keep-learning:
  - idea.status returns to "exploring"
  - idea.keep_learning_count += 1
  - idea.decision = "keep-learning"
  - If keep_learning_count reaches 3: note will surface as "stale" in
    /ts-discover status
  - Confirm: "idea-<NNN> back to exploring (keep_learning_count=<N>)."

reduce-scope:
  - idea.status = "reduce-scope"
  - idea.decision = "reduce-scope"
  - Create 2+ new entries (status="idea"), each linking back via notes
    (e.g. "split from idea-001"); original idea's notes link forward to the
    new entries
  - Confirm: "idea-<NNN> split into: <new ids>. Explore each separately."
```

---

### `/ts-discover status`

Kanban view of the Discovery backlog.

```
Output:
  idea (N):       <id title>, ...
  exploring (N):  <id title> [stale — Nx keep-learning, decision required]
  validating (N): <id title>, ...
  ready (N):      <id title> [synced|not yet synced], ...
  killed (N):     <id title>, ...
  reduce-scope (N): <id title> → split into <ids>
  WIP: <exploring+validating>/3
```

Stale ideas (`keep_learning_count >= 3`) are flagged with a suggested next
step: re-run `/ts-discover validate` with updated assumptions, or force
`/ts-discover decide <id> [build|kill|reduce-scope]`.

---

### `/ts-discover idea --from-router` *(feedback intake — not user-invoked directly)*

Called by ts-deliver-router (Think or Build phase) when an unresolved
assumption meets its gating criteria. See ts-deliver-router's "Discovery
Feedback Hook" section for the gating criteria (a)/(b)/(c).

```
Params: description="<unresolved assumption>", source_epic="<active epic id>"

1. Run dedup check (see "Discovery State Machine" → Dedup above)
   → Match found: append "duplicate feedback received from <source_epic> on
     <date>" to matched entry's notes. STOP — no new entry.
   → No match: continue.
2. Append new entry: { id: "idea-<NNN>", title: "<description>",
   status: "idea", source_epic: "<source_epic>", keep_learning_count: 0,
   riskiest_assumptions: [], exploration_output: {}, validation_output: {},
   decision: null, ready_epics: [], synced_to_plan: false, notes: "" }
3. Return success/failure to caller (ts-deliver-router logs this in its own
   state.json.notes regardless of outcome — non-blocking on its side)
```

This entry now appears in `/ts-discover status` like any other `idea`-status
entry, and is picked up in the next Discovery round.

---

### `/ts-project plan --new "<vision>"`

Seeds Discovery for a new project. Does **not** create epics directly —
candidate modules/features become Discovery ideas (status=idea), which must
go through `explore` → `validate` → `decide build` before they can enter the
backlog via `--sync`.

```
Step 1 — Vision
  Q: "Describe the project in 2–3 sentences."
  Q: "What does success look like at the end of MVP?"
  Q: "Hard constraints? (deadline, team size, budget, tech stack)"

Step 2 — Seed Discovery
  → From the vision, identify candidate modules/feature areas
  → For each candidate: /ts-discover idea "<candidate title>"
  → If .ai/domain.json missing: "Run ts-event-storming-facilitator at the
    project level first? (yes/no)" — if yes, run it before seeding, and use
    bounded_contexts to refine the candidate list

Step 3 — Risk register (project-level)
  → Propose top 5 risks from vision + constraints
  → Human adds/removes
  → Write .ai/risks.md

Step 4 — Write skeleton plan.json
  → { project, vision, planned_at, releases: [], epics: [], constraints: [],
      refined_count: 0 }
  → Confirm: "Seeded N ideas into Discovery. Run /ts-discover explore on the
    highest-uncertainty idea first, or /ts-discover status to see the
    backlog."
```

**`plan.json` skeleton schema (written here, populated by `--sync`):**
```json
{
  "project": "<name>",
  "vision": "<2-3 sentences>",
  "planned_at": "<ISO>",
  "releases": [],
  "epics": [],
  "constraints": [],
  "refined_count": 0
}
```

---

### `/ts-project plan --sync [release-name]`

Pulls `status=ready` (and not yet `synced_to_plan`) items from
`discovery.json` into `plan.json`, grouped into a release.

```
1. Read discovery.json → filter: status=ready AND synced_to_plan=false
   → If none: "No ready items in Discovery backlog. Suggest:
     /ts-discover explore on the oldest 'idea' status entry, or
     /ts-discover status to review WIP." STOP. plan.json unchanged.

2. Determine release name:
   → If [release-name] given, use it.
   → Else: if plan.json.releases is empty, default to "MVP"; otherwise
     default to next sequential "IterN".

3. For each ready idea, for each id in ready_epics:
   → Append to plan.json.epics[]: { id, title (from idea.title or
     ready_epics naming), type (from idea — default "epic" unless
     idea.notes specifies refactor/bugfix), size, priority, depends_on
     (carried from idea, mapped to other ready_epics ids), release, notes }
   → Append id to plan.json.releases[<release-name>].epics[]
   → Set idea.synced_to_plan = true

4. If [release-name] release doesn't yet exist in plan.json.releases:
   → Create it: { name, goal: "<derived from synced epics' titles or
     prompt human>", exit_criteria: [<prompt human or derive>], epics: [...] }

5. Write plan.json. Optionally: Atlassian Rovo creates Jira Epics.
6. Confirm: "Synced N epics into release '<release-name>'. Run
   /ts-iteration start <release-name> to begin delivery."
```

---

### `/ts-iteration start <release>`

Loads epics for a named release, resolves sequencing, writes
`.ai/iteration.json`.

```
1. Read .ai/ts-project-planner/plan.json → filter epics for <release>
   → If empty: "No epics found for release <release> — run
     /ts-project plan --sync first." STOP. iteration.json not created.
2. Topological sort by depends_on[] → resolve sequence
3. Check for unresolved dependencies (epic from prior release not yet
   shipped):
   → Surface blocked epics. Human decides: include anyway, or proceed
     without.
4. Write .ai/iteration.json (status=queued for all, active_epic=null)
5. GitHub MCP: create milestone "<release>" if not exists
6. Atlassian Rovo: create Sprint or label epics with release tag
7. Confirm: "Iteration <release> started. N epics queued: [list in order]."
```

---

### `/ts-iteration next`

Advances to the next queued epic. Calls ts-deliver-router. Sequential only —
if an epic is already `active`, returns "Epic '<title>' is active — complete
or defer it before starting another."

```
1. Read .ai/iteration.json
   → If active_epic is already set: STOP (see above).
2. Find first epic with status=queued (respecting sequence order)
3. Set active_epic = epic.id, epic.status = active
4. Determine registry profile from epic.type (epic/refactor/bugfix)
5. If epic.type == bugfix: pre-check scope escalation signals (changes
   expected to span >3 files / migration required / new dependency / missing
   domain concept) BEFORE calling /ts-router init.
   → If any signal likely: surface to human, ask "re-type to epic/refactor or
     continue as bugfix?" before proceeding.
6. Call: /ts-router init
   → Pre-fills: project type, work unit type, phase activation, branch name
   → Passes: domain.json pattern group (or idea.exploration_output if
     epic originated from a Discovery idea), risks.md for G1
7. ts-deliver-router spine runs (Think→...→Reflect per type)
8. On ts-deliver-router /ts-router refine complete:
   → Read .ai/ts-deliver-router/state.json → extract mutation_score, shipped_at
   → Update .ai/iteration.json: epic.status=done, epic.mutation_score,
     epic.shipped_at
   → active_epic = null
9. Confirm: "Epic '<title>' complete. N epics remaining."
```

---

### `/ts-iteration status`

Print cross-epic progress for current release.

```
Output:
  Release:      <name> — <goal>
  Progress:     N/N epics done
  Active:       <epic title> — Phase: <current phase> — Mutation: <score>%
  Queue:        [epic titles in order]
  Deferred:     [epic titles]
  Risks open:   N (from .ai/risks.md)
  Next gate:    <G1|G2> on epic <title>
```

---

### `/ts-iteration close`

Closes the current release. Requires all epics done or explicitly deferred.

```
1. Verify all iteration.json epics are status=done or status=deferred
   → If any active: "Close blocked — epic '<title>' still active."
2. GitHub MCP: close milestone, create release tag "v<N>"
3. Atlassian Rovo: transition all release Jira issues → Done
4. Retrospective:
   → Summarise: epics completed, deferred, mutation scores, G1/G2 pass rates
   → Write .ai/ts-project-planner/retrospectives/<release>-retro.md
   → Confluence: publish retro page
5. Update .ai/ts-project-planner/plan.json:
   → Deferred epics → carry forward to next release
   → refined_count++
6. Confirm: "Iteration <release> closed. <N> shipped, <N> deferred. Discovery
   has been running in parallel — run /ts-discover status to check for new
   ready items for the next release."
```

---

### `/ts-project status`

Print cross-iteration progress.

```
Output:
  Project:      <name>
  Current:      <release name>
  Releases:     MVP ✓  |  Iter-2 ● active  |  Iter-3 ○ queued
  Total epics:  N done / N total
  Discovery:    N ready (unsynced) | N exploring/validating (WIP M/3) | N idea
  Risk register: N open risks
  Last ADR:     ADR-NNN <title> <date>
```

---

### `/ts-project refine`

Update the project backlog after an iteration closes or when scope changes.

```
1. Review deferred epics — still relevant?
2. Review discovery.json: any stale ideas (keep_learning_count >= 3) needing
   a forced decision?
3. Add newly discovered epics (from retro findings, --from-router ideas now
   decided build, or domain changes)
4. Re-prioritise release assignments
5. Update risks.md
6. Re-run ts-event-storming-facilitator if domain has evolved? (prompt)
7. Write updated plan.json (refined_count++)
8. Confirm: "Plan refined. N epics total across N releases. Discovery: N
   ready awaiting sync."
```

---

## Integration with ts-deliver-router

### How ts-project-planner pre-fills /ts-router init

When `/ts-iteration next` calls `/ts-router init`, it passes:

```
type:               <from epic.type in iteration.json>
domain_file:        .ai/domain.json
risks_file:         .ai/risks.md
acpl_pattern_group: <from domain.json, or from the originating discovery idea's
                      exploration_output if the epic came from --sync>
phase_activation:   <derived from type — see Work Unit Types table>
branch_name:        <feat|refactor|fix>/<epic-title-slug>
```

ts-deliver-router reads these to skip its own interview for fields already
known.

### How ts-deliver-router writes back to shared zone

ts-deliver-router ONLY writes these fields in `iteration.json`:
```
epics[active_epic].status        = "done"
epics[active_epic].branch        = "<branch name>"
epics[active_epic].mutation_score = <number>
epics[active_epic].shipped_at    = "<ISO>"
active_epic                      = null
```

It never writes to `plan.json` or `retrospectives/`.

### Discovery feedback hook contract (discovery.json)

ts-deliver-router has **append-only** access to `discovery.json`, restricted
to creating new entries via `/ts-discover idea --from-router` with
`source_epic` set (dedup-checked, per "Discovery State Machine" above).

ts-deliver-router MUST NOT modify, on any existing entry:
```
status, decision, ready_epics, synced_to_plan, keep_learning_count,
exploration_output, validation_output, notes (except via the dedup
append path, which this skill's command performs — not ts-deliver-router
directly)
```

This preserves a single point of decision authority over Discovery: only
`/ts-discover decide` (human-invoked, this skill) can move an idea to
`ready`/`killed`/`reduce-scope`.

### G1 gate enrichment

ts-deliver-router reads `.ai/risks.md` during Review G1. Any `open` risk
relevant to the current epic is surfaced in the STRIDE checklist
automatically. Separately, ts-deliver-router's G1 also surfaces (advisory,
non-blocking) any `discovery.json` entry with `source_epic` = the current
epic and `status` not in `{ready, killed}` — see ts-deliver-router's
"Discovery Feedback Hook" section.

---

## Skills & Agents Used

| Tool | Layer | Role |
|---|---|---|
| `ts-event-storming-facilitator` sub-agent | Layer D | Domain decomposition → exploration_output (events/commands/aggregates/bounded_contexts/pattern group) |
| `first-principles-agent` | Layer D | Challenge framing during `/ts-discover explore` → riskiest_assumptions |
| `council-advisor` | Layer D | Pressure-test H-risk assumptions during `/ts-discover validate` |
| `tows-strategy-analyst` | Layer D | Strategic fit assessment during `/ts-discover validate` |
| `critical-thinker` | Layer D+1 | Challenge validation rationale; challenge epic sequencing in `/ts-iteration start` |
| `ts-deliver-router` | Layer 2 | Per-epic development spine |
| Atlassian Rovo MCP | Layer D+0+1 | Create Epics/Sprints; transition issues; publish retros |
| GitHub MCP | Layer 1 | Milestones; release tags; per-epic branches |

---

## Reference Files

| File | When to read |
|---|---|
| `references/workspace-spec.md` | On first use — full `.ai/` layout contract and schemas |
| `references/discovery-kanban.md` | Discovery stage criteria, WIP limit, stale rule, dedup algorithm |
| `references/iteration-schema.md` | Full `iteration.json` field reference |
| `references/work-unit-profiles.md` | Registry profiles per work unit type |
