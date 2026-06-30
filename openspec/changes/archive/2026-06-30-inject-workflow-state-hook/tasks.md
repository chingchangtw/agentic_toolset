## 1. Hook Script — Core Behavior

- [x] 1.1 (T1-P1) Implement "Hook reads workflow state on every prompt turn": create `src/hook/inject-workflow-state.sh` that reads `${CLAUDE_PROJECT_DIR:-$(pwd)}/.ai/ts-deliver-router/state.json` (current_phase) and `iteration.json` (active_epic, dial). Hook reads iteration.json + ts-deliver-router/state.json (not a single merged file) per design — two independent reads respecting writer_lock. Outputs `[WORKFLOW STATE] ts-deliver phase: <phase> | active epic: <id>` then a `[NEXT]` line. "Hook emits phase-specific NEXT command guidance" per the spec phase-to-NEXT mapping: hook uses lowercase case match for phase values (`think|plan|build|review|test|ship|reflect`). Verify: `CLAUDE_PROJECT_DIR=<fixture-dir> bash src/hook/inject-workflow-state.sh` with a think-phase fixture confirms stdout contains `[WORKFLOW STATE]` and `Spectra:discuss`.

- [x] 1.2 "Hook reads active_epic from iteration.json, not router state": hook reads active_epic from `iteration.json.active_epic` per design ("hook reads active_epic from iteration.json.active_epic, not ts-deliver-router/state.json"). When null or absent, output contains `active epic: none`. Verify: invoke with null-active_epic fixture, assert `active epic: none` in stdout.

- [x] 1.3 "Hook MUST NOT echo free-text notes fields": hook is silent on error (jq failures → empty stdout, no stderr) and does NOT echo `iteration.json.epics[].notes` — injection hardening, "do not echo iteration.json.epics[].notes in hook output". Verify: malformed state.json → empty stdout; normal invocation → notes content absent from output.

- [x] 1.4 Discovery-mode fallback: when only `iteration.json` exists (no router state), hook outputs `[WORKFLOW STATE] Discovery | dial: <dial> | active_epic: <id or none>`. When neither file exists, hook outputs nothing (silent). Verify: discovery-only fixture → `Discovery` in stdout; empty dir → empty stdout.

## 2. Unit Tests — Hook Output (T2-P1)

- [x] 2.1 Create fixture files (fixture files are external json, not inline test strings per design): `src/tests/fixtures/phases/` with `think.json`, `plan.json`, `build.json`, `review.json`, `test.json`, `ship.json`, `reflect.json` each containing `{ "current_phase": "<phase>" }`. Create `src/tests/fixtures/iteration-active.json` with `{ "active_epic": "test-epic-001", "dial": "MID" }`. Verify: `jq . <file>` exits 0 for all 8 files.

- [x] 2.2 "Vitest tests validate hook output for all phases" — test contract: create `src/tests/unit/hook-output.test.ts` with 9+ Vitest test cases. Uses `spawnSync('bash', ['src/hook/inject-workflow-state.sh'], { env: { ...process.env, CLAUDE_PROJECT_DIR: tmpDir } })`. Fixture paths resolved via `fileURLToPath(new URL('../fixtures/...', import.meta.url))` (ESM-safe, not `__dirname`). Each test sets up a temp dir with fixture files and asserts `[WORKFLOW STATE]` + `[NEXT]` content per phase-to-NEXT spec table. Verify: `npm test -- src/tests/unit/hook-output.test.ts` all 9+ pass.

- [x] 2.3 Document D4 silent-on-error in `hook-output.test.ts` as comment (`// D4: malformed state yields empty output by design — not a failing assertion`). Add one test asserting malformed state.json → empty stdout (documents contract, NOT a fail-loud assertion). Verify: comment present, empty-output test passes.

## 3. Iteration Schema Documentation (T3-P1)

- [x] 3.1 "iteration-schema.md documents orchestration fields" — "iteration-schema.md change": update `src/skills/ts-project-planner/references/iteration-schema.md` to add 5 fields to the top-level table: `active_phase` (Discovery|Delivery|null, owner: ts-orchestrate), `active_idea` (idea id or null, owner: ts-orchestrate), `dial` (HIGH|MID|LOW, owner: ts-orchestrate), `epic_dial_overrides` (object keyed by epic id, owner: ts-orchestrate), `resume_log` (array of resume events, owner: ts-orchestrate). Update `writer_lock` description to cover these 5 new fields. Verify: content review — all 5 fields in table, writer_lock row mentions them.

## 4. Install Script — Project Hook Deployment (T4-P2)

- [x] 4.1 "Hook installs to project-level hooks directory" — "install.sh changes": update `release/install.sh` to add `PROJECT_HOOKS_DIR="${PROJECT_CLAUDE_DIR}/hooks"`. Hook installs to `<PROJECT>/.claude/hooks/` not `~/.claude/hooks/` per design. Add block: `mkdir -p "${PROJECT_HOOKS_DIR}"`, copy `hook/inject-workflow-state.sh` → `${PROJECT_HOOKS_DIR}/inject-workflow-state.sh`, `chmod +x`. Global hooks (ts-session-guard, ts-statusline_bridge, wrapper) in `${HOOKS_DIR}` remain unchanged. Verify: diff shows new variable + copy block; existing global hook installs unmodified.

- [x] 4.2 "install.sh merges UserPromptSubmit entry idempotently" per design: update `release/install.sh` to append `bash "$CLAUDE_PROJECT_DIR/.claude/hooks/inject-workflow-state.sh"` to UserPromptSubmit in project `.claude/settings.json` only when not already present (duplicate check via jq). Verify: run install.sh twice against test project dir, UserPromptSubmit entry appears exactly once.

## 5. Build Pipeline — Hook Allowlist (T5-P2)

- [x] 5.1 "Hook filename included in build-release.mjs allowlist" — "build-release.mjs change": update `scripts/build-release.mjs` to add `'inject-workflow-state.sh'` to the hook file array (`for (const f of [...])` loop ~line 73). "hook behavior" is verified end-to-end by this inclusion ensuring the hook is packaged. Verify: `npm run build` succeeds and `inject-workflow-state.sh` exists in build output zip.
