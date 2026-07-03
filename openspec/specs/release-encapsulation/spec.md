# release-encapsulation Specification

## Purpose

TBD - created by archiving change 'dogfood-zoning-release-encapsulation'. Update Purpose after archive.

## Requirements

### Requirement: Shared packaging exclusion filter

A single exclusion module (`scripts/lib/exclusions.mjs`) SHALL define the packaging filter (directory names `rawfiles`, `raw`, `ideas`, `registry`, `node_modules`; file patterns `*.original.md`, `SKILL_caveman.md`, `README.md`, `.DS_Store`) and SHALL be consumed by both `scripts/build-release.mjs` and `scripts/dogfood.mjs`, so the release zip and the dogfood mirror contain identical file sets per artifact.

#### Scenario: Excluded content absent from zip

- **WHEN** a skill source directory contains a `rawfiles/` subdirectory and the release is built
- **THEN** no path under `rawfiles/` appears inside `dist/release.zip`

#### Scenario: Build and mirror agree

- **WHEN** the same manifest skill is packaged and dogfood-synced
- **THEN** the file set in the zip entry and the mirror directory are identical


<!-- @trace
source: dogfood-zoning-release-encapsulation
updated: 2026-07-03
code:
  - test-fixtures/hook-payloads/statusline.json
  - scripts/pilot.mjs
  - scripts/verify-install.mjs
  - scripts/build-release.mjs
  - scripts/lib/exclusions.mjs
  - test-fixtures/hook-payloads/user-prompt-submit.json
  - src/hook/ts-statusline_wrapper.sh
  - package.json
  - USER_GUIDE.md
  - scripts/dogfood.mjs
  - src/skills/ts-orchestrate/SKILL.md
  - scripts/ring0-check.mjs
  - release/install.sh
  - .agents/ts-deliver-router/state.json
  - release/install.ps1
  - scripts/release-manifest.json
  - src/hook/ts-statusline_wrapper.ps1
  - scripts/generate-gitignore-block.mjs
  - docs/architecture.md
  - .agents/discovery.json
-->

---
### Requirement: Build always regenerates the manifest

`scripts/build-release.mjs` SHALL regenerate `scripts/release-manifest.json` (via the manifest generator) before packaging, so a stale committed manifest can never determine zip contents.

#### Scenario: New skill ships without manual manifest edit

- **WHEN** a new skill directory with a valid `SKILL.md` exists under `src/skills/` and the build runs
- **THEN** the built zip contains that skill and the regenerated manifest declares it


<!-- @trace
source: dogfood-zoning-release-encapsulation
updated: 2026-07-03
code:
  - test-fixtures/hook-payloads/statusline.json
  - scripts/pilot.mjs
  - scripts/verify-install.mjs
  - scripts/build-release.mjs
  - scripts/lib/exclusions.mjs
  - test-fixtures/hook-payloads/user-prompt-submit.json
  - src/hook/ts-statusline_wrapper.sh
  - package.json
  - USER_GUIDE.md
  - scripts/dogfood.mjs
  - src/skills/ts-orchestrate/SKILL.md
  - scripts/ring0-check.mjs
  - release/install.sh
  - .agents/ts-deliver-router/state.json
  - release/install.ps1
  - scripts/release-manifest.json
  - src/hook/ts-statusline_wrapper.ps1
  - scripts/generate-gitignore-block.mjs
  - docs/architecture.md
  - .agents/discovery.json
-->

---
### Requirement: Build staging cleanup

`scripts/build-release.mjs` SHALL remove `.release-build/` after successfully writing `dist/release.zip`.

#### Scenario: No staging residue

- **WHEN** a build completes successfully
- **THEN** `.release-build/` does not exist


<!-- @trace
source: dogfood-zoning-release-encapsulation
updated: 2026-07-03
code:
  - test-fixtures/hook-payloads/statusline.json
  - scripts/pilot.mjs
  - scripts/verify-install.mjs
  - scripts/build-release.mjs
  - scripts/lib/exclusions.mjs
  - test-fixtures/hook-payloads/user-prompt-submit.json
  - src/hook/ts-statusline_wrapper.sh
  - package.json
  - USER_GUIDE.md
  - scripts/dogfood.mjs
  - src/skills/ts-orchestrate/SKILL.md
  - scripts/ring0-check.mjs
  - release/install.sh
  - .agents/ts-deliver-router/state.json
  - release/install.ps1
  - scripts/release-manifest.json
  - src/hook/ts-statusline_wrapper.ps1
  - scripts/generate-gitignore-block.mjs
  - docs/architecture.md
  - .agents/discovery.json
-->

---
### Requirement: Installers deploy commands and version marker

`release/install.sh` and `release/install.ps1` SHALL copy the zip's `commands/` directory into the target project's `.claude/commands/` and SHALL write the manifest's `releaseVersion` value to the target project's `.claude/.toolset-version`. When the zip manifest lacks `releaseVersion` (legacy zip), installation SHALL complete without writing a marker and without failing. `scripts/verify-install.mjs` SHALL assert commands and marker parity between both installers.

#### Scenario: Commands and marker installed

- **WHEN** install.sh runs against a zip containing `commands/load-skill.md` and a stamped manifest
- **THEN** the target project contains `.claude/commands/load-skill.md` and `.claude/.toolset-version` with the stamped version

#### Scenario: Legacy zip without stamp

- **WHEN** install.sh runs against a zip whose manifest lacks `releaseVersion`
- **THEN** installation completes successfully and no `.claude/.toolset-version` is written


<!-- @trace
source: dogfood-zoning-release-encapsulation
updated: 2026-07-03
code:
  - test-fixtures/hook-payloads/statusline.json
  - scripts/pilot.mjs
  - scripts/verify-install.mjs
  - scripts/build-release.mjs
  - scripts/lib/exclusions.mjs
  - test-fixtures/hook-payloads/user-prompt-submit.json
  - src/hook/ts-statusline_wrapper.sh
  - package.json
  - USER_GUIDE.md
  - scripts/dogfood.mjs
  - src/skills/ts-orchestrate/SKILL.md
  - scripts/ring0-check.mjs
  - release/install.sh
  - .agents/ts-deliver-router/state.json
  - release/install.ps1
  - scripts/release-manifest.json
  - src/hook/ts-statusline_wrapper.ps1
  - scripts/generate-gitignore-block.mjs
  - docs/architecture.md
  - .agents/discovery.json
-->

---
### Requirement: Dead wrapper hooks removed from deliverables

`src/hook/ts-statusline_wrapper.sh` and `src/hook/ts-statusline_wrapper.ps1` SHALL be deleted and SHALL NOT appear in the regenerated manifest or the release zip; installers continue to generate their statusline wrapper dynamically.

#### Scenario: Wrappers absent from release

- **WHEN** the release is built after removal
- **THEN** no `ts-statusline_wrapper.*` file exists in the zip or manifest

<!-- @trace
source: dogfood-zoning-release-encapsulation
updated: 2026-07-03
code:
  - test-fixtures/hook-payloads/statusline.json
  - scripts/pilot.mjs
  - scripts/verify-install.mjs
  - scripts/build-release.mjs
  - scripts/lib/exclusions.mjs
  - test-fixtures/hook-payloads/user-prompt-submit.json
  - src/hook/ts-statusline_wrapper.sh
  - package.json
  - USER_GUIDE.md
  - scripts/dogfood.mjs
  - src/skills/ts-orchestrate/SKILL.md
  - scripts/ring0-check.mjs
  - release/install.sh
  - .agents/ts-deliver-router/state.json
  - release/install.ps1
  - scripts/release-manifest.json
  - src/hook/ts-statusline_wrapper.ps1
  - scripts/generate-gitignore-block.mjs
  - docs/architecture.md
  - .agents/discovery.json
-->