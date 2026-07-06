## MODIFIED Requirements

### Requirement: run-scenario.sh is the single source of FIXTURE_MAP
`scripts/run-scenario.sh` SHALL define FIXTURE_MAP exactly once. CI workflow SHALL call the runner script (never duplicate the map in the workflow YAML). The runner's test workspace SHALL use `.agents/` as the state-root directory name (fixture path, iteration.json path, and `ts-deliver-router/state.json` path), matching the directory name `src/hook/inject-workflow-state.sh` reads via `$PROJ/.agents/...`.

#### Scenario: FIXTURE_MAP covers all 12 scenario IDs
- **WHEN** `grep FIXTURE_MAP scripts/run-scenario.sh` is run
- **THEN** output contains all 12 mappings: S1:bugfix-high through S12:gate-bypass in a single definition

#### Scenario: S1 runner exits 0 with passing assertions
- **WHEN** `bash scripts/run-scenario.sh S1` runs against the bugfix-high fixture
- **THEN** script exits 0 and stdout contains TAP "ok" lines for each assertion

#### Scenario: unknown scenario ID exits non-zero
- **WHEN** `bash scripts/run-scenario.sh S99` is run
- **THEN** script exits non-zero with an error message

#### Scenario: runner workspace path matches the hook's read path
- **WHEN** `bash scripts/run-scenario.sh S1` runs and the hook is invoked with `CLAUDE_PROJECT_DIR` set to the runner's test workspace
- **THEN** the hook finds `$CLAUDE_PROJECT_DIR/.agents/ts-deliver-router/state.json` and `$CLAUDE_PROJECT_DIR/.agents/iteration.json`, and its `assert_hook_contains` assertion for `[WORKFLOW STATE] ts-deliver phase: think` passes
