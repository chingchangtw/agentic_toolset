## ADDED Requirements

### Requirement: Manifest file declares all release artifacts

`scripts/release-manifest.json` SHALL exist and contain a JSON object with three fields: `version` (string, value `"1"`), `skills` (array), and `hooks` (array).

Each skills entry SHALL contain: `name` (string), `src` (path relative to project root), `dest` (path relative to zip root).

Each hooks entry SHALL contain: `name` (string), `src` (path relative to project root), `dest` (path relative to zip root), `scope` (`"user"` or `"project"`).

#### Scenario: skills array contains ondemand skills at correct dest

- **WHEN** `src/skills/ondemand/ts-project-init-advisor/` exists
- **THEN** the skills array SHALL contain an entry with `dest` equal to `"skills/ondemand/ts-project-init-advisor"`

##### Example: ondemand skill dest value

| Skill source path | Expected dest value |
| --- | --- |
| `src/skills/ts-deliver-router` | `skills/ts-deliver-router` |
| `src/skills/ondemand/ts-project-init-advisor` | `skills/ondemand/ts-project-init-advisor` |

#### Scenario: hooks array encodes scope correctly

- **WHEN** the manifest is read
- **THEN** `inject-workflow-state.sh` SHALL have `scope` equal to `"project"`
- **THEN** all other hooks SHALL have `scope` equal to `"user"`

##### Example: hook scope values

| Hook name | Expected scope |
| --- | --- |
| `ts-session-guard.py` | `user` |
| `ts-statusline_bridge.py` | `user` |
| `inject-workflow-state.sh` | `project` |

### Requirement: Manifest is valid JSON parseable by python3 and PowerShell

`scripts/release-manifest.json` SHALL be standard JSON with no comments and no trailing commas, parseable by `python3 -c "import json; json.load(open('scripts/release-manifest.json'))"` and PowerShell `Get-Content | ConvertFrom-Json`.

#### Scenario: manifest parses without error in python3

- **WHEN** `python3 -c "import json; json.load(open('scripts/release-manifest.json'))"` is run
- **THEN** exit code SHALL be 0 and no error output

#### Scenario: manifest parses without error in PowerShell

- **WHEN** `Get-Content scripts/release-manifest.json | ConvertFrom-Json` is run in PowerShell
- **THEN** the command SHALL complete without exception

### Requirement: build-release.mjs reads manifest instead of hardcoding skill enumeration

`scripts/build-release.mjs` SHALL read `scripts/release-manifest.json` and iterate over `skills` and `hooks` arrays. It SHALL NOT contain a hardcoded skill name list or hook allowlist.

If `scripts/release-manifest.json` is absent, `build-release.mjs` SHALL exit non-zero with the message: `scripts/release-manifest.json not found — run generate-manifest first`.

#### Scenario: new skill auto-included after manifest regeneration

- **WHEN** a new skill is added to `src/skills/` and `generate-manifest.mjs` is re-run
- **THEN** `build-release.mjs` SHALL include the new skill in the zip without any script modification

#### Scenario: missing manifest causes build failure

- **WHEN** `scripts/release-manifest.json` is absent and `build-release.mjs` runs
- **THEN** process exits non-zero with message containing `scripts/release-manifest.json not found`

### Requirement: install scripts route artifacts via manifest fields

Both `release/install.sh` and `release/install.ps1` SHALL parse the manifest embedded in the zip and use `dest` to determine copy target and `scope` to determine install root.

Skills with `dest` starting `skills/ondemand/` SHALL install under `[project]/.claude/skills/ondemand/`. All other skills SHALL install under `[project]/.claude/skills/`. Hooks with `scope: "user"` SHALL install to `~/.claude/hooks/`. Hooks with `scope: "project"` SHALL install to `[project]/.claude/hooks/`.

#### Scenario: install routes ondemand skill to correct subdirectory

- **WHEN** manifest entry has `dest: "skills/ondemand/ts-project-init-advisor"` and install script runs
- **THEN** skill SHALL be copied to `[project]/.claude/skills/ondemand/ts-project-init-advisor/`

#### Scenario: install routes project-scoped hook to project directory

- **WHEN** manifest entry has `scope: "project"` and install script runs
- **THEN** hook SHALL be copied to `[project]/.claude/hooks/`, not `~/.claude/hooks/`

### Requirement: backward compatibility when manifest absent from zip

If the zip does not contain a manifest (old release), install scripts SHALL fall back to current install behavior without error.

#### Scenario: old zip without manifest installs normally

- **WHEN** zip contains no `manifest.json` at zip root
- **THEN** install script SHALL complete without error using pre-manifest logic
