## ADDED Requirements

### Requirement: Generator scans src and produces scripts/release-manifest.json

`scripts/generate-manifest.mjs` SHALL scan `src/skills/` (including `src/skills/ondemand/`) and `src/hook/` and write a valid `scripts/scripts/release-manifest.json`.

Skill entries SHALL use `dest` mirroring the source subtree relative to `src/`: a skill at `src/skills/ts-deliver-router` produces `dest: "skills/ts-deliver-router"`. An ondemand skill at `src/skills/ondemand/ts-project-init-advisor` produces `dest: "skills/ondemand/ts-project-init-advisor"`.

Hook entries SHALL use `dest` equal to `hook/<filename>`.

#### Scenario: generator produces entries for all skills including ondemand

- **WHEN** `node scripts/generate-manifest.mjs` runs
- **THEN** every skill directory under `src/skills/` SHALL have a corresponding entry in `manifest.skills`
- **THEN** every skill directory under `src/skills/ondemand/` SHALL have a corresponding entry with `dest` prefixed `skills/ondemand/`

##### Example: skill entries produced

| Skill source | Expected dest |
| --- | --- |
| `src/skills/ts-deliver-router` | `skills/ts-deliver-router` |
| `src/skills/ts-project-planner` | `skills/ts-project-planner` |
| `src/skills/ondemand/ts-project-init-advisor` | `skills/ondemand/ts-project-init-advisor` |

#### Scenario: generator produces entries for all hooks

- **WHEN** `node scripts/generate-manifest.mjs` runs
- **THEN** every file in `src/hook/` SHALL have a corresponding entry in `manifest.hooks`


<!-- @trace
source: release-manifest
updated: 2026-07-02
code:
  - scripts/verify-install.mjs
  - .github/workflows/test.yml
  - scripts/generate-manifest.mjs
  - release/install.sh
  - tasks/ideasHarness.md
  - package.json
  - release/install.ps1
  - tasks/PRD-harness-loop-engineering.md
  - scripts/release-manifest.json
  - scripts/build-release.mjs
-->

### Requirement: Generator assigns default scope to hook entries

The generator SHALL assign `scope: "user"` to all hook entries except `inject-workflow-state.sh`, which SHALL receive `scope: "project"`. This default is applied when an entry is newly created.

#### Scenario: scope defaults are assigned on first run

- **WHEN** no prior `scripts/release-manifest.json` exists and generator runs
- **THEN** `inject-workflow-state.sh` entry SHALL have `scope: "project"`
- **THEN** all other hook entries SHALL have `scope: "user"`


<!-- @trace
source: release-manifest
updated: 2026-07-02
code:
  - scripts/verify-install.mjs
  - .github/workflows/test.yml
  - scripts/generate-manifest.mjs
  - release/install.sh
  - tasks/ideasHarness.md
  - package.json
  - release/install.ps1
  - tasks/PRD-harness-loop-engineering.md
  - scripts/release-manifest.json
  - scripts/build-release.mjs
-->

### Requirement: Generator preserves existing scope values on re-run

When `scripts/release-manifest.json` already exists, the generator SHALL merge the new scan result with the existing manifest, preserving the `scope` value for any hook entry whose `name` is present in both old and new manifests.

#### Scenario: hand-edited scope survives re-run

- **GIVEN** `scripts/release-manifest.json` exists with `inject-workflow-state.sh` having `scope: "project"`
- **WHEN** generator runs again with no structural changes
- **THEN** the resulting manifest SHALL still have `inject-workflow-state.sh` with `scope: "project"`

#### Scenario: removed hook is dropped from manifest

- **GIVEN** `scripts/release-manifest.json` contains a hook entry for `old-hook.sh`
- **WHEN** `old-hook.sh` no longer exists in `src/hook/` and generator runs
- **THEN** `old-hook.sh` SHALL NOT appear in the resulting manifest


<!-- @trace
source: release-manifest
updated: 2026-07-02
code:
  - scripts/verify-install.mjs
  - .github/workflows/test.yml
  - scripts/generate-manifest.mjs
  - release/install.sh
  - tasks/ideasHarness.md
  - package.json
  - release/install.ps1
  - tasks/PRD-harness-loop-engineering.md
  - scripts/release-manifest.json
  - scripts/build-release.mjs
-->

### Requirement: Generator exits non-zero on missing source directories

If `src/skills/` or `src/hook/` does not exist, the generator SHALL exit with a non-zero exit code and print an error message identifying the missing directory.

#### Scenario: missing src/skills causes error exit

- **WHEN** `src/skills/` does not exist and generator runs
- **THEN** process exits non-zero with message identifying the missing path


<!-- @trace
source: release-manifest
updated: 2026-07-02
code:
  - scripts/verify-install.mjs
  - .github/workflows/test.yml
  - scripts/generate-manifest.mjs
  - release/install.sh
  - tasks/ideasHarness.md
  - package.json
  - release/install.ps1
  - tasks/PRD-harness-loop-engineering.md
  - scripts/release-manifest.json
  - scripts/build-release.mjs
-->

### Requirement: npm run release chains generate-manifest before build-release

`package.json` `release` script SHALL execute `node scripts/generate-manifest.mjs && node scripts/build-release.mjs`.

#### Scenario: single command produces updated zip

- **WHEN** `npm run release` is run after adding a new skill to `src/skills/`
- **THEN** `scripts/release-manifest.json` is updated and `dist/release.zip` includes the new skill without any other manual step

## Requirements


<!-- @trace
source: release-manifest
updated: 2026-07-02
code:
  - scripts/verify-install.mjs
  - .github/workflows/test.yml
  - scripts/generate-manifest.mjs
  - release/install.sh
  - tasks/ideasHarness.md
  - package.json
  - release/install.ps1
  - tasks/PRD-harness-loop-engineering.md
  - scripts/release-manifest.json
  - scripts/build-release.mjs
-->

### Requirement: Generator scans src and produces scripts/release-manifest.json

`scripts/generate-manifest.mjs` SHALL scan `src/skills/` (including `src/skills/ondemand/`) and `src/hook/` and write a valid `scripts/scripts/release-manifest.json`.

Skill entries SHALL use `dest` mirroring the source subtree relative to `src/`: a skill at `src/skills/ts-deliver-router` produces `dest: "skills/ts-deliver-router"`. An ondemand skill at `src/skills/ondemand/ts-project-init-advisor` produces `dest: "skills/ondemand/ts-project-init-advisor"`.

Hook entries SHALL use `dest` equal to `hook/<filename>`.

#### Scenario: generator produces entries for all skills including ondemand

- **WHEN** `node scripts/generate-manifest.mjs` runs
- **THEN** every skill directory under `src/skills/` SHALL have a corresponding entry in `manifest.skills`
- **THEN** every skill directory under `src/skills/ondemand/` SHALL have a corresponding entry with `dest` prefixed `skills/ondemand/`

##### Example: skill entries produced

| Skill source | Expected dest |
| --- | --- |
| `src/skills/ts-deliver-router` | `skills/ts-deliver-router` |
| `src/skills/ts-project-planner` | `skills/ts-project-planner` |
| `src/skills/ondemand/ts-project-init-advisor` | `skills/ondemand/ts-project-init-advisor` |

#### Scenario: generator produces entries for all hooks

- **WHEN** `node scripts/generate-manifest.mjs` runs
- **THEN** every file in `src/hook/` SHALL have a corresponding entry in `manifest.hooks`

---
### Requirement: Generator assigns default scope to hook entries

The generator SHALL assign `scope: "user"` to all hook entries except `inject-workflow-state.sh`, which SHALL receive `scope: "project"`. This default is applied when an entry is newly created.

#### Scenario: scope defaults are assigned on first run

- **WHEN** no prior `scripts/release-manifest.json` exists and generator runs
- **THEN** `inject-workflow-state.sh` entry SHALL have `scope: "project"`
- **THEN** all other hook entries SHALL have `scope: "user"`

---
### Requirement: Generator preserves existing scope values on re-run

When `scripts/release-manifest.json` already exists, the generator SHALL merge the new scan result with the existing manifest, preserving the `scope` value for any hook entry whose `name` is present in both old and new manifests.

#### Scenario: hand-edited scope survives re-run

- **GIVEN** `scripts/release-manifest.json` exists with `inject-workflow-state.sh` having `scope: "project"`
- **WHEN** generator runs again with no structural changes
- **THEN** the resulting manifest SHALL still have `inject-workflow-state.sh` with `scope: "project"`

#### Scenario: removed hook is dropped from manifest

- **GIVEN** `scripts/release-manifest.json` contains a hook entry for `old-hook.sh`
- **WHEN** `old-hook.sh` no longer exists in `src/hook/` and generator runs
- **THEN** `old-hook.sh` SHALL NOT appear in the resulting manifest

---
### Requirement: Generator exits non-zero on missing source directories

If `src/skills/` or `src/hook/` does not exist, the generator SHALL exit with a non-zero exit code and print an error message identifying the missing directory.

#### Scenario: missing src/skills causes error exit

- **WHEN** `src/skills/` does not exist and generator runs
- **THEN** process exits non-zero with message identifying the missing path

---
### Requirement: npm run release chains generate-manifest before build-release

`package.json` `release` script SHALL execute `node scripts/generate-manifest.mjs && node scripts/build-release.mjs`.

#### Scenario: single command produces updated zip

- **WHEN** `npm run release` is run after adding a new skill to `src/skills/`
- **THEN** `scripts/release-manifest.json` is updated and `dist/release.zip` includes the new skill without any other manual step