## ADDED Requirements

### Requirement: 9 iteration-state fixtures cover all type×autonomy combinations
`tests/orchestration/fixtures/iteration-state/` SHALL contain exactly 9 JSON files: `bugfix-high.json`, `bugfix-mid.json`, `bugfix-low.json`, `refactor-high.json`, `refactor-mid.json`, `refactor-low.json`, `epic-high.json`, `epic-mid.json`, `epic-low.json`. Each SHALL be a valid iteration.json with all REQUIRED_ITERATION_FIELDS present.

#### Scenario: fixture file schema is complete
- **WHEN** `jq .` is run against any of the 9 fixture files
- **THEN** exit 0 and output contains `active_phase`, `active_epic`, `dial`, `epics`, `writer_lock`

##### Example: fixture field values by type×autonomy
| Fixture | active_phase | dial | epics[0].type |
|---|---|---|---|
| bugfix-high.json | "Delivery" | "HIGH" | "bugfix" |
| refactor-mid.json | "Delivery" | "MID" | "refactor" |
| epic-low.json | "Delivery" | "LOW" | "epic" |

### Requirement: S1-S9 BDD scenarios cover the full type×autonomy matrix
`tests/orchestration/scenarios/` SHALL contain S1-S9.md files, one per type×autonomy combination. Each scenario SHALL include: fixture reference, step sequence with expected hook outputs, and `assert:` blocks with jq expressions evaluating against iteration.json.

#### Scenario: S1 (BUGFIX + HIGH) verifies lean spine skips Plan/Review/Test
- **WHEN** scenario S1 assertions are evaluated against the bugfix-high fixture
- **THEN** `assert_phase_not_in_history: "Plan"` and `assert_phase_not_in_history: "Review"` and `assert_phase_not_in_history: "Test"` all pass

#### Scenario: S7 (EPIC + HIGH) verifies G2 gate is required even in HIGH autonomy
- **WHEN** scenario S7 assertions are evaluated
- **THEN** assertion block includes a check that G2 gate sign-off is required (EPIC HIGH never auto-signs)

### Requirement: S10-S12 cover cross-cutting flows as BDD specs
`tests/orchestration/scenarios/` SHALL contain S10-resume-incoherent.md, S11-feedback-loop.md, S12-gate-bypass.md with scenario steps and assertion blocks. These scenarios are for human/LLM execution; they are NOT in the CI loop.

#### Scenario: S12 gate-bypass scenario documents the expected block behavior
- **WHEN** a human reads S12-gate-bypass.md
- **THEN** the scenario includes an assertion that attempting to bypass G2 on EPIC type results in a [BLOCKED] output from the hook

### Requirement: run-scenario.sh is the single source of FIXTURE_MAP
`scripts/run-scenario.sh` SHALL define FIXTURE_MAP exactly once. CI workflow SHALL call the runner script (never duplicate the map in the workflow YAML).

#### Scenario: FIXTURE_MAP covers all 12 scenario IDs
- **WHEN** `grep FIXTURE_MAP scripts/run-scenario.sh` is run
- **THEN** output contains all 12 mappings: S1:bugfix-high through S12:gate-bypass in a single definition

#### Scenario: S1 runner exits 0 with passing assertions
- **WHEN** `bash scripts/run-scenario.sh S1` runs against the bugfix-high fixture
- **THEN** script exits 0 and stdout contains TAP "ok" lines for each assertion

#### Scenario: unknown scenario ID exits non-zero
- **WHEN** `bash scripts/run-scenario.sh S99` is run
- **THEN** script exits non-zero with an error message

### Requirement: CI runs npm test + S1-S9 on every PR to master
`.github/workflows/test.yml` SHALL define a job running on `ubuntu-latest` that (1) runs `npm test` via `npx vitest run` and (2) loops `bash scripts/run-scenario.sh $id` for `S1 S2 S3 S4 S5 S6 S7 S8 S9` on every `push` or `pull_request` to `master`.

#### Scenario: CI workflow triggers on PR to master
- **WHEN** a pull request is opened against master
- **THEN** the workflow runs both Vitest unit tests and the S1-S9 scenario loop

#### Scenario: failing Vitest test causes CI to fail
- **WHEN** any Vitest test in `src/tests/unit/` fails
- **THEN** the workflow step exits non-zero and the CI run is marked failed
