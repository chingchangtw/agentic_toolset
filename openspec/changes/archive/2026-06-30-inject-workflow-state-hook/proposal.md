## Why

Claude's per-turn compliance with workflow phase ordering degrades under long context. Without a per-turn enforcement mechanism, Claude skips phases (e.g., jumps to Build without Think→Plan) or forgets the active phase after 20+ turns. A `UserPromptSubmit` hook injecting live state on every turn is the structural fix.

## What Changes

- New bash hook `src/hook/inject-workflow-state.sh` — reads `iteration.json` (active_epic, dial, active_phase) and `ts-deliver-router/state.json` (current_phase), outputs `[WORKFLOW STATE]` + `[NEXT]` context block on every prompt turn
- New Vitest unit tests `src/tests/unit/hook-output.test.ts` + fixture JSON files in `src/tests/fixtures/` — 9 test cases covering all phases, empty state, unknown phase, null epic, and CLAUDE_PROJECT_DIR resolution
- Updated `src/skills/ts-project-planner/references/iteration-schema.md` — documents 5 new orchestration fields folded into iteration.json (active_phase, active_idea, dial, epic_dial_overrides, resume_log)
- Updated `release/install.sh` — adds `PROJECT_HOOKS_DIR` variable, copies hook to `<PROJECT>/.claude/hooks/`, registers `UserPromptSubmit` entry idempotently in project settings.json
- Updated `scripts/build-release.mjs` — adds `inject-workflow-state.sh` to the hook file allowlist

## Non-Goals

- Do NOT create `.ai/ts-orchestrate/state.json` (CEO D3: orchestration fields fold into iteration.json)
- Do NOT implement `/ts-orchestrate` skill or command stubs (Epic 2)
- Do NOT implement BDD scenario test harness (Epic 2)
- Do NOT add lean-scope phase registry `registry-lean.md` (Epic 2)
- Windows support for hook (CI: ubuntu-latest + macos-latest only)

## Capabilities

### New Capabilities

- `workflow-state-hook`: Per-turn bash hook that reads iteration.json + ts-deliver-router/state.json and injects [WORKFLOW STATE] + [NEXT] context into every Claude prompt turn

### Modified Capabilities

- (none — iteration-schema.md update is documentation only, no spec-level behavior change)

## Impact

- Affected specs: workflow-state-hook (new)
- Affected code:
  - New: `src/hook/inject-workflow-state.sh`
  - New: `src/tests/unit/hook-output.test.ts`
  - New: `src/tests/fixtures/phases/think.json`
  - New: `src/tests/fixtures/phases/plan.json`
  - New: `src/tests/fixtures/phases/build.json`
  - New: `src/tests/fixtures/phases/review.json`
  - New: `src/tests/fixtures/phases/test.json`
  - New: `src/tests/fixtures/phases/ship.json`
  - New: `src/tests/fixtures/phases/reflect.json`
  - New: `src/tests/fixtures/iteration-active.json`
  - Modified: `src/skills/ts-project-planner/references/iteration-schema.md`
  - Modified: `release/install.sh`
  - Modified: `scripts/build-release.mjs`
