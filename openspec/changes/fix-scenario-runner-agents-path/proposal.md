## Problem

`scripts/run-scenario.sh` (the CI orchestration-scenario runner, `npm run` step "Run orchestration scenarios") fails all 9 scenarios (S1-S9) in GitHub Actions. `assert_hook_contains` assertions against `[WORKFLOW STATE]` always fail because `HOOK_OUTPUT` is empty.

## Root Cause

`scripts/run-scenario.sh` writes test fixtures into `$TEST_WORKSPACE/.ai/...` (lines 47-48, 64, 87, 111), but `src/hook/inject-workflow-state.sh` reads state from `$PROJ/.agents/...` (lines 5-7) — the workspace root was renamed from `.ai/` to `.agents/` (commit `5b3c453`, confirmed by `532f9a9`). Under `CLAUDE_PROJECT_DIR="$TEST_WORKSPACE"`, the hook looks in `.agents/` and finds nothing, so it emits no `[WORKFLOW STATE]` line and `HOOK_OUTPUT` is empty.

This is the same rename-miss pattern already fixed once in commit `f45dca3` ("fix(hook-tests): .ai -> .agents fixture paths"), which corrected `hook-output.test.ts` and `gate-enforcement.test.ts` but did not touch `scripts/run-scenario.sh` — a separate, shell-based scenario runner exercised only by CI, not by `npm test`.

## Proposed Solution

Update the 4 `.ai/` path references in `scripts/run-scenario.sh` to `.agents/`, matching what `inject-workflow-state.sh` actually reads. No behavior change to the hook itself.

## Non-Goals (optional)

- Not fixing the ~10 `openspec/specs/*/spec.md` files that still contain `.ai/` path references (e.g. `workflow-state-hook/spec.md` line 10 documents the hook as reading `.ai/ts-deliver-router/state.json`, which is stale against the current `.agents/` code). That is a documentation-accuracy sweep across many spec files, unrelated in scope to unblocking this CI failure, and should be its own change.
- Not renaming or restructuring the scenario runner itself; only the path constant is wrong.

## Success Criteria

- `bash scripts/run-scenario.sh S1` through `S9` each print `1..N` with 0 `not ok` lines.
- GitHub Actions "Test" workflow's "Run orchestration scenarios" step exits 0.
- `npm test` (vitest) continues to pass unchanged (this script is independent of it).

## Impact

- Affected code:
  - Modified: `scripts/run-scenario.sh`
