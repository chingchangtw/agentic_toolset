## ADDED Requirements

### Requirement: Ring 0 static verification gate

`scripts/ring0-check.mjs` SHALL, for every skill in `scripts/release-manifest.json`, assert that `SKILL.md` exists and its frontmatter parses; and for every manifest hook runnable on the current platform, execute it with the matching fixture payload from `test-fixtures/hook-payloads/` on stdin and assert exit code 0. A hook not runnable on the current platform SHALL be skipped with a printed warning. Any assertion failure SHALL cause a non-zero exit with the failing artifact named.

#### Scenario: Broken hook fails the gate

- **WHEN** a manifest hook exits non-zero against its fixture payload
- **THEN** ring0-check exits non-zero and names the failing hook

#### Scenario: Platform-inapplicable hook skipped loudly

- **WHEN** a manifest hook cannot run on the current platform
- **THEN** ring0-check prints a skip warning and does not count it as passing silently

### Requirement: Ring 1 pilot install in disposable fixture

`scripts/pilot.mjs` (npm script `pilot`) SHALL build `dist/release.zip`, create a clean temporary fixture project directory, run the real `release/install.sh` against it using a local-zip override (no network download), then assert: manifest skills present under the fixture's `.claude/skills/`, hooks routed per scope, `commands/` deployed, `.claude/.toolset-version` written, and each project-scoped installed hook exits 0 against its fixture payload. The repo working tree SHALL be unmodified by a pilot run. The command SHALL print PASS or FAIL and exit accordingly.

#### Scenario: Pilot passes on healthy build

- **WHEN** `npm run pilot` runs against a correct build
- **THEN** it prints PASS, exits 0, and `git status --porcelain` in the repo produces no output

#### Scenario: Pilot fails on broken installer output

- **WHEN** an expected file is missing from the fixture after install
- **THEN** pilot prints FAIL naming the missing path and exits non-zero

### Requirement: Last-known-good zip recovery

`npm run dogfood:bless` SHALL copy `dist/release.zip` to `dist/release-lkg.zip`. `npm run dogfood:restore-lkg` SHALL re-sync the dogfood mirror from the contents of `dist/release-lkg.zip` and SHALL exit non-zero with a one-line reason when no LKG zip exists. Both commands SHALL be runnable from a plain terminal without a Claude session.

#### Scenario: Restore from blessed zip

- **WHEN** a blessed LKG zip exists and `npm run dogfood:restore-lkg` runs
- **THEN** the mirror matches the LKG zip contents

#### Scenario: Restore without blessed zip

- **WHEN** no `dist/release-lkg.zip` exists and `npm run dogfood:restore-lkg` runs
- **THEN** the command exits non-zero and prints a reason
