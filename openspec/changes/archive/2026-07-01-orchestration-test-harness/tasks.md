## 1. Phase Routing Utility (TDD — red→green)

- [x] 1.1 Create `src/tests/unit/phase-routing.test.ts` — "phase-routing.test.ts covers all three epic types": 3 Vitest tests asserting `getPhaseList("bugfix")` equals `["Think","Build","Ship"]`, `getPhaseList("refactor")` equals `["Think","Plan","Build","Review","Ship","Reflect"]`, `getPhaseList("epic")` equals `["Think","Plan","Build","Review","Test","Ship","Reflect"]`. Import from `@utils/phase-routing`. Verify: `npx vitest run src/tests/unit/phase-routing.test.ts` fails with "Cannot find module" (correct TDD red state before implementation).

- [x] 1.2 Create `src/utils/phase-routing.ts` — "getPhaseList maps epic type to ordered phase list": export `getPhaseList(epicType: "bugfix" | "refactor" | "epic"): string[]` returning exact arrays per spec. Run `npm run type-check` after creation. Verify: `npx vitest run src/tests/unit/phase-routing.test.ts` passes all 3 tests green.

## 2. Iteration-State Fixtures — "9 iteration-state fixtures cover all type×autonomy combinations"

- [x] 2.1 "9 iteration-state fixtures cover all type×autonomy combinations" — create `tests/orchestration/fixtures/iteration-state/` with all 9 JSON files: `bugfix-high.json`, `bugfix-mid.json`, `bugfix-low.json`, `refactor-high.json`, `refactor-mid.json`, `refactor-low.json`, `epic-high.json`, `epic-mid.json`, `epic-low.json`. Each file is a valid `iteration.json` with fields: `project`, `release`, `release_goal`, `iteration_start`, `writer_lock: null`, `active_phase: "Delivery"`, `active_epic` (e.g. `"fix-auth-null-ptr"` for bugfix, `"refactor-auth-middleware"` for refactor, `"auth-epic-001"` for epic), `dial` (HIGH/MID/LOW per filename), `epic_dial_overrides: {}`, `resume_log: []`, `epics: [{id, title, type (matching filename), status: "active"}]`. Verify: `jq . <file>` exits 0 for all 9.

## 3. State Schema Validation Tests

- [x] 3.1 Create `src/tests/unit/state-schema.test.ts` — "state-schema.test.ts holds explicit REQUIRED-field lists": declare `REQUIRED_ITERATION_FIELDS = ["project","release","release_goal","epics","active_epic","iteration_start","writer_lock","active_phase","dial"]` and `REQUIRED_ROUTER_FIELDS = ["current_phase","schema_version"]`. "state-schema.test.ts validates all 9 iteration-state fixtures": for each of the 9 fixtures assert all REQUIRED_ITERATION_FIELDS are present; failure message includes field name + filename. "schema change → test RED within 60 seconds": confirm by temporarily removing `active_phase` from one fixture → test fails with message matching that field name and filename; restore fixture before marking done. Verify: `npx vitest run src/tests/unit/state-schema.test.ts` passes all 9 fixture validations.

## 4. Gate Enforcement Tests (TDD — hook extensions)

- [x] 4.1 Create `src/tests/unit/gate-enforcement.test.ts` — "gate-enforcement.test.ts implements the 3 hook-testable edge cases as Vitest tests"; "hook outputs [BLOCKED] for unsigned G2 gate at Ship phase" (state.json `current_phase:"ship"` + `gates:{"sec-review":{"status":"pending"}}` → assert stdout `[BLOCKED] Ship blocked: sec-review gate not signed`); "hook outputs [BLOCKED] for schema version mismatch" (`schema_version:"2"` → assert `[BLOCKED] state schema version mismatch`); "hook outputs [DRY-RUN] warning for gate sign in dry-run mode" (`dry_run:true` + `current_phase:"ship"` → assert `[DRY-RUN] cannot sign security gate in dry-run mode`); "LLM-behavior edge cases are NOT in gate-enforcement.test.ts" (include comment `// edges 1,2,4,5 covered by BDD S10-S12`). Verify: `npx vitest run src/tests/unit/gate-enforcement.test.ts` fails RED (TDD — correct before hook extension).

- [x] 4.2 Extend `src/hook/inject-workflow-state.sh` to implement the 3 gate checks (red→green): (1) check `schema_version` — if present and not `"1"`, echo `[BLOCKED] state schema version mismatch` and exit 0; (2) check `dry_run` — if `true` and phase is `ship`, echo `[DRY-RUN] cannot sign security gate in dry-run mode` and exit 0; (3) check `gates["sec-review"]["status"]` — if `"pending"` and phase is `ship`, echo `[BLOCKED] Ship blocked: sec-review gate not signed` and exit 0. All checks MUST remain silent-on-error (jq failures → no output). Order: schema_version first, dry_run second, gate third. Verify: `npx vitest run src/tests/unit/gate-enforcement.test.ts` passes all 3 green; re-run `npx vitest run src/tests/unit/hook-output.test.ts` confirms all 12 prior tests still pass.

## 5. BDD Scenario Specs S1-S9 — "S1-S9 BDD scenarios cover the full type×autonomy matrix"

- [x] 5.1 "S1-S9 BDD scenarios cover the full type×autonomy matrix" (S1 reference): create `tests/orchestration/scenarios/S1-bugfix-high.md` — `# Scenario S1: BUGFIX + HIGH autonomy`, fixture reference `fixtures/iteration-state/bugfix-high.json`, steps covering Think→Build→Ship spine. Assert blocks: `assert: .active_phase == "Delivery"`, `assert: .dial == "HIGH"`, `assert_hook_contains: "[WORKFLOW STATE] ts-deliver phase: think"`, `assert_phase_not_in_history: "Plan"`, `assert_phase_not_in_history: "Review"`, `assert_phase_not_in_history: "Test"`. Verify: file contains at least 5 `assert:` lines.

- [x] 5.2 Complete "S1-S9 BDD scenarios cover the full type×autonomy matrix" (S2-S9): create `tests/orchestration/scenarios/S2-bugfix-mid.md` through `S9-epic-low.md` (8 files) per scenario matrix: S2 BUGFIX+MID (lean spine, user prompted at Build), S3 BUGFIX+LOW (prompted every step), S4 REFACTOR+HIGH (6-phase, G1 required, auto-advance after sign-off), S5 REFACTOR+MID (G1 blocks human sign), S6 REFACTOR+LOW (every phase explicit advance), S7 EPIC+HIGH (full 7-phase, G1+G2 required, never auto-sign even in HIGH), S8 EPIC+MID (G1+G2 block, user advances each phase), S9 EPIC+LOW (full human control). Each file has correct fixture reference, `assert:` blocks appropriate to work type, and `assert_phase_not_in_history:` for phases skipped. Verify: all 8 files exist, each contains at least one `assert:` block.

## 6. BDD Scenario Specs S10-S12 — "S10-S12 cover cross-cutting flows as BDD specs"

- [x] 6.1 "S10-S12 cover cross-cutting flows as BDD specs" (S10): create `tests/orchestration/scenarios/S10-resume-incoherent.md` — scenario for `/ts-orchestrate:resume` with incoherent state (active_phase=Delivery but active_epic=null). Steps: detect gap, surface guided repair output. Assert block: `assert_hook_contains: "[NEXT]"`. Note: human/LLM execution only, not in CI loop.

- [x] 6.2 Create `tests/orchestration/scenarios/S11-feedback-loop.md` — scenario for epic completion triggering discovery.json feedback entry. Steps: epic marked done, check `discovery.json` gets `source_epic` entry. Note: human/LLM execution only.

- [x] 6.3 Create `tests/orchestration/scenarios/S12-gate-bypass.md` — scenario for attempting to bypass G2 on EPIC type. Assert block: `assert_hook_contains: "[BLOCKED] Ship blocked: sec-review gate not signed"`. Note: human/LLM execution only.

## 7. TAP Bash Runner — "run-scenario.sh is the single source of FIXTURE_MAP"

- [x] 7.1 Create `scripts/run-scenario.sh` — define `FIXTURE_MAP="S1:bugfix-high S2:bugfix-mid S3:bugfix-low S4:refactor-high S5:refactor-mid S6:refactor-low S7:epic-high S8:epic-mid S9:epic-low S10:resume-incoherent S11:feedback-loop S12:gate-bypass"` exactly once (never in CI YAML). Script: extract fixture name from FIXTURE_MAP; set up TEST_WORKSPACE in /tmp; copy iteration.json fixture; run hook via `CLAUDE_PROJECT_DIR="$TEST_WORKSPACE" bash src/hook/inject-workflow-state.sh`; parse `assert:` and `assert_hook_contains:` lines from scenario .md via `grep "^assert"`; evaluate each via jq or string match; output TAP version 14; exit 0 on all pass / 1 on any failure; exit non-zero with error message on unknown scenario ID. Verify: `bash scripts/run-scenario.sh S1` exits 0 and stdout contains `TAP version 14` and at least one `ok` line.

- [x] 7.2 Create `tests/orchestration/README.md` — 3 sections: how to run scenarios (`bash scripts/run-scenario.sh S1`), fixture schema contract (REQUIRED_ITERATION_FIELDS list), which scenarios are in CI (S1-S9) vs human-only (S10-S12). Verify: all 3 sections present.

## 8. ts-orchestrate Skill Layer

- [x] 8.1 Create `src/skills/ts-orchestrate/SKILL.md` — "ts-orchestrate SKILL.md implements passive routing logic": reads `[WORKFLOW STATE]` context from Epic 1 hook (not raw state files). "ts-orchestrate enforces entry gate (no deliver:init without active_epic)": when `active epic: none` → direct to `/ts-project:plan --new`, refuse `/ts-deliver:init`. "ts-orchestrate routes by epic.type to correct phase spine": bugfix→lean 3-phase, refactor→6-phase, epic→7-phase. Include feedback loop description. Verify: content review — entry gate, routing table, and feedback loop all present.

- [x] 8.2 Create "3 ts-orchestrate command stubs exist as markdown files" — `src/skills/ts-orchestrate/commands/start.md`: "start command stub describes entry point" — accepts `WORK_TYPE: EPIC|REFACTOR|BUGFIX` and `AUTONOMY: HIGH|MID|LOW`; sets `active_epic` + `dial` in iteration.json; routes to correct phase spine. Verify: file exists and contains both WORK_TYPE and AUTONOMY parameters.

- [x] 8.3 Create `src/skills/ts-orchestrate/commands/status.md` — "status command stub describes cross-layer view": reads `[WORKFLOW STATE]` block + discovery.json; outputs unified view showing Discovery WIP count and active epic + current phase. Verify: file exists and mentions both Discovery and Delivery.

- [x] 8.4 Create `src/skills/ts-orchestrate/commands/next.md` — "next command stub describes enforced advancement": advances to next phase after user confirms work complete; enforces gate requirements; explicitly states G1/G2 cannot be auto-signed at any autonomy level. Verify: file exists and contains the no-auto-sign statement.

## 9. Lean Phase Registry — "registry-lean.md documents Think→Build→Ship for bugfix work type"

- [x] 9.1 Create `src/skills/ts-deliver-router/references/registry-lean.md` — lean phase profile for bugfix: ordered phases Think→Build→Ship, states "G1 not required for bugfix lean path" and "G2 not required for bugfix lean path". "lean registry format matches existing ts-deliver-router references": format consistent with existing `src/skills/ts-deliver-router/references/phases.md` (same heading levels). Verify: file contains both gate exclusion statements and exactly 3 phases listed.

## 10. Layer 1 Workflow Routing Table

- [x] 10.1 Append `## Workflow Routing` section to `src/skills/ts-project-planner/SKILL.md` — "ts-project-planner/SKILL.md includes Layer 1 workflow routing table": 5-row table (new idea, idea-in-discovery small, idea-in-discovery medium/large, active epic, epic complete) → correct skill activation sequence. "routing table includes two HARD RULEs": include verbatim `HARD RULE: Never start /ts-deliver:init without an epic in iteration.json.active_epic.` and `HARD RULE: Never mark epic done without G1 + G2 human sign-off.` Verify: table has 5 rows, both HARD RULE lines present verbatim.

## 11. CI Integration — "CI runs npm test + S1-S9 on every PR to master"

- [x] 11.1 Create or update `.github/workflows/test.yml` — job on `ubuntu-latest`, triggered by `push` and `pull_request` to `master`. Step 1: `npm install && npx vitest run`. Step 2: loop `bash scripts/run-scenario.sh $id` for `S1 S2 S3 S4 S5 S6 S7 S8 S9` — FIXTURE_MAP sourced from runner only, never duplicated in YAML. Verify: YAML is syntactically valid; contains vitest step and scenario loop; FIXTURE_MAP appears exactly 0 times in the YAML file itself.
