## ADDED Requirements

### Requirement: state-schema.test.ts holds explicit REQUIRED-field lists
`src/tests/unit/state-schema.test.ts` SHALL declare a literal `REQUIRED_ITERATION_FIELDS` array and a `REQUIRED_ROUTER_FIELDS` array. These arrays are the single source of truth for what fields must exist in state files.

#### Scenario: REQUIRED_ITERATION_FIELDS covers all mandatory top-level fields
- **WHEN** a developer reads `state-schema.test.ts`
- **THEN** `REQUIRED_ITERATION_FIELDS` includes at minimum: `project`, `release`, `release_goal`, `epics`, `active_epic`, `iteration_start`, `writer_lock`, `active_phase`, `dial`

#### Scenario: REQUIRED_ROUTER_FIELDS covers router state mandatory fields
- **WHEN** a developer reads `state-schema.test.ts`
- **THEN** `REQUIRED_ROUTER_FIELDS` includes at minimum: `current_phase`, `schema_version`

### Requirement: state-schema.test.ts validates all 9 iteration-state fixtures
The test file SHALL iterate over all 9 fixture files in `tests/orchestration/fixtures/iteration-state/` and assert that every field in `REQUIRED_ITERATION_FIELDS` is present in each fixture.

#### Scenario: fixture passes schema validation
- **WHEN** `npm test` runs `state-schema.test.ts` against a complete fixture
- **THEN** all 9 fixtures pass with no missing-field errors

#### Scenario: unplanned field removal causes test to fail (drift detection)
- **WHEN** a required field (e.g., `active_phase`) is removed from a fixture file
- **THEN** the test fails with a message identifying the missing field and the fixture filename

##### Example: drift detection failure message
- **GIVEN** `bugfix-high.json` has `active_phase` removed
- **WHEN** `npm test` runs `state-schema.test.ts`
- **THEN** test fails with text matching `Missing field.*active_phase.*bugfix-high`

### Requirement: schema change → test RED within 60 seconds
Introducing a structural change to the iteration.json schema (adding a required field to `REQUIRED_ITERATION_FIELDS` without updating fixtures) SHALL cause `npm test` to fail within one test run (≤60s).

#### Scenario: intentional schema evolution updates both list and fixtures
- **WHEN** a developer adds a new required field to `REQUIRED_ITERATION_FIELDS`
- **THEN** all 9 fixture files must be updated to include the new field, or `npm test` fails (this is the expected workflow for intentional schema changes)
