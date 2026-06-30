## ADDED Requirements

### Requirement: Hook reads workflow state on every prompt turn
The hook script `inject-workflow-state.sh` SHALL read `$PROJ/.ai/ts-deliver-router/state.json` and `$PROJ/.ai/iteration.json` on every `UserPromptSubmit` event, where `PROJ="${CLAUDE_PROJECT_DIR:-$(pwd)}"`.

#### Scenario: ts-deliver state present
- **WHEN** `ts-deliver-router/state.json` exists with a valid `current_phase` field
- **THEN** hook outputs a line matching `[WORKFLOW STATE] ts-deliver phase: <phase> | active epic: <id>`

#### Scenario: only iteration.json present (discovery mode)
- **WHEN** `ts-deliver-router/state.json` does NOT exist and `iteration.json` exists
- **THEN** hook outputs a line matching `[WORKFLOW STATE] Discovery | dial: <dial> | active_epic: <id or none>`

#### Scenario: no state files
- **WHEN** neither `ts-deliver-router/state.json` nor `iteration.json` exists
- **THEN** hook outputs nothing (empty stdout)

### Requirement: Hook emits phase-specific NEXT command guidance
For each known delivery phase, the hook SHALL emit a `[NEXT]` line with the exact next command expected.

#### Scenario: known phase maps to NEXT guidance
- **WHEN** `current_phase` is one of `think|plan|build|review|test|ship|reflect` (lowercase)
- **THEN** hook emits `[NEXT] <command>` on the line immediately following `[WORKFLOW STATE]`

##### Example: phase-to-NEXT mapping
| current_phase | Expected [NEXT] content |
|---|---|
| think | `Run /ts-deliver:refine after Spectra:discuss + G1 threat-model sign-off` |
| plan | `Run /ts-deliver:refine after Spectra:propose + design review` |
| build | `Run /ts-deliver:refine after Spectra:apply + test coverage gate` |
| review | `Run /ts-deliver:refine after staff-review report` |
| test | `Run /ts-deliver:refine after acceptance + integration gates` |
| ship | `Run /ts-deliver:refine after Spectra:archive + G2 sec-review sign-off` |
| reflect | `Run /ts-iteration:next (or /ts-iteration:close if last epic)` |

#### Scenario: unknown phase value
- **WHEN** `current_phase` contains a value not in the known enum (`think|plan|build|review|test|ship|reflect`)
- **THEN** hook emits `[NEXT] Unknown phase: <value> — check state.json`

### Requirement: Hook is silent on error
The hook SHALL NOT emit any output when `jq` is unavailable, when JSON files are malformed, or when file reads fail. All error paths MUST exit silently (stderr suppressed, stdout empty).

#### Scenario: jq unavailable or JSON malformed
- **WHEN** `jq` is not installed or `state.json` contains invalid JSON
- **THEN** hook exits with no stdout output

### Requirement: Hook reads active_epic from iteration.json, not router state
The hook SHALL read `active_epic` from `iteration.json.active_epic`. It SHALL NOT attempt to read an `epic_id` field from `ts-deliver-router/state.json`.

#### Scenario: active epic displayed in workflow state line
- **WHEN** `iteration.json.active_epic` is a non-null string `"fix-auth-null-ptr"`
- **THEN** hook output contains `active epic: fix-auth-null-ptr`

#### Scenario: null active_epic
- **WHEN** `iteration.json.active_epic` is null or absent
- **THEN** hook output contains `active epic: none`

### Requirement: Hook MUST NOT echo free-text notes fields
The hook SHALL only echo enum or id fields from state files. It SHALL NOT echo `iteration.json.epics[].notes` or any other free-text field, to prevent prompt injection.

#### Scenario: notes field present in iteration.json
- **WHEN** `iteration.json.epics[0].notes` contains arbitrary text
- **THEN** hook output does NOT include that notes text

### Requirement: Hook installs to project-level hooks directory
`install.sh` SHALL copy `inject-workflow-state.sh` to `${PROJECT_CLAUDE_DIR}/hooks/` (not `~/.claude/hooks/`) and register a `UserPromptSubmit` entry in the project `.claude/settings.json`.

#### Scenario: hook not yet installed
- **WHEN** install.sh runs and `${PROJECT_CLAUDE_DIR}/hooks/inject-workflow-state.sh` does NOT exist
- **THEN** install.sh copies the script, sets executable bit, and adds the UserPromptSubmit hook entry

#### Scenario: hook already installed (idempotent re-install)
- **WHEN** install.sh runs and the UserPromptSubmit hook command is already present in settings.json
- **THEN** install.sh does NOT add a duplicate entry

### Requirement: Hook filename included in build-release.mjs allowlist
`scripts/build-release.mjs` SHALL include `inject-workflow-state.sh` in the hook file array that controls which files are copied from `src/hook/` to the release zip.

#### Scenario: build runs with hook in allowlist
- **WHEN** `npm run build` executes `build-release.mjs`
- **THEN** `dist/release/hook/inject-workflow-state.sh` exists in the output

### Requirement: iteration-schema.md documents orchestration fields
`src/skills/ts-project-planner/references/iteration-schema.md` SHALL document the 5 orchestration fields (`active_phase`, `active_idea`, `dial`, `epic_dial_overrides`, `resume_log`) as top-level iteration.json fields owned by ts-orchestrate.

#### Scenario: schema doc updated
- **WHEN** a developer reads iteration-schema.md
- **THEN** all 5 fields appear in the top-level fields table with correct owner and description

### Requirement: Vitest tests validate hook output for all phases
`src/tests/unit/hook-output.test.ts` SHALL cover 9+ test cases: one per known phase, empty state (no output), and unknown phase warning.

#### Scenario: each known phase produces correct output
- **WHEN** test sets up a fixture directory with `ts-deliver-router/state.json` containing phase=X and `iteration.json` with active_epic
- **THEN** `spawnSync('bash', ['src/hook/inject-workflow-state.sh'], { env: { CLAUDE_PROJECT_DIR: tmpDir } })` stdout matches expected `[WORKFLOW STATE]` and `[NEXT]` lines

#### Scenario: fixture files resolve via import.meta.url
- **WHEN** test imports fixtures from `src/tests/fixtures/`
- **THEN** paths are resolved using `fileURLToPath(new URL('../fixtures/...', import.meta.url))` (ESM-safe, not `__dirname`)
