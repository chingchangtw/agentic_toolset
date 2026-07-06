## Why

`scripts/build-release.mjs`, `scripts/dogfood.mjs`, `release/install.sh`, and
`release/install.ps1` each wire the skills/hooks/agents manifest categories as
separate near-identical blocks (3 loops in build-release.mjs, 6 loops in
dogfood.mjs, 3 python/bash blocks in install.sh, 3 foreach blocks in
install.ps1). Adding a 4th category today means copy-pasting a new block into
all 4 files instead of one call site each. Flagged non-blocking during
EPIC-DUAL-TRACK-ORCHESTRATION's Review phase (docs/Ideas.md §12/§14),
addressed now as its own refactor epic.

## What Changes

- `scripts/dogfood.mjs`: extract `pushCategoryTargets(targets, entries, {srcRoot, destRoot, dir})` — the 6 near-pure-duplicate loops (3 in `mirrorTargets()`, 3 in the `--from-zip` branch) collapse to one call each.
- `scripts/build-release.mjs`: extract `copyManifestCategory(entries, {rootDir, buildDir, filtered, validate, label})` — the 3 loops collapse to one call each; skills passes `validate: validateSkill, filtered: true`, hooks/agents omit both.
- `release/install.sh`: consolidate the 3 separate `python3 -c` subprocess spawns into one heredoc that reads `manifest.json` once and emits all rows across all 3 categories, tagged by category; one bash `while read` loop dispatches per tag via `case`, each arm doing exactly what its current per-category block does.
- `release/install.ps1`: mirror the same shape — one `foreach` over a category-tagged flat list (or a `$InstallActions` scriptblock map), same per-entry logic per category, just relocated.
- No change to what gets installed, no change to the release manifest's schema, no change to any output message wording.

## Non-Goals

(see design.md — Non-Goals recorded there since design.md is part of this change)

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none). This is a pure internal refactor: installed output and CLI behavior
are unchanged. Existing specs install-parity-check, dogfood-sync, and
release-manifest already codify the invariants this change must continue to
satisfy, and none of their requirements are changing.

## Impact

- Affected specs: none (no requirement-level behavior changes; the install-parity-check spec's sh/ps1 parity assertion is the regression check this refactor must keep passing)
- Affected code:
  - Modified: scripts/build-release.mjs, scripts/dogfood.mjs, release/install.sh, release/install.ps1
  - New: none
  - Removed: none
