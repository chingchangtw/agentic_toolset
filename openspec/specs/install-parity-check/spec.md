## ADDED Requirements

### Requirement: verify-install.mjs asserts install.sh and install.ps1 produce identical directory trees

`scripts/verify-install.mjs` SHALL:
1. Build a mock directory tree matching the manifest's zip layout
2. Run `install.sh` against the mock tree (using `bash`)
3. Run `install.ps1` against the mock tree (using `pwsh`)
4. Compare the resulting output directory trees
5. Exit 0 if trees are identical; exit non-zero and print a diff if they differ

"Directory tree" means the set of relative file paths installed under the simulated `[project]/.claude/skills/` and `[project]/.claude/hooks/` roots. Content comparison is out of scope — path presence only.

#### Scenario: parity check passes when both installers produce same structure

- **WHEN** `node scripts/verify-install.mjs` runs and both install scripts copy all manifest entries to matching destinations
- **THEN** process exits 0 with no diff output

#### Scenario: parity check fails when install.sh omits a skill that install.ps1 includes

- **WHEN** install.sh and install.ps1 produce different sets of installed files
- **THEN** process exits non-zero and prints the diverging paths

##### Example: diverging paths output format

- **GIVEN** `install.sh` installs `skills/ts-deliver-router/SKILL.md` but `install.ps1` does not
- **WHEN** verify-install runs
- **THEN** output SHALL include a line identifying `skills/ts-deliver-router/SKILL.md` as present in sh result but absent in ps1 result


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

### Requirement: verify-install.mjs is wired into CI

`.github/workflows/test.yml` SHALL include a step that runs `node scripts/verify-install.mjs` after `npm run release` succeeds. The step SHALL fail the CI run if verify-install exits non-zero.

#### Scenario: CI fails on installer drift

- **WHEN** a change causes install.sh and install.ps1 to produce different layouts and CI runs
- **THEN** the verify-install CI step SHALL fail and block merge


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

### Requirement: verify-install.mjs requires bash and pwsh on CI runner

The script header SHALL document that both `bash` and `pwsh` must be available on the runner. `scripts/verify-install.mjs` SHALL check for both executables at startup and exit with an informative message if either is missing.

#### Scenario: missing pwsh causes early exit with message

- **WHEN** `pwsh` is not available on the machine and verify-install runs
- **THEN** process exits non-zero with message: `pwsh not found — required to verify install.ps1`

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

### Requirement: verify-install.mjs asserts install.sh and install.ps1 produce identical directory trees

`scripts/verify-install.mjs` SHALL:
1. Build a mock directory tree matching the manifest's zip layout
2. Run `install.sh` against the mock tree (using `bash`)
3. Run `install.ps1` against the mock tree (using `pwsh`)
4. Compare the resulting output directory trees
5. Exit 0 if trees are identical; exit non-zero and print a diff if they differ

"Directory tree" means the set of relative file paths installed under the simulated `[project]/.claude/skills/` and `[project]/.claude/hooks/` roots. Content comparison is out of scope — path presence only.

#### Scenario: parity check passes when both installers produce same structure

- **WHEN** `node scripts/verify-install.mjs` runs and both install scripts copy all manifest entries to matching destinations
- **THEN** process exits 0 with no diff output

#### Scenario: parity check fails when install.sh omits a skill that install.ps1 includes

- **WHEN** install.sh and install.ps1 produce different sets of installed files
- **THEN** process exits non-zero and prints the diverging paths

##### Example: diverging paths output format

- **GIVEN** `install.sh` installs `skills/ts-deliver-router/SKILL.md` but `install.ps1` does not
- **WHEN** verify-install runs
- **THEN** output SHALL include a line identifying `skills/ts-deliver-router/SKILL.md` as present in sh result but absent in ps1 result

---
### Requirement: verify-install.mjs is wired into CI

`.github/workflows/test.yml` SHALL include a step that runs `node scripts/verify-install.mjs` after `npm run release` succeeds. The step SHALL fail the CI run if verify-install exits non-zero.

#### Scenario: CI fails on installer drift

- **WHEN** a change causes install.sh and install.ps1 to produce different layouts and CI runs
- **THEN** the verify-install CI step SHALL fail and block merge

---
### Requirement: verify-install.mjs requires bash and pwsh on CI runner

The script header SHALL document that both `bash` and `pwsh` must be available on the runner. `scripts/verify-install.mjs` SHALL check for both executables at startup and exit with an informative message if either is missing.

#### Scenario: missing pwsh causes early exit with message

- **WHEN** `pwsh` is not available on the machine and verify-install runs
- **THEN** process exits non-zero with message: `pwsh not found — required to verify install.ps1`