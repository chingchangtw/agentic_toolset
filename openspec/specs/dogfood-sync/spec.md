# dogfood-sync Specification

## Purpose

TBD - created by archiving change 'dogfood-zoning-release-encapsulation'. Update Purpose after archive.

## Requirements

### Requirement: Dogfood mirror sync is manifest-driven with mirror semantics

`scripts/dogfood.mjs` (npm script `dogfood`) SHALL read `scripts/release-manifest.json` and, for each declared skill, hook, and the commands directory, replace the corresponding path under this repo's `.claude/` with a fresh copy from `src/`, applying the shared exclusion filter from the packaging exclusion module. The sync SHALL delete the existing mirror path before copying so stale files cannot survive. The sync SHALL NOT write to any path outside `.claude/`, and SHALL refuse to delete a computed target that resolves outside `.claude/`.

#### Scenario: Sync leaves git clean

- **WHEN** the working tree is clean and `npm run dogfood` completes successfully
- **THEN** `git status --porcelain` produces no output

#### Scenario: Stale mirror file removed

- **WHEN** a file exists in `.claude/skills/<deliverable>/` that no longer exists in `src/skills/<deliverable>/` and `npm run dogfood` runs
- **THEN** the stale file is absent from the mirror after sync

#### Scenario: Ring 0 failure blocks sync

- **WHEN** the Ring 0 static check exits non-zero
- **THEN** `npm run dogfood` exits non-zero without modifying any mirror path


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
### Requirement: Pre-sync snapshot and rollback

Before modifying any mirror path, `scripts/dogfood.mjs` SHALL snapshot the current mirror contents to `.claude/.dogfood-prev/`. `npm run dogfood:rollback` SHALL restore the mirror from that snapshot. Rollback with no snapshot present SHALL exit non-zero with a one-line reason.

#### Scenario: Rollback restores previous mirror

- **WHEN** a sync has completed and `npm run dogfood:rollback` runs
- **THEN** every mirror path matches its pre-sync content

#### Scenario: Rollback without snapshot

- **WHEN** `.claude/.dogfood-prev/` does not exist and `npm run dogfood:rollback` runs
- **THEN** the command exits non-zero and prints a reason


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
### Requirement: Gitignore block generated from manifest

`scripts/generate-gitignore-block.mjs` SHALL rewrite a marked region in `.gitignore` (between `# BEGIN dogfood-mirror (generated)` and `# END dogfood-mirror`) containing: one entry per manifest skill mapped to its `.claude/skills/` mirror path, `.claude/hook/`, `.claude/commands/load-skill.md`, `.claude/.dogfood-prev/`, `.claude/.toolset-version`, `dist/release-lkg.zip`, and the machine-local state files `.agents/discovery.json`, `.agents/ts-deliver-router/state.json`, `.agents/ts-deliver-router/history.jsonl`. Content outside the marked region SHALL NOT be modified. The generator SHALL be idempotent.

#### Scenario: Idempotent regeneration

- **WHEN** the generator runs twice in a row
- **THEN** `.gitignore` is byte-identical after the second run

#### Scenario: New manifest skill enters ignore block

- **WHEN** a new skill is added to the manifest and the generator runs
- **THEN** the marked region contains an entry for that skill's `.claude/skills/` mirror path


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
### Requirement: Mirror and state paths untracked in git

The git index SHALL NOT contain the dogfood mirror paths (the 7 deliverable skill copies under `.claude/skills/`, `.claude/hook/`, `.claude/commands/load-skill.md`) nor the machine-local state files listed in the gitignore block. Files SHALL remain on disk (index removal only). Dev-tooling skills, `.claude/settings.json`, `.claude/CLAUDE.md`, and other non-mirror `.claude/` content SHALL remain tracked.

#### Scenario: Mirror untracked, tooling tracked

- **WHEN** `git ls-files .claude/` runs after migration
- **THEN** no mirror path appears in the output and dev-tooling skill paths still appear

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