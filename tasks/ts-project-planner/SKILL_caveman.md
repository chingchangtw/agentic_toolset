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

# ts-project-planner (caveman)

3 layers, dual-track agile (Aktia):
  LayerD=Discovery: idea→explore→validate→decide → Ready-for-Delivery buffer
         (.ai/discovery.json)
  Layer0=Backlog: sync ready items → release map+epic backlog
         (.ai/ts-project-planner/plan.json)
  Layer1=Delivery: sequence epics/release → call ts-deliver-router per epic
  Layer2=ts-deliver-router (unchanged, per-epic spine)

Both tracks run continuously+parallel. Feedback hook (--from-router) re-enters
Discovery when Delivery surfaces unknown. Does NOT replace ts-deliver-router.

Workspace: .ai/ root. Read references/workspace-spec.md on first use.

---

## DISCOVERY STATE MACHINE (.ai/discovery.json)

schema: {project, ideas:[{id,title,status,source_epic,keep_learning_count,
  riskiest_assumptions:[{assumption,risk:H|M|L,validated}],exploration_output:
  {domain_events,commands,aggregates,bounded_contexts,acpl_pattern_group},
  validation_output:{feasibility,council_verdict,decision_rationale},
  decision,ready_epics:[],synced_to_plan,notes}]}

transitions:
  idea --explore--> exploring --validate--> validating
  exploring --(low-uncertainty: skip validate)--decide build--> ready
  validating --decide build--> ready
  validating --decide kill--> killed (+ADR, terminal)
  validating --decide keep-learning--> exploring (keep_learning_count++)
  {exploring,validating} --decide reduce-scope--> reduce-scope (terminal,
    splits into 2+ new 'idea' entries, origin linked both ways)

WIP limit: 3 = count(status in {exploring,validating}). enforced at explore only.
stale rule: keep_learning_count>=3 → flagged in /ts-discover status (advisory,
  not blocking). suggest forced decide.
dedup (--from-router only): Jaccard similarity >0.5 on normalized title tokens
  vs all existing entries (any status) → match: append note "duplicate feedback
  from <source_epic> on <date>", no new entry. no match: create entry.
  full algorithm+example: references/discovery-kanban.md

source_epic≠null marks --from-router entries. no entry ever deleted (audit).

---

## WORK UNIT TYPES

| type | phases | gates | mutation | branch |
|---|---|---|---|---|
| epic | full 7 | G1+G2 | 60→85% by stage | feat/<name> |
| refactor | Think→Build→Review→Test→Reflect | G1 only | 90% | refactor/<name> |
| bugfix | Plan→Build→Test→Ship | G2 only | 80% | fix/<name> |

set at /ts-discover decide build (from exploration_output+validation_output).
/ts-router init reads type → pre-activates correct phases.

---

## COMMANDS (ordered: Discovery → Backlog → Delivery)

### /ts-discover idea "<desc>"
append discovery.json entry: {id:idea-NNN,title:<desc>,status:idea,
  source_epic:null,keep_learning_count:0,...defaults}. confirm.
called by /ts-project plan --new per candidate module.

### /ts-discover explore <id>
WIP check (3/3 → STOP, finish/defer first).
run ts-event-storming-facilitator → exploration_output (events/commands/
  aggregates/bounded_contexts/acpl_pattern_group via ts-acpl problem-frame-map).
run first-principles-agent → riskiest_assumptions[] (H/M/L tagged).
status→exploring. confirm: "explored. <H-risk?> validation required|optional."

### /ts-discover validate <id>
mandatory only if any riskiest_assumptions[].risk==H; else optional.
run council-advisor (pressure-test H-risks) + tows-strategy-analyst (strategic
  fit) [+critical-thinker for sequencing].
validation_output={feasibility,council_verdict,decision_rationale}.
status→validating. confirm feasibility.

### /ts-discover decide <id> [build|kill|keep-learning|reduce-scope]
build: status→ready. ready_epics=[EPIC-<SLUG>] (from bounded_contexts, usually
  1 per idea). NOT yet in plan.json — needs /ts-project plan --sync.
kill: status→killed (terminal). write ADR-NNN.md w/ decision_rationale. entry
  stays (audit).
keep-learning: status→exploring. keep_learning_count++. (stale @3x, advisory)
reduce-scope: status→reduce-scope (terminal). create 2+ new idea entries,
  bidirectional notes link.

### /ts-discover status
kanban: idea(N) | exploring(N)[stale flags] | validating(N) | ready(N)
  [synced|unsynced] | killed(N) | reduce-scope(N)→splits | WIP: x/3

### /ts-discover idea --from-router  (feedback intake, not user-invoked)
called by ts-deliver-router Think/Build when unknown meets gating (a)/(b)/(c).
params: description, source_epic=<active epic id>.
dedup check first (Jaccard>0.5 → append note to match, no new entry).
no match → create entry (source_epic set, status=idea).
ts-deliver-router logs success/fail in its own state.json.notes (non-blocking).

### /ts-project plan --new "<vision>"
seeds Discovery — does NOT create epics directly.
  Step1: vision/success/constraints (interview)
  Step2: identify candidate modules → /ts-discover idea per candidate.
         if domain.json missing: offer project-level ts-event-storming-facilitator
         → refine candidates via bounded_contexts
  Step3: risks — propose top5 → human edits → write risks.md
  Step4: write skeleton plan.json {project,vision,planned_at,releases:[],
         epics:[],constraints:[],refined_count:0}
  confirm "seeded N ideas. /ts-discover explore highest-uncertainty first."

### /ts-project plan --sync [release-name]
pull discovery.json: status=ready AND synced_to_plan=false.
  none → "no ready items. suggest /ts-discover explore oldest idea, or
         /ts-discover status." STOP, plan.json unchanged.
release-name: given, or default MVP (if no releases yet) else next IterN.
for each ready idea × ready_epics: append plan.json.epics[] {id,title,type
  (default epic),size,priority,depends_on(mapped),release,notes}; append id to
  release.epics[]; set idea.synced_to_plan=true.
create release entry if new (goal/exit_criteria derived or prompted).
write plan.json. optional: Atlassian Rovo creates Jira Epics.
confirm "synced N epics → release '<name>'. /ts-iteration start <name>."

### /ts-iteration start <release>
1. filter plan.json epics for <release> → empty: "run /ts-project plan --sync
   first." STOP, no iteration.json.
2. topological sort by depends_on[]
3. surface blocked epics (dep not yet shipped) → human: include anyway or proceed without
4. write .ai/iteration.json (all status=queued, active_epic=null)
5. GitHub MCP: create milestone <release>
6. Atlassian Rovo: label epics with release tag
confirm "N epics queued: [ordered list]"

### /ts-iteration next
sequential only: active_epic already set → "epic active — complete/defer first." STOP.
1. read iteration.json → first queued epic (in order)
2. set status=active, active_epic=id
3. if type==bugfix: pre-check scope-escalation signals (>3 files/migration/
   new dep/missing domain concept) BEFORE init → if likely, ask re-type?
4. call /ts-router init:
   passes: type, domain.json (or idea.exploration_output if from Discovery),
   risks.md, acpl_pattern_group, branch_name, phase_activation
5. ts-deliver-router runs its spine
6. on /ts-router refine complete:
   read .ai/ts-deliver-router/state.json
   write back to iteration.json: status=done, branch, mutation_score, shipped_at
   active_epic=null
confirm "Epic done. N remaining."

### /ts-iteration status
print: release goal / N/N epics / active epic+phase+score / queue / deferred / open risks / next gate

### /ts-iteration close
1. verify all epics done|deferred (any active → "close blocked")
2. GitHub MCP: close milestone + create release tag v<N>
3. Atlassian Rovo: transition Jira issues → Done
4. write .ai/ts-project-planner/retrospectives/<release>-retro.md
5. Confluence: publish retro
6. carry deferred epics → plan.json next release
confirm "N shipped, N deferred. Discovery ran in parallel — check
  /ts-discover status for next release's ready items."

### /ts-project status
print: project / current release / releases[done✓ active● queued○] / N epics /
  discovery summary (N ready unsynced | N exploring+validating WIP m/3 | N idea) /
  open risks / last ADR

### /ts-project refine
review deferred epics / review discovery.json for stale ideas (force decision) /
add new epics (retro findings, --from-router→build) / reprioritise /
update risks.md / offer re-run ts-event-storming-facilitator if domain evolved /
write plan.json (refined_count++)

---

## SHARED ARTIFACT WRITES (this skill)

WRITES:   .ai/ts-project-planner/plan.json (all fields)
          .ai/ts-project-planner/retrospectives/*.md
          .ai/discovery.json (all fields — full read/write)
          .ai/iteration.json (all fields EXCEPT epic.status/branch/mutation_score/shipped_at/active_epic)
          .ai/risks.md (primary writer)
          .ai/decisions/*.md (append only)

READS:    .ai/domain.json
          .ai/ts-deliver-router/state.json (epic status fields)

NEVER writes into .ai/ts-deliver-router/

---

## ts-deliver-router WRITES BACK

iteration.json ONLY: epics[active].status=done, branch, mutation_score,
  shipped_at, active_epic=null. nothing else.

discovery.json: APPEND-ONLY via /ts-discover idea --from-router (dedup-checked).
  MUST NOT modify status/decision/ready_epics/synced_to_plan/
  keep_learning_count/exploration_output/validation_output on existing entries.
  Only /ts-discover decide (human, this skill) moves ready/killed/reduce-scope —
  single point of decision authority.

---

## G1 ENRICHMENT
ts-deliver-router reads .ai/risks.md at Review G1 → open risks for active epic
surfaced in STRIDE checklist.
ts-deliver-router G1 also surfaces (advisory, non-blocking) discovery.json
entries with source_epic=this epic and status not in {ready,killed}.

---

## SKILLS USED
ts-event-storming-facilitator → LayerD: domain→exploration_output (sub-agent)
first-principles-agent     → LayerD: explore → riskiest_assumptions
council-advisor            → LayerD: validate H-risk assumptions
tows-strategy-analyst       → LayerD: validate strategic fit
critical-thinker            → LayerD+1: validation rationale + epic sequencing
ts-deliver-router            → Layer2: per-epic spine
Atlassian Rovo MCP          → LayerD+0+1: Epics/Sprints/issues/retro pages
GitHub MCP                  → Layer1: milestones, release tags, branches

## REFS
references/workspace-spec.md       → .ai/ layout contract + all shared schemas
references/discovery-kanban.md     → discovery stage criteria, WIP, stale, dedup
references/iteration-schema.md     → iteration.json full field reference
references/work-unit-profiles.md   → registry profiles per work unit type
