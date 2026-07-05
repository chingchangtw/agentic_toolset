## MODIFIED Requirements

### Requirement: Manifest includes an agents category

`scripts/generate-manifest.mjs` SHALL scan `src/agents/*.md` (excluding
`README.md`) and add an `agents[]` array to `scripts/release-manifest.json`,
alongside the existing `skills[]` and `hooks[]` arrays. Each entry SHALL have
`{ name, src, dest }` where `dest` is `agents/<filename>`.

#### Scenario: manifest regenerates with 2 agent entries

- **WHEN** `node scripts/generate-manifest.mjs` runs with
  `src/agents/ts-event-storming-facilitator.md` and
  `src/agents/ts-ddd-tactical-validator.md` present
- **THEN** `release-manifest.json.agents` is an array of exactly 2 entries

### Requirement: Build packages the agents category

`scripts/build-release.mjs` SHALL copy every `manifest.agents` entry into the
build directory before zipping, using the same `cp()` helper used for hooks.

#### Scenario: release zip contains agents

- **WHEN** `npm run release` runs with a manifest containing 2 agent entries
- **THEN** `dist/release.zip` contains `agents/ts-event-storming-facilitator.md`
  and `agents/ts-ddd-tactical-validator.md`
