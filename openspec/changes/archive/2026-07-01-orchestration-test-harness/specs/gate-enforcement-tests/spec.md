## ADDED Requirements

### Requirement: hook outputs [BLOCKED] for unsigned G2 gate at Ship phase
When `ts-deliver-router/state.json` has `current_phase = "ship"` and `gates.sec-review.status = "pending"`, the hook SHALL output a line containing `[BLOCKED] Ship blocked: sec-review gate not signed`.

#### Scenario: unsigned G2 blocks Ship phase
- **WHEN** state.json has `current_phase = "ship"` and `gates["sec-review"]["status"] = "pending"`
- **THEN** hook stdout contains `[BLOCKED] Ship blocked: sec-review gate not signed`

### Requirement: hook outputs [BLOCKED] for schema version mismatch
When `ts-deliver-router/state.json` has `schema_version` not equal to `"1"`, the hook SHALL output a line containing `[BLOCKED] state schema version mismatch`.

#### Scenario: mismatched schema version blocks execution
- **WHEN** state.json has `schema_version = "2"` (or any value other than `"1"`)
- **THEN** hook stdout contains `[BLOCKED] state schema version mismatch`

##### Example: mismatch values
| schema_version value | Expected output |
|---|---|
| `"2"` | `[BLOCKED] state schema version mismatch` |
| `"0"` | `[BLOCKED] state schema version mismatch` |
| `"1"` | No [BLOCKED] line (normal operation) |

### Requirement: hook outputs [DRY-RUN] warning for gate sign in dry-run mode
When `ts-deliver-router/state.json` has `dry_run = true` and phase is `"ship"`, the hook SHALL output a line containing `[DRY-RUN] cannot sign security gate in dry-run mode`.

#### Scenario: dry-run prevents gate signing
- **WHEN** state.json has `dry_run = true` and `current_phase = "ship"`
- **THEN** hook stdout contains `[DRY-RUN] cannot sign security gate in dry-run mode`

### Requirement: gate-enforcement.test.ts implements the 3 hook-testable edge cases as Vitest tests
`src/tests/unit/gate-enforcement.test.ts` SHALL implement exactly the 3 gate-enforcement cases above as Vitest tests using `spawnSync('bash', ['src/hook/inject-workflow-state.sh'], { env: { CLAUDE_PROJECT_DIR: tmpDir } })`. These tests SHALL be RED until the hook is extended to implement the gate/schema/dry-run checks.

#### Scenario: tests are TDD anchors (red before hook extension)
- **WHEN** `npm test` runs `gate-enforcement.test.ts` before hook extensions are implemented
- **THEN** all 3 tests fail (this is the expected TDD red state)

#### Scenario: tests pass after hook is extended
- **WHEN** `src/hook/inject-workflow-state.sh` is updated to implement gate/schema/dry-run checks
- **THEN** all 3 `gate-enforcement.test.ts` tests pass

### Requirement: LLM-behavior edge cases are NOT in gate-enforcement.test.ts
Edge cases from `edge-tests.md` that require LLM judgment (edges 1, 2, 4, 5) SHALL NOT be implemented as Vitest tests. They belong in BDD scenario assertion blocks (S10-S12) as free-text English assertions for human/LLM execution.

#### Scenario: hook-testable vs LLM-behavior cases correctly separated
- **WHEN** a developer reads `gate-enforcement.test.ts`
- **THEN** the file contains exactly 3 tests (edges 3, 6, 7 from edge-tests.md) and a comment documenting that edges 1, 2, 4, 5 are covered by BDD scenarios
