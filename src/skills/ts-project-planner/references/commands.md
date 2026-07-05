## Commands
Layer-ordered. Discovery → Backlog → Delivery.

### `/ts-discover idea "<desc>"`
Seeds Discovery backlog with new candidate.
```
1. Read .agents/discovery.json (create if missing: { project, ideas: [] })
2. Append new entry: { id: "idea-<NNN>", title: "<desc>", status: "idea",
   source_epic: null, keep_learning_count: 0, riskiest_assumptions: [],
   exploration_output: {}, validation_output: {}, decision: null,
   ready_epics: [], synced_to_plan: false, notes: "" }
3. Confirm: "idea-<NNN> '<desc>' added — status=idea"
```
`/ts-project plan --new` calls once per candidate from vision interview.

### `/ts-discover explore <id>`
Problem Understanding + Solution Exploration. WIP-limited.
```
1. Check WIP: count ideas with status in {exploring, validating}.
   → If already 3: "WIP limit reached (3/3) — finish or defer an in-flight
     idea first." STOP.
2. Run ts-event-storming-facilitator (REQUIRED — explore cannot exit without
   its output; installed at .claude/agents/ts-event-storming-facilitator.md):
   → domain_events, commands, aggregates, bounded_contexts
   → consult ts-acpl problem-frame-map.md → acpl_pattern_group
3. Run first-principles-agent:
   → challenge the framing → riskiest_assumptions[] (each tagged H/M/L)
4. Write idea.exploration_output, idea.riskiest_assumptions
5. GATE (shape, not just presence): validate exploration_output against the
   facilitator's own output contract (src/agents/ts-event-storming-facilitator.md):
   - domain_events, commands, aggregates, bounded_contexts: each MUST be a
     JSON array with length >= 1, every element a non-empty string
   - acpl_pattern_group: MUST be a non-empty string
   - problem_frame (if present): MUST be one of
     Commanded|Information|Workpiece|Transformation|Control
   - ubiquitous_language_terms (if present): MUST be an array of strings
   A structurally malformed-but-non-empty value (wrong type, empty-string
   elements, an object where an array is expected) fails this gate exactly
   like an empty array does. → status stays "idea". Report which field(s)
   failed shape validation (name the field and the expected vs actual shape)
   and re-run ts-event-storming-facilitator. Do NOT proceed to step 6.
6. idea.status = "exploring"
7. Confirm: "idea-<NNN> explored. Riskiest: <top H-risk assumption, if any>.
   <Validation required|Validation optional — no H-risk assumptions>."
```

### `/ts-discover validate <id>`
Mandatory if `riskiest_assumptions` has `H`-risk. Optional otherwise — skip to decide build.
```
1. Run council-advisor: pressure-test each H-risk assumption
2. Run tows-strategy-analyst: assess strategic fit
3. Run ts-ddd-tactical-validator (Mode A) on idea.exploration_output
   (installed at .claude/agents/ts-ddd-tactical-validator.md — always runs
   whenever validate runs)
4. Optionally run critical-thinker for sequencing/dependency challenges
5. GATE (shape, not just presence) on ddd_validation before writing it —
   validate against the validator's own output contract
   (src/agents/ts-ddd-tactical-validator.md):
   - mode: MUST be exactly "A" or "B"
   - recommendation: MUST be exactly one of PASS|NEEDS_ATTENTION|FAIL
     (reject typos/case variants — do not coerce)
   - violations: MUST be an array (empty allowed); each element, if any,
     MUST have check/detail/location as non-empty strings
   - ubiquitous_language_coverage (if present, non-null): MUST be a number
     in [0, 1]
   If ddd_validation fails shape validation, treat it as ABSENT — do not
   write the malformed value. Report the shape failure and re-run
   ts-ddd-tactical-validator before proceeding.
6. Write idea.validation_output = { feasibility, council_verdict,
   decision_rationale, ddd_validation }
7. idea.status = "validating"
8. Confirm: "idea-<NNN> validated — feasibility: <feasible|risky|infeasible>"
```

### `/ts-discover decide <id> [build|kill|keep-learning|reduce-scope]`
Decision point. Behavior per outcome:
```
build:
  - PRECONDITION: validation_output.ddd_validation exists, passes the same
    shape gate as `/ts-discover validate` step 5 (mode/recommendation/
    violations/ubiquitous_language_coverage), and has recommendation != "FAIL".
    Absent OR shape-invalid (validate was skipped, or a malformed value was
    never written per the shape gate) are the SAME case: run
    ts-ddd-tactical-validator (Mode A) NOW and write validation_output.ddd_validation
    before deciding. If recommendation == "FAIL": STOP — surface violations;
    suggest keep-learning or reduce-scope instead.
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
  - Write .agents/decisions/ADR-<NNN>.md documenting the kill rationale
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

### `/ts-discover status`
Kanban view of Discovery backlog.
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
Stale (`keep_learning_count >= 3`) flagged. Suggest: re-run validate or force decide [build|kill|reduce-scope].

### `/ts-discover idea --from-router` *(feedback intake — not user-invoked)*
Gating criteria (a)/(b)/(c) defined in ts-deliver-router Discovery Feedback Hook.
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
Entry appears in /ts-discover status. Picked up next Discovery round.

### `/ts-project plan --new "<vision>"`
Seeds Discovery for new project. Does NOT create epics — candidates become ideas (status=idea), requiring explore → validate → decide build before --sync.
```
Step 1 — Vision
  Q: "Describe the project in 2–3 sentences."
  Q: "What does success look like at the end of MVP?"
  Q: "Hard constraints? (deadline, team size, budget, tech stack)"

Step 2 — Seed Discovery
  → From the vision, identify candidate modules/feature areas
  → For each candidate: /ts-discover idea "<candidate title>"
  → If .agents/domain.json missing: "Run ts-event-storming-facilitator at the
    project level first? (yes/no)" — if yes, run it before seeding, and use
    bounded_contexts to refine the candidate list

Step 3 — Risk register (project-level)
  → Propose top 5 risks from vision + constraints
  → Human adds/removes
  → Write .agents/risks.md

Step 4 — Write skeleton plan.json
  → { project, vision, planned_at, releases: [], epics: [], constraints: [],
      refined_count: 0 }
  → Confirm: "Seeded N ideas into Discovery. Run /ts-discover explore on the
    highest-uncertainty idea first, or /ts-discover status to see the
    backlog."
```
`plan.json` skeleton (populated by `--sync`):
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

### `/ts-project plan --sync [release-name]`
Pulls status=ready, synced_to_plan=false from discovery.json → plan.json grouped into release.
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

### `/ts-iteration start <release>`
Loads release epics, resolves sequencing, writes .agents/iteration.json.
```
1. Read .agents/ts-project-planner/plan.json → filter epics for <release>
   → If empty: "No epics found for release <release> — run
     /ts-project plan --sync first." STOP. iteration.json not created.
2. Topological sort by depends_on[] → resolve sequence
3. Check for unresolved dependencies (epic from prior release not yet
   shipped):
   → Surface blocked epics. Human decides: include anyway, or proceed
     without.
4. Write .agents/iteration.json (status=queued for all, active_epic=null)
5. GitHub MCP: create milestone "<release>" if not exists
6. Atlassian Rovo: create Sprint or label epics with release tag
7. Confirm: "Iteration <release> started. N epics queued: [list in order]."
```

### `/ts-iteration next`
Next queued epic. Calls ts-deliver-router. Sequential — active_epic set → returns error.
```
1. Read .agents/iteration.json
   → If active_epic is already set: STOP (see above).
2. Find first epic with status=queued (respecting sequence order)
3. Set active_epic = epic.id, epic.status = active
4. Determine registry profile from epic.type
   (epic/feature/refactor/bugfix/hotfix/chore/patch/spike/ops)
5. If epic.type == bugfix: pre-check scope escalation signals (changes
   expected to span >3 files / migration required / new dependency / missing
   domain concept) BEFORE calling /ts-deliver init.
   → If any signal likely: surface to human, ask "re-type to epic/refactor or
     continue as bugfix?" before proceeding.
6. Call: /ts-deliver init
   → Pre-fills: project type, work unit type, phase activation, branch name
   → Passes: domain.json pattern group (or idea.exploration_output if
     epic originated from a Discovery idea), risks.md for G1
7. ts-deliver-router spine runs (Think→...→Reflect per type)
8. On ts-deliver-router /ts-deliver refine complete:
   → Read .agents/ts-deliver-router/state.json → extract mutation_score, shipped_at
   → Update .agents/iteration.json: epic.status=done, epic.mutation_score,
     epic.shipped_at
   → active_epic = null
9. Confirm: "Epic '<title>' complete. N epics remaining."
```

### `/ts-iteration status`
Cross-epic progress for current release.
```
Output:
  Release:      <name> — <goal>
  Progress:     N/N epics done
  Active:       <epic title> — Phase: <current phase> — Mutation: <score>%
  Queue:        [epic titles in order]
  Deferred:     [epic titles]
  Risks open:   N (from .agents/risks.md)
  Next gate:    <G1|G2> on epic <title>
```

### `/ts-iteration close`
Closes release. All epics must be done or deferred.
```
1. Verify all iteration.json epics are status=done or status=deferred
   → If any active: "Close blocked — epic '<title>' still active."
2. GitHub MCP: close milestone, create release tag "v<N>"
3. Atlassian Rovo: transition all release Jira issues → Done
4. Retrospective:
   → Summarise: epics completed, deferred, mutation scores, G1/G2 pass rates
   → Write .agents/ts-project-planner/retrospectives/<release>-retro.md
   → Confluence: publish retro page
5. Update .agents/ts-project-planner/plan.json:
   → Deferred epics → carry forward to next release
   → refined_count++
6. Confirm: "Iteration <release> closed. <N> shipped, <N> deferred. Discovery
   has been running in parallel — run /ts-discover status to check for new
   ready items for the next release."
```

### `/ts-project status`
Cross-iteration progress.
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

### `/ts-project refine`
Update backlog after iteration close or scope change.
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
