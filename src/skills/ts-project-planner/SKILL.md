---
name: ts-project-planner
description: >
  Dual-track agile project planner. Three layers: Discovery (idea → explore →
  validate → decide), Backlog (plan → sync), and Delivery (iteration sequencing
  via ts-deliver-router). Activate on: project planning, backlog grooming,
  iteration setup, discovery tasks, "plan my MVP", "what epics are next",
  "break this down", "start iteration", "what's the status across all epics".
  Works WITH ts-deliver-router — does NOT replace it.
---

# ts-project-planner

Three-layer dual-track agile engine. Manages product discovery and delivery
iteration orchestration. Does not replace ts-deliver-router — calls it.

---

## Workspace

All artifacts follow the `.ai/` workspace convention defined in
`references/workspace-spec.md`. Read it before first use.

```
.ai/                              ← workspace root
├── WORKSPACE.md                  ← layout contract (created by /ts-router init)
├── discovery.json                ← Ready-for-Delivery buffer (primary writer: this skill)
│                                    ts-deliver-router: APPEND-ONLY via --from-router
├── domain.json                   ← shared: ES domain model (read here)
├── iteration.json                ← shared: current release state (primary writer)
├── risks.md                      ← shared: risk register (primary writer)
├── decisions/                    ← shared: ADRs (read + append)
├── ts-deliver-router/            ← private to ts-deliver-router
└── ts-project-planner/
    ├── plan.json                 ← private: full project backlog
    └── retrospectives/           ← private: per-iteration retros
```

---

## Architecture

```
Layer D — Discovery (this skill, NEW)
  /ts-discover idea       → seed discovery.json with status=idea
  /ts-discover explore    → event storming + risk identification
  /ts-discover validate   → feasibility + strategic fit analysis
  /ts-discover decide     → build / kill / keep-learning / reduce-scope
  /ts-discover status     → Kanban board of discovery backlog

Layer 0 — Backlog (this skill)
  /ts-project plan --new  → seed Discovery with candidate ideas
  /ts-project plan --sync → pull status=ready → plan.json as epics
  /ts-project status      → cross-iteration progress
  /ts-project refine      → update backlog after iteration close

Layer 1 — Delivery (this skill)
  /ts-iteration start     → load epics → .ai/iteration.json
  /ts-iteration next      → advance to next epic → /ts-router init
  /ts-iteration status    → cross-epic progress in current release
  /ts-iteration close     → release tag + retro + promote next

Layer 2 — ts-deliver-router (separate skill, called per epic)
  /ts-router init  →  ...7-phase spine...  →  /ts-router refine
```

Per Aktia dual-track agile: Discovery and Delivery run **continuously and in
parallel**, at different cadences. While Release N is in Delivery, Release N+1's
candidate modules are in Discovery.

---

## Discovery State Machine

States: `idea` → `exploring` → `validating` → `ready` / `killed` / `reduce-scope`

**Transitions:**
- `idea` → `exploring`: `/ts-discover explore`
- `exploring` → `validating`: `/ts-discover validate` (mandatory when H-risk assumptions exist)
- `exploring` → `ready`: `/ts-discover decide build` (allowed when NO H-risk assumptions — validation skip)
- `validating` → `ready`: `/ts-discover decide build`
- `validating` → `killed`: `/ts-discover decide kill`
- `validating` → `reduce-scope`: `/ts-discover decide reduce-scope`
- `validating` → `exploring`: `/ts-discover decide keep-learning` (keep_learning_count++)
- `exploring` → `killed`: `/ts-discover decide kill`
- `exploring` → `reduce-scope`: `/ts-discover decide reduce-scope`
- `reduce-scope` → child ideas created with `status=idea`

**WIP limit:** Max 3 ideas concurrently in `exploring` + `validating` combined.
`/ts-discover explore` blocked at capacity: "WIP limit reached (3/3) — finish or
defer an in-flight idea first."

**Stale rule:** `keep_learning_count >= 3` → flagged "stale — 3× keep-learning,
decision required" in `/ts-discover status`. Advisory, not blocking.

**Validation skip:** If `riskiest_assumptions` contains zero H-risk items after
exploration, `validate` is optional. Idea can go directly from `exploring` to
`ready` via `/ts-discover decide build`. Note records "validation skipped — low
uncertainty."

**Dedup (--from-router):** Before creating a new feedback idea, title-similarity
check against all existing ideas. If match → append note to existing idea
("duplicate feedback received from <source_epic> on <date>"), no new entry.

Full stage entry/exit criteria: `references/discovery-kanban.md`.

---

## Work Unit Types

Three types — each maps to a different ts-deliver-router registry profile.

| Type | Active Phases | Gates | Mutation Target | Branch |
|---|---|---|---|---|
| **epic** | Full 7 phases | G1 + G2 | Per stage (60→85%) | `feat/<name>` |
| **refactor** | Think→Build→Review→Test→Reflect (no Ship) | G1 only | 90% (regression guard) | `refactor/<name>` |
| **bugfix** | Plan→Build→Test→Ship (no Think/Reflect) | G2 only | 80% | `fix/<name>` |

At `/ts-router init`, the `type` field in `iteration.json` pre-populates the
registry profile — phases activated/skipped automatically.

---

## Commands

### `/ts-discover idea "<title>"`

Add a new idea to `.ai/discovery.json` with `status=idea`.

```
1. If .ai/discovery.json doesn't exist, create it as empty array
2. Generate next id (idea-NNN following existing sequence)
3. Append entry: {id, title, status:"idea", source_epic:null, keep_learning_count:0,
   riskiest_assumptions:[], exploration_output:{}, validation_output:{},
   decision:null, ready_epics:[], depends_on:[], synced_to_plan:false, notes:""}
4. Confirm: "Idea <id> '<title>' added to discovery backlog."
```

### `/ts-discover idea --from-router`

Feedback hook target. Called by ts-deliver-router when Think or Build surfaces an
unknown that meets gating criteria:
- (a) blocks a gate (G1/G2), OR
- (b) affects more than one epic's scope, OR
- (c) introduces a new external dependency

```
1. Receive: description, source_epic
2. Dedup check: compare description against existing idea titles (case-insensitive,
   stopword-removed). If similar match found → append note to existing idea, STOP
3. Create entry with source_epic set, status=idea
4. Confirm or log result in state.json notes
```

Minor implementation details that don't meet (a)/(b)/(c) → logged in
ts-deliver-router `state.json` notes, NOT surfaced to Discovery.

### `/ts-discover explore <id>`

Analyze domain events, aggregates, and riskiest assumptions for an idea.

```
1. Check WIP limit: count exploring + validating. If >= 3 → STOP with WIP message
2. Run ts-event-storming-facilitator → domain_events, aggregates
3. Consult ts-acpl via problem-frame-map → acpl_pattern_group
4. Run first-principles-agent → challenge framing → riskiest_assumptions[]
5. Populate exploration_output: {domain_events, aggregates, acpl_pattern_group}
6. Set status = "exploring"
7. Confirm: "Idea <id> explored. N assumptions identified (N high-risk)."
```

If ts-event-storming-facilitator not available: degrade to first-principles-agent
only. exploration_output.domain_events/aggregates will be empty;
acpl_pattern_group falls back to manual classification via ts-acpl problem-frame-map.

### `/ts-discover validate <id>`

Validate high-risk assumptions for feasibility and strategic fit.

```
1. Verify idea has status=exploring and H-risk assumptions exist
2. Run council-advisor → evaluate H-risk assumptions
3. Run tows-strategy-analyst → assess strategic fit
4. Populate validation_output: {feasibility, rationale}
5. Set status = "validating"
6. Confirm: "Idea <id> under validation. Feasibility: <result>."
```

### `/ts-discover decide <id> [build|kill|keep-learning|reduce-scope]`

Make a product decision on an idea.

**decide build:**
```
1. If status=validating: proceed
   If status=exploring AND no H-risk assumptions: proceed (validation skip)
   Otherwise: STOP — "Validate first — H-risk assumptions exist"
2. Set status = "ready"
3. Generate ready_epics = ["EPIC-<TITLE-SLUG>"]
4. Record note if validation was skipped
5. Epic is NOT yet in plan.json — awaits /ts-project plan --sync
```

**decide kill:**
```
1. Set status = "killed"
2. Write .ai/decisions/ADR-NNN.md documenting kill rationale
3. Entry remains in discovery.json for audit trail (never deleted)
```

**decide keep-learning:**
```
1. Set status back to "exploring"
2. Increment keep_learning_count
3. Idea remains in discovery backlog for next round
```

**decide reduce-scope:**
```
1. Set status = "reduce-scope"
2. Create N child ideas with status=idea, ids derived from parent (e.g. idea-001a, idea-001b)
3. Parent idea.notes = "split into idea-001a, idea-001b"
4. Child idea.notes = "split from idea-001"
5. Bidirectional note links preserved for audit trail
```

### `/ts-discover status`

Show discovery Kanban board.

```
Output grouped by status:
  idea (N):        idea-004 HR/Payroll, idea-005 Sales Order Mgmt
  exploring (N):   idea-006 Manufacturing (stale — 3× keep-learning)
  validating (N):
  ready (N):       idea-001a GL-Core, idea-002 Procurement
  killed (N):
  WIP: N/3 (exploring+validating)

Stale ideas flagged: "stale — 3× keep-learning, decision required"
Suggest: "Re-run /ts-discover validate, or /ts-discover decide <id> [build|kill|reduce-scope]"
```

### `/ts-project plan --new "<vision>"`

Seed candidate ideas into discovery.json from a project vision.

```
Step 1 — Vision
  Q: "Describe the project in 2–3 sentences."
  Q: "What does success look like at the end of MVP?"
  Q: "Hard constraints? (deadline, team size, budget, tech stack)"

Step 2 — Domain (optional, if domain.json exists skip to Step 3)
  → If .ai/domain.json missing: "Run ts-event-storming-facilitator first? (yes/no)"
  → If yes: invoke ts-event-storming-facilitator → writes .ai/domain.json
  → Read domain.json: bounded_contexts → suggest candidate modules

Step 3 — Seed Discovery
  → Parse vision into candidate module names
  → For each module: create discovery.json entry with status=idea
  → Do NOT write plan.json yet (no ready items exist)
  → Confirm: "N ideas seeded to discovery backlog. Run /ts-discover explore on
    highest-uncertainty ideas first."
```

### `/ts-project plan --sync`

Pull `status=ready` items from `discovery.json` into `plan.json` as epics.

```
1. Read discovery.json → filter entries with status=ready AND synced_to_plan=false
2. If zero: return "No ready items in discovery backlog"
   Suggest: "Run /ts-discover explore on the oldest 'idea' status entry"
3. For each ready entry: create epic in plan.json with depends_on carried over
4. Group into release (prompt human for release name or default "MVP")
5. Mark synced_to_plan=true on discovery.json entries
6. Write .ai/ts-project-planner/plan.json
7. Confirm: "N epics synced to plan.json release '<name>'."
```

### `/ts-project status`

Print cross-iteration progress.

```
Output:
  Project:      <name>
  Current:      <release name>
  Releases:     MVP ✓  |  Iter-2 ● active  |  Iter-3 ○ queued
  Total epics:  N done / N total
  Discovery:    N ideas | N exploring | N ready
  Risk register: N open risks
  Last ADR:     ADR-NNN <title> <date>
```

### `/ts-project refine`

Update the project backlog after an iteration closes or when scope changes.

```
1. Review deferred epics — still relevant?
2. Add newly discovered epics (from retro findings or domain changes)
3. Re-prioritise release assignments
4. Update risks.md
5. Re-run ts-event-storming-facilitator if domain has evolved? (prompt)
6. Write updated plan.json (refined_count++)
7. Confirm: "Plan refined. N epics total across N releases."
```

### `/ts-iteration start <release>`

Load epics for a named release, resolve sequencing, write `.ai/iteration.json`.

```
1. Read .ai/ts-project-planner/plan.json → filter epics for <release>
2. If zero epics: "No epics found for release <name> — run /ts-project plan --sync first"
   Suggest checking /ts-discover status for ready items
3. Topological sort by depends_on[] → resolve sequence
4. Check for unresolved dependencies (epic from prior release not yet shipped):
   → Surface blocked epics. Human decides: defer or proceed.
5. Write .ai/iteration.json (status=queued for all, active_epic=null)
6. GitHub MCP: create milestone "<release>" if not exists
7. Atlassian Rovo: create Sprint or label epics with release tag
8. Confirm: "Iteration <release> started. N epics queued: [list in order]."
```

### `/ts-iteration next`

Advance to the next queued epic. Calls ts-deliver-router.

```
1. Read .ai/iteration.json
2. Find first epic with status=queued (respecting sequence order)
3. Set active_epic = epic.id, epic.status = active
4. Look up discovery.json entry for this epic → get acpl_pattern_group from
   exploration_output
5. Call: /ts-router init
   → Pre-fills: type, acpl_pattern_group, branch_name, risks_file, phase_activation
6. ts-deliver-router spine runs (Think→...→Reflect per type)
7. On ts-deliver-router complete:
   → Read .ai/ts-deliver-router/state.json → extract mutation_score, shipped_at
   → Update .ai/iteration.json: epic.status=done, mutation_score, shipped_at
   → active_epic = null
8. Confirm: "Epic '<title>' complete. N epics remaining."
```

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

### `/ts-iteration close`

Close the current release. Requires all epics done or explicitly deferred.

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
6. Suggest: "Run /ts-discover status — Discovery has been running in parallel;
   check for new ready items for next iteration."
7. Confirm: "Iteration <release> closed. N shipped, N deferred."
```

---

## Write Ownership

| Artifact | ts-project-planner | ts-deliver-router |
|---|---|---|
| `discovery.json` | **Full R/W** | APPEND-ONLY via `--from-router` (new entries only; cannot modify status, decision, or ready_epics on existing entries) |
| `plan.json` | **Full R/W** | — |
| `iteration.json` | **W** (all fields) | W (status, branch, mutation_score, shipped_at, active_epic only) |
| `risks.md` | **W** (primary writer) | R (G1 gate) |
| `decisions/` | R/W | R/W |
| `ts-deliver-router/*` | R (iteration fields only) | **W** |
| `ts-project-planner/*` | **W** | — |

---

## Integration with ts-deliver-router

### Pre-fill at /ts-router init

When `/ts-iteration next` calls `/ts-router init`, it passes:

```
type:               <from epic.type in iteration.json>
domain_file:        .ai/domain.json
risks_file:         .ai/risks.md
acpl_pattern_group: <from discovery.json exploration_output>
phase_activation:   <derived from type — see Work Unit Types table>
branch_name:        <feat|refactor|fix>/<epic-title-slug>
```

### Write-back from ts-deliver-router

ts-deliver-router ONLY writes these fields in `iteration.json`:
```
epics[active_epic].status        = "done"
epics[active_epic].branch        = "<branch name>"
epics[active_epic].mutation_score = <number>
epics[active_epic].shipped_at    = "<ISO>"
active_epic                      = null
```

It never writes to `plan.json` or `retrospectives/`.

### Feedback hook (Discovery re-entry)

ts-deliver-router calls `/ts-discover idea --from-router` when Think or Build
surfaces an unknown meeting gating criteria (a)/(b)/(c). This creates a
discovery.json entry linked to the active epic. The hook is non-blocking — if
ts-project-planner is unavailable, the failure is logged and the phase continues.

### G1 gate enrichment

ts-deliver-router reads `.ai/risks.md` during Review G1. Open risks relevant to
the current epic are surfaced in the STRIDE checklist. If a `--from-router` idea
linked to this epic has `status=idea` (unresolved), G1 surfaces it — advisory,
not hard-blocking.

---

## Skills & Agents Used

| Tool | Layer | Role |
|---|---|---|
| `ts-event-storming-facilitator` | Layer D + 0 | Domain decomposition → epic boundaries |
| `first-principles-agent` | Layer D | Challenge framing, produce riskiest_assumptions |
| `council-advisor` | Layer D | Evaluate H-risk assumptions |
| `tows-strategy-analyst` | Layer D | Strategic fit assessment |
| `critical-thinker` | Layer 1 | Challenge epic sequencing |
| `ts-deliver-router` | Layer 2 | Per-epic development spine |
| `ts-acpl` | Layer D | Problem-frame-map consultation |
| Atlassian Rovo MCP | Layer 0+1 | Create Epics/Sprints; transition issues; publish retros |
| GitHub MCP | Layer 1 | Milestones; release tags; per-epic branches |

---

## Reference Files

| File | When to read |
|---|---|
| `references/workspace-spec.md` | On first use — full `.ai/` layout contract, schemas, R/W matrix |
| `references/iteration-schema.md` | Full `iteration.json` field reference + worked example |
| `references/work-unit-profiles.md` | Registry profiles per work unit type (epic/refactor/bugfix) |
| `references/discovery-kanban.md` | Discovery stage criteria, WIP limit, stale rule, dedup algorithm |
