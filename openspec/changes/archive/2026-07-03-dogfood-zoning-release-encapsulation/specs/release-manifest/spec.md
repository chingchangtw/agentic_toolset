## ADDED Requirements

### Requirement: Zip manifest carries stamped release version

`scripts/build-release.mjs` SHALL write the `version` value from `package.json` into the `manifest.json` placed at the zip root as a `releaseVersion` field, alongside the existing schema `version` field (which remains `"1"`). The committed `scripts/release-manifest.json` SHALL NOT be required to contain `releaseVersion`; stamping occurs at build time.

#### Scenario: Stamped version matches package.json

- **WHEN** the release is built with `package.json` version `0.2.0`
- **THEN** `manifest.json` inside `dist/release.zip` contains `"releaseVersion": "0.2.0"` and `"version": "1"`

#### Scenario: Source manifest unstamped

- **WHEN** the manifest generator regenerates `scripts/release-manifest.json`
- **THEN** the committed manifest contains no `releaseVersion` field
