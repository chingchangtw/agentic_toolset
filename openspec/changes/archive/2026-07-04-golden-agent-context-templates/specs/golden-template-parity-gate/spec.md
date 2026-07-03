## ADDED Requirements

### Requirement: checkGoldenParity reports every drifted or missing golden file

`scripts/lib/golden-templates.mjs` SHALL export `checkGoldenParity()`, which SHALL return an array of `{ file, reason }` entries, one per file in `GOLDEN_FILES` whose `assets/golden/<relpath>` copy does not exist (`reason: "missing"`) or exists but is not byte-identical to `src/project_root_structure/<relpath>` (`reason: "content-mismatch"`). Files that match exactly SHALL NOT appear in the returned array.

#### Scenario: Single-character drift is detected

- **WHEN** `assets/golden/CLAUDE.md` differs from `src/project_root_structure/CLAUDE.md` by a single character and `checkGoldenParity()` is called
- **THEN** the returned array SHALL contain exactly one entry `{ file: "CLAUDE.md", reason: "content-mismatch" }`

#### Scenario: Missing golden copy is detected

- **WHEN** `assets/golden/.github/copilot-instructions.md` does not exist and `checkGoldenParity()` is called
- **THEN** the returned array SHALL contain an entry `{ file: ".github/copilot-instructions.md", reason: "missing" }`

#### Scenario: Fully synced tree returns empty

- **WHEN** every file in `assets/golden/` is byte-identical to its `src/project_root_structure/` source and `checkGoldenParity()` is called
- **THEN** the returned array SHALL be empty

### Requirement: Release build fails on any parity drift

`scripts/build-release.mjs` SHALL call `checkGoldenParity()` before creating `dist/release.zip`. When the returned array is non-empty, the build SHALL print one line per entry in the form `golden template drift: <file> (<reason>)` and exit with a non-zero status without producing `dist/release.zip`.

#### Scenario: Build blocked by drifted golden template

- **WHEN** any golden file has drifted and `node scripts/build-release.mjs` runs
- **THEN** the process SHALL exit non-zero and `dist/release.zip` SHALL NOT be written

#### Scenario: Synced tree builds normally

- **WHEN** `npm run sync-golden` has been run and no source files changed since, and `node scripts/build-release.mjs` runs
- **THEN** the process SHALL exit zero and `dist/release.zip` SHALL contain all 5 files under `skills/ondemand/ts-project-init-advisor/assets/golden/`, subpaths preserved
