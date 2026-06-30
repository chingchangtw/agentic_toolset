## Context

The agenticToolset orchestration system (ts-project-planner + ts-deliver-router + ts-discover + ts-iteration) has zero automated tests. Epic 1 shipped the Layer 2 enforcement hook (inject-workflow-state.sh). Epic 2 delivers three things: (1) the TDD/BDD test harness proving the hook + routing logic is correct, (2) the passive ts-orchestrate skill layer (Layer 3) that reads injected context and drives command sequencing, and (3) the Layer 1 CLAUDE.md routing table (session-start context).

CEO D1 mandates co-build TDD: each component built red→green (hook-output→phase-routing→schema→S1→S2-S12). Not big-bang.

Existing files this change builds on:
- `src/hook/inject-workflow-state.sh` (Epic 1) — hook already shipped
- `src/tests/unit/hook-output.test.ts` (Epic 1) — hook tests already shipped
- `src/tests/fixtures/` (Epic 1) — phase fixtures already exist
- `src/skills/ts-deliver-router/references/edge-tests.md` — 7 edge cases, 3 are hook-testable
- `src/skills/ts-project-planner/SKILL.md` — gets the routing table appended

## Goals / Non-Goals

**Goals:**
- `getPhaseList(epicType)` in `src/utils/phase-routing.ts` — single source for bugfix→[Think,Build,Ship], refactor→[Think,Plan,Build,Review,Ship,Reflect], epic→[Think,Plan,Build,Review,Test,Ship,Reflect]
- `state-schema.test.ts` — explicit REQUIRED-field lists for both state files; validates 9 iteration-state fixtures; schema drift → red in CI
- `gate-enforcement.test.ts` — 3 hook-testable edge cases: unsigned G2 (edge 3), schema version mismatch (edge 6), dry-run sign attempt (edge 7)
- 9 iteration-state fixture JSONs (bugfix/refactor/epic × HIGH/MID/LOW) in `tests/orchestration/fixtures/iteration-state/`
- S1-S12 BDD scenario specs in `tests/orchestration/scenarios/` with strict `assert:` blocks (machine-parseable)
- `scripts/run-scenario.sh` — TAP bash runner; single-source FIXTURE_MAP; exit 0 on pass
- `src/skills/ts-orchestrate/SKILL.md` + 3 command stubs (start, status, next)
- `src/skills/ts-deliver-router/references/registry-lean.md` — Think→Build→Ship lean profile
- `.github/workflows/test.yml` — CI: npm test + S1-S9 on every PR to master
- Layer 1 routing table appended to `src/skills/ts-project-planner/SKILL.md`

**Non-Goals:**
- LLM-in-the-loop testing
- Windows bash support for run-scenario.sh
- ts-orchestrate as a stateful sub-agent (v2)
- `.ai/ts-orchestrate/state.json` (CEO D3: fold into iteration.json)
- S10-S12 in CI loop (specs written, runner supports them, CI runs S1-S9 only)
- Implementing ts-orchestrate business logic beyond passive skill routing

## Decisions

### FIXTURE_MAP lives in run-scenario.sh only (DRY, CEO D5)
Single source: `FIXTURE_MAP="S1:bugfix-high S2:bugfix-mid ... S12:gate-bypass"` in `scripts/run-scenario.sh`. CI workflow calls `bash scripts/run-scenario.sh $id` in a loop — it reads the map from the runner, not duplicated in the YAML. Doc 2 + CEO mandate.

### iteration-state fixtures carry orchestration fields (CEO D3)
No `ts-orchestrate/state.json`. Each `tests/orchestration/fixtures/iteration-state/<type>-<dial>.json` is a full `iteration.json` carrying: `active_phase`, `active_epic`, `dial`, `epic_dial_overrides`, `resume_log` (the 5 fields from Epic 1 schema update). Hook reads `iteration.json` + `ts-deliver-router/state.json`.

### state-schema.test.ts holds explicit REQUIRED-field list (CEO D5)
The test file maintains a literal array `REQUIRED_ITERATION_FIELDS` and `REQUIRED_ROUTER_FIELDS`. Intentional schema change = edit the array (flexible). Unplanned drift = named field missing from fixture → test RED in CI. This is the mechanism for Success Criterion #3.

### getPhaseList is the single source of truth for phase sequences
`src/utils/phase-routing.ts` exports `getPhaseList`. The hook does NOT duplicate this logic (hook reads current_phase from state, it doesn't determine the sequence). phase-routing.ts is used by ts-orchestrate skill to validate skip assertions in BDD scenarios.

### S1-S9 run in CI; S10-S12 are spec-only (not in CI loop)
S10 (resume-incoherent), S11 (feedback-loop), S12 (gate-bypass) require multi-step state manipulation the bash runner cannot perform in isolation. They are written as BDD specs for human/LLM execution. CI runs S1-S9 only.

### BDD assert: blocks use strict YAML format (machine-parseable)
Scenario files use `assert: <jq expression>`, `assert_hook_contains: "<string>"`, `assert_phase_not_in_history: "<phase>"`. Runner parses via `grep "^assert"` and executes each via jq or string match. This format was chosen over free-text prose (Doc 2 CEO D5 assertion format resolved).

### ts-orchestrate SKILL.md is passive — enforcement comes from Epic 1 hook
The skill reads `[WORKFLOW STATE]` injected by the hook (Layer 2). It doesn't re-read state files from scratch. Its job is routing logic + transition rules; the hook provides per-turn state. v2 replaces this with a stateful agent.

### Layer 1 routing table appended to ts-project-planner/SKILL.md (not a new file)
Doc 1 specifies adding the routing table to ts-project-planner/SKILL.md. One append, no new file. The table maps: starting point × size → correct skill invocation sequence with hard rules (no /ts-deliver:init without active_epic, no epic done without G1+G2).

## Implementation Contract

### phase-routing.ts contract
`src/utils/phase-routing.ts` exports:
```typescript
export function getPhaseList(epicType: "bugfix" | "refactor" | "epic"): string[]
```
Return values (exact string arrays, case-sensitive):
- `"bugfix"` → `["Think", "Build", "Ship"]`
- `"refactor"` → `["Think", "Plan", "Build", "Review", "Ship", "Reflect"]`
- `"epic"` → `["Think", "Plan", "Build", "Review", "Test", "Ship", "Reflect"]`

Verified by `phase-routing.test.ts` with 3 test cases (one per type).

### state-schema.test.ts contract
File exports/declares:
```typescript
const REQUIRED_ITERATION_FIELDS = ["project", "release", "release_goal", "epics", "active_epic", "iteration_start", "writer_lock", "active_phase", "dial"]
const REQUIRED_ROUTER_FIELDS = ["current_phase", "schema_version"]
```
Tests: for each of the 9 iteration-state fixture files, assert all REQUIRED_ITERATION_FIELDS are present. For any router-state fixture, assert REQUIRED_ROUTER_FIELDS present. Failure mode: `"Missing field <name> in fixture <filename>"`.

### gate-enforcement.test.ts contract
3 hook-testable test cases via `spawnSync('bash', ['src/hook/inject-workflow-state.sh'], ...)`:
1. `state.json.gates.sec-review.status = "pending"` + `current_phase = "ship"` → stdout contains `[BLOCKED] Ship blocked: sec-review gate not signed`
2. `state.json.schema_version = "2"` (mismatch) → stdout contains `[BLOCKED] state schema version mismatch`
3. `state.json.dry_run = true` + phase = "ship" → stdout contains `[DRY-RUN] cannot sign security gate in dry-run mode`

NOTE: These 3 tests define hook behavior that does NOT yet exist in inject-workflow-state.sh (Epic 1 did not implement gate/dry-run/schema-version checks). These tests will be RED until the hook is extended. They are written as TDD anchors — implement hook extensions in the same tasks as the gate-enforcement tests (red→green).

### iteration-state fixture schema contract
Each of the 9 `tests/orchestration/fixtures/iteration-state/<type>-<dial>.json` files is a valid `iteration.json` with at minimum:
- `active_epic`: string id (e.g., `"fix-auth-null-ptr"` for bugfix, `"refactor-auth-middleware"` for refactor, `"auth-epic-001"` for epic)
- `active_phase`: `"Delivery"`
- `dial`: the autonomy level matching the filename (`"HIGH"`, `"MID"`, or `"LOW"`)
- `epics`: array with one entry matching the active_epic id, with `type` field matching the fixture type
- `writer_lock`: `null`
- `project`, `release`, `release_goal`, `iteration_start` present (any valid values)
- `epic_dial_overrides`: `{}`
- `resume_log`: `[]`

### BDD scenario spec format contract
Each `tests/orchestration/scenarios/S{N}-{type}-{autonomy}.md` contains:
- H1: `# Scenario S{N}: {TYPE} + {AUTONOMY} autonomy`
- Fixture section referencing `fixtures/iteration-state/<type>-<autonomy>.json`
- Steps with `assert:` YAML blocks (4-space indented, machine-parseable by runner)
- Assertions using these forms only:
  - `assert: <jq-expression>` (evaluated against iteration.json)
  - `assert_hook_contains: "<string>"` (checked against hook stdout)
  - `assert_phase_not_in_history: "<phase>"` (checked against phase_history array)

### run-scenario.sh contract
`scripts/run-scenario.sh <scenario-id>` (e.g., `S1`):
- Single-source FIXTURE_MAP: `S1:bugfix-high S2:bugfix-mid S3:bugfix-low S4:refactor-high S5:refactor-mid S6:refactor-low S7:epic-high S8:epic-mid S9:epic-low S10:resume-incoherent S11:feedback-loop S12:gate-bypass`
- Outputs TAP version 14
- Sets up TEST_WORKSPACE in /tmp, copies fixture files
- Runs hook via `CLAUDE_PROJECT_DIR="$TEST_WORKSPACE" bash src/hook/inject-workflow-state.sh`
- Parses assert: lines from scenario .md via `grep "^assert"`
- Exit 0 if all assertions pass; exit 1 on any failure

### CI contract
`.github/workflows/test.yml` runs on `push` + `pull_request` to `master`:
- Step 1: `npm test` (Vitest — all unit tests)
- Step 2: loop `bash scripts/run-scenario.sh $id` for `S1 S2 S3 S4 S5 S6 S7 S8 S9`
- OS: `ubuntu-latest` (bash guaranteed)

### ts-orchestrate SKILL.md contract
`src/skills/ts-orchestrate/SKILL.md` — passive skill with routing logic:
- Entry gate: if no `iteration.json.active_epic`, force `/ts-project:plan --new`
- Complexity routing table: reads `epic.type` from `iteration.json`
- Three command stubs created at `src/skills/ts-orchestrate/commands/`:
  - `start.md` — entry point (replaces manual /ts-discover:idea)
  - `status.md` — cross-layer status (Discovery + Delivery view)
  - `next.md` — advance to next step (enforced)

### registry-lean.md contract
`src/skills/ts-deliver-router/references/registry-lean.md` — lean phase profile:
- Documents `bugfix` type → `["Think", "Build", "Ship"]` spine
- No G1 required for bugfix lean path
- No G2 required for bugfix lean path
- Format matches existing `phases.md` in ts-deliver-router/references/

### Layer 1 routing table contract
Appended to `src/skills/ts-project-planner/SKILL.md` as a new `## Workflow Routing` section:

| Starting point | Size | Activate |
|---|---|---|
| New idea | Any | /ts-discover:idea |
| Idea in Discovery | Small (bugfix/tweak) | /ts-discover:decide build → /ts-iteration:next → /ts-deliver:init --scope lean |
| Idea in Discovery | Medium/Large | /ts-discover:explore → validate → decide → /ts-project:plan --sync → /ts-iteration:start → /ts-iteration:next |
| Active epic | Any | /ts-deliver:status → /ts-deliver:refine (follow phase spine) |
| Epic complete | Any | /ts-iteration:next (or /ts-iteration:close if last) → /ts-discover:status |

Hard rules included:
- `HARD RULE: Never start /ts-deliver:init without an epic in iteration.json.active_epic.`
- `HARD RULE: Never mark epic done without G1 + G2 human sign-off.`

## Risks / Trade-offs

- [Risk] gate-enforcement.test.ts tests are RED until hook is extended — TDD intent, not a bug. Mitigation: implement hook extensions and tests together (same task).
- [Risk] S10-S12 not in CI → cross-cutting flows untested in automation. Mitigation: written as BDD specs for human execution; CI covers S1-S9 (type×autonomy matrix).
- [Risk] FIXTURE_MAP drift between runner and scenario filenames. Mitigation: single-source in run-scenario.sh; CI reads from runner (never duplicated).
- [Risk] ts-orchestrate SKILL.md passive — enforcement depends on hook being loaded. Mitigation: hook is always registered via install.sh (Epic 1); if hook fails, skill degrades gracefully (reads state files directly).
