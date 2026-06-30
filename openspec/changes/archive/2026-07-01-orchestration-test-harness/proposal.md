## Why

The multi-layer orchestration system (ts-orchestrate + ts-deliver-router + ts-discover + ts-iteration) has zero automated tests, no behavioral contract verification, and no CI gate. Structural defects (wrong phase routing, bypassed gates, incoherent state on resume) are only caught manually. This change delivers the BDD + TDD test harness from Doc 2 plus the ts-orchestrate skill layer and Layer 1 CLAUDE.md routing table from Doc 1.

## What Changes

- New `src/utils/phase-routing.ts` + `src/tests/unit/phase-routing.test.ts` — `getPhaseList(epicType)` utility mapping bugfix→3-phase, refactor→6-phase, epic→7-phase
- New `src/tests/unit/state-schema.test.ts` — REQUIRED-field explicit list for iteration.json + ts-deliver-router/state.json; validates all 9 iteration-state fixtures; any unplanned schema drift → red in CI (Success Criterion #3)
- New `src/tests/unit/gate-enforcement.test.ts` — 3 hook-testable edge cases from edge-tests.md (unsigned G2, schema version mismatch, dry-run sign attempt)
- New `scripts/run-scenario.sh` — TAP bash runner with single-source FIXTURE_MAP; loads fixtures, runs hook, diffs assert: blocks; exits 0 on pass
- New `tests/orchestration/` directory at repo root — 9 iteration-state fixtures (bugfix/refactor/epic × HIGH/MID/LOW) + 12 scenario specs (S1-S9 + S10-S12)
- New `src/skills/ts-orchestrate/SKILL.md` + 3 command stubs (start, status, next) — passive skill layer enforced by Epic 1 hook
- New `src/skills/ts-deliver-router/references/registry-lean.md` — Think→Build→Ship lean phase profile for bugfix work type
- Updated `.github/workflows/test.yml` — CI: npm test + S1-S9 scenario runner on every PR to master
- Updated `src/skills/ts-project-planner/SKILL.md` — Layer 1 workflow routing table (session-start context)

## Non-Goals

- LLM-in-the-loop behavioral testing (separate eval harness, out of scope)
- Windows bash support for run-scenario.sh (Linux/macOS CI only)
- ts-orchestrate evolving to a stateful sub-agent (v2 — future)
- `.ai/ts-orchestrate/state.json` (CEO D3: orchestration fields live in iteration.json)
- Implementing ts-orchestrate business logic beyond passive skill routing (v2)
- S10-S12 scenario runner execution in CI (specs written, runner hooks available, but CI loop runs S1-S9 only per Doc 2)

## Capabilities

### New Capabilities

- `phase-routing`: Utility function mapping epic type (bugfix/refactor/epic) to ordered phase list; single source of truth consumed by hook and skill layer
- `orchestration-test-harness`: BDD scenario specs (S1-S12), iteration-state fixtures, and bash TAP runner covering all 9 type×autonomy combinations plus 3 cross-cutting flows
- `state-schema-validation`: Vitest tests holding explicit REQUIRED-field lists for both state files; validates all fixtures; fails fast on unplanned schema drift (Success Criterion #3)
- `gate-enforcement-tests`: 3 hook-testable gate edge cases from edge-tests.md mapped to Vitest assertions
- `ts-orchestrate-skill`: Passive SKILL.md orchestrator with 3 command stubs (start, status, next); reads injected [WORKFLOW STATE] context from Epic 1 hook
- `lean-phase-registry`: registry-lean.md documenting Think→Build→Ship profile for bugfix work type
- `workflow-routing-table`: Layer 1 CLAUDE.md routing table in ts-project-planner/SKILL.md mapping starting point + size → correct skill invocation sequence

### Modified Capabilities

(none — workflow-state-hook injection hardening was completed in Epic 1; no spec-level requirement changes in this change)

## Impact

- Affected specs: phase-routing (new), orchestration-test-harness (new), state-schema-validation (new), gate-enforcement-tests (new), ts-orchestrate-skill (new), lean-phase-registry (new), workflow-routing-table (new)
- Affected code:
  - New: `src/utils/phase-routing.ts`
  - New: `src/tests/unit/phase-routing.test.ts`
  - New: `src/tests/unit/state-schema.test.ts`
  - New: `src/tests/unit/gate-enforcement.test.ts`
  - New: `scripts/run-scenario.sh`
  - New: `tests/orchestration/fixtures/iteration-state/bugfix-high.json`
  - New: `tests/orchestration/fixtures/iteration-state/bugfix-mid.json`
  - New: `tests/orchestration/fixtures/iteration-state/bugfix-low.json`
  - New: `tests/orchestration/fixtures/iteration-state/refactor-high.json`
  - New: `tests/orchestration/fixtures/iteration-state/refactor-mid.json`
  - New: `tests/orchestration/fixtures/iteration-state/refactor-low.json`
  - New: `tests/orchestration/fixtures/iteration-state/epic-high.json`
  - New: `tests/orchestration/fixtures/iteration-state/epic-mid.json`
  - New: `tests/orchestration/fixtures/iteration-state/epic-low.json`
  - New: `tests/orchestration/scenarios/S1-bugfix-high.md`
  - New: `tests/orchestration/scenarios/S2-bugfix-mid.md`
  - New: `tests/orchestration/scenarios/S3-bugfix-low.md`
  - New: `tests/orchestration/scenarios/S4-refactor-high.md`
  - New: `tests/orchestration/scenarios/S5-refactor-mid.md`
  - New: `tests/orchestration/scenarios/S6-refactor-low.md`
  - New: `tests/orchestration/scenarios/S7-epic-high.md`
  - New: `tests/orchestration/scenarios/S8-epic-mid.md`
  - New: `tests/orchestration/scenarios/S9-epic-low.md`
  - New: `tests/orchestration/scenarios/S10-resume-incoherent.md`
  - New: `tests/orchestration/scenarios/S11-feedback-loop.md`
  - New: `tests/orchestration/scenarios/S12-gate-bypass.md`
  - New: `tests/orchestration/README.md`
  - New: `src/skills/ts-orchestrate/SKILL.md`
  - New: `src/skills/ts-orchestrate/commands/start.md`
  - New: `src/skills/ts-orchestrate/commands/status.md`
  - New: `src/skills/ts-orchestrate/commands/next.md`
  - New: `src/skills/ts-deliver-router/references/registry-lean.md`
  - Modified: `.github/workflows/test.yml`
  - Modified: `src/skills/ts-project-planner/SKILL.md`
