# Think — Framing: EPIC-DUAL-TRACK-ORCHESTRATION

## Spectra:discuss conclusion

This epic's discussion happened across the Discovery track (idea-002: seed → explore →
validate → decide build), not as a separate fresh discussion — the conclusion reached
there is restated here as the Think-phase framing artifact.

## Why

`ts-orchestrate` claims to be a "dual-track orchestrator" but today only covers Delivery
phase spines; `[NEXT]` hook guidance stops at think→reflect; WORK_TYPE has no Discovery
entry. Two sub-agents referenced across 4+ docs since the planner PRD
(`ts-event-storming-facilitator`, `ts-ddd-tactical-validator`) were never built — Discovery
`explore`/`validate` currently run without them. This epic closes both gaps.

## What (scope)

Execution runbook: `tasks/dual-track-orchestration-plan.md` (T1-T12). Twelve locked
decisions in its §0 — do not re-open them in this phase or later phases; they were
reached interactively with the human across the Discovery track and 3 rounds of
correction on the guidance/routing table shape.

1. Ship 2 sub-agents (`ts-event-storming-facilitator`, `ts-ddd-tactical-validator`) via a
   new `agents[]` manifest category — packaging pipeline change (manifest generator,
   build script, both installers, dogfood mirror).
2. Rewrite `ts-orchestrate/SKILL.md` with two tables: Workflow Guidance (Track |
   Phase/State | Guidance) and Workflow Routing (Work type | Route), covering both
   Discovery and Delivery.
3. Expand WORK_TYPE to `feature|bugfix|hotfix|refactor|chore|patch|spike|poc|ops`
   (`epic` retained in code for back-compat; dropped as an end-user-facing type).
4. Add Discovery-branch `[NEXT]` guidance to the hook (bash).
5. Wire the 2 new sub-agents into `/ts-discover explore` (required to exit) and
   `/ts-discover decide build` (required, FAIL blocks).
6. Fix pre-existing `.ai`→`.agents` test-path breakage in passing (both files touched
   anyway by other changes in this epic — declared here, not silent scope creep).

## Non-goals (explicit — do not fix even if noticed)

- `gates["sec-review"]` (hook) vs `gates.G2` (state.json) key-name mismatch.
- `work-unit-profiles.md` refactor spine contradicting `SKILL.md`'s refactor spine.
- `ts-spec-validator` / `ts-mutation-analyst` (other 2 sub-agents from
  `sub-agents.md`) — stay unbuilt.
- `registry.json`'s `gates.G1.phase = "review"` / `gates.G2.phase = "test"` disagreeing
  with `security-gates.md`'s "G1 = end of Think, G2 = start of Ship" — this Think
  artifact follows `security-gates.md` (core, "never deferred") as authoritative; the
  registry.json phase tags look like stale leftovers from the prior epic's setup, but
  fixing that is a separate, unscoped change.

## Carried-forward follow-ups (from idea-002 validate — non-blocking, address in Plan/Build)

1. Add a JSON-shape/type check for sub-agent output, on top of the existing
   non-empty-field gate.
2. Add a test asserting `phase-routing.ts` spines match `SKILL.md`'s Workflow Routing
   table and `work-unit-profiles.md`.
3. DDD model gap (informational): Release/Iteration is under-modeled as its own
   aggregate; `WorkflowStateInjected` was mis-classified as a domain event rather than
   a read-side projection in idea-002's own exploration_output.
