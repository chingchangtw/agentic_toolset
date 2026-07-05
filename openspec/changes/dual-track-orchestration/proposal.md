## Why

`ts-orchestrate` claims to be a "dual-track orchestrator" but today only routes
Delivery phase spines: `[NEXT]` hook guidance stops at think→reflect, WORK_TYPE
has no Discovery entry, and the Workflow Routing table only covers 3 epic
types. Meanwhile two sub-agents referenced across 4+ docs since the planner
PRD (`ts-event-storming-facilitator`, `ts-ddd-tactical-validator`) were never
built — `/ts-discover explore`/`validate` run today without them, so
`exploration_output` and `ddd_validation` get filled ad hoc or left empty.

Source idea: `.agents/discovery.json` idea-002 (explored, validated —
feasibility: risky, ddd_validation: NEEDS_ATTENTION, decision: build). Full
execution runbook: `tasks/dual-track-orchestration-plan.md` (T1-T12 + T9.5,
weak-model-executable, 12 locked decisions in its own §0).

## What Changes

- Ship 2 sub-agents (`ts-event-storming-facilitator`, `ts-ddd-tactical-validator`)
  as `.md` prompt files in new `src/agents/`, packaged via a new `agents[]`
  manifest category, installed to `<project>/.claude/agents/` (T1-T3)
- Expand `phase-routing.ts`'s WORK_TYPE union from `bugfix|refactor|epic` to
  `epic|feature|bugfix|hotfix|refactor|chore|patch|spike|ops` with 6 new
  phase spines (T4-T5)
- Rewrite `ts-orchestrate/SKILL.md` with two tables: **Workflow Guidance**
  (Track | Phase/State | Guidance — per-state, both tracks) and **Workflow
  Routing** (Work type | Route — 9 work types, track named inline) (T6-T7)
- Add a Discovery-branch `[NEXT]` case to `inject-workflow-state.sh` (hook)
  so Discovery-track users get per-status guidance, not just a state line (T8)
- Wire the 2 new sub-agents into `/ts-discover explore` (facilitator required
  to exit) and `/ts-discover decide build` (validator required, FAIL blocks) (T9)
- Add a regression test asserting `phase-routing.ts` spines match
  `work-unit-profiles.md` for the 6 new work types (T9.5 — added during this
  change's own Plan-phase review, closes a gap idea-002's validate step flagged)
- Slim `ts-project-planner/SKILL.md`'s Workflow Routing section to a pointer
  at `ts-orchestrate` (canonical routing lives in one place) (T10)
- Fix pre-existing `.ai`→`.agents` test-path breakage in
  `hook-output.test.ts`/`gate-enforcement.test.ts` in passing — both files are
  touched by T8 anyway (T8, T12)

## Non-Goals

- `gates["sec-review"]` (hook, `inject-workflow-state.sh:23`) vs `gates.G2`
  (live `ts-deliver-router/state.json`) key-name mismatch — pre-existing,
  unrelated to this change
- `work-unit-profiles.md`'s existing `bugfix`/`refactor` spine contradicting
  `SKILL.md`'s spine for the same types — pre-existing; T9.5's new
  consistency test scopes only to the 6 *new* types precisely to avoid
  asserting on this known-broken pair
- `ts-spec-validator` / `ts-mutation-analyst` (the other 2 agents in
  `sub-agents.md`) — stay unbuilt
- Installer per-file overwrite protection for `.claude/agents/` — matches
  the installer's existing (unguarded) behavior for skills/hooks; not a
  regression this change introduces

## Capabilities

### New Capabilities

- `discovery-subagents`: two sub-agent prompt files
  (`ts-event-storming-facilitator`, `ts-ddd-tactical-validator`) shipped via
  the release manifest, required at specific Discovery-track transitions

### Modified Capabilities

- `workflow-routing-table`: 3 epic types → 9 work types; adds Discovery-entry
  routes (Feature-unvalidated, PoC)
- `workflow-state-hook`: adds a Discovery-branch `[NEXT]` case (previously
  Discovery mode only printed the `[WORKFLOW STATE]` line, no guidance)
- `phase-routing`: WORK_TYPE union expands from 3 to 9 values (`epic` kept
  for back-compat, no longer end-user-facing)
- `release-manifest`: adds `agents[]` category alongside existing
  `skills[]`/`hooks[]`
- `dogfood-sync`: mirrors the new `agents[]` category into `.claude/agents/`
- `ts-deliver-router-agent-scaffold`: the 2 sub-agents move from
  "documented build spec, manual build" to "shipped in `src/agents/`,
  packaged automatically" — no code change to `ts-deliver-router` itself,
  documentation-only update noting shipped status

## Impact

- Affected specs: `workflow-routing-table`, `workflow-state-hook`,
  `phase-routing`, `release-manifest`, `dogfood-sync`,
  `ts-deliver-router-agent-scaffold` (all modified), `discovery-subagents` (new)
- Affected code: see `tasks/dual-track-orchestration-plan.md` §1 Verified
  facts + §3 per-task file lists — 20+ files across packaging scripts (both
  installers, manifest generator, build script, dogfood), `ts-orchestrate`
  (SKILL.md + 2 commands + hook), `ts-project-planner` (5 reference files),
  `phase-routing.ts`, and 2 new sub-agent files, plus tests
  (`phase-routing.test.ts`, `state-schema.test.ts` + 18 fixtures,
  `hook-output.test.ts`, `gate-enforcement.test.ts`, new
  `spine-consistency.test.ts`)
