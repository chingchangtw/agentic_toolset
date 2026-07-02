## Why

Release packaging logic is duplicated and hardcoded across `scripts/build-release.mjs`, `release/install.sh`, and `release/install.ps1`. Any structural change (e.g., adding an `ondemand/` skill tier) must be applied in all three places manually — a gap that already caused a bug where `ts-project-init-advisor` landed in the wrong install directory. A single source of truth eliminates this class of error.

## What Changes

- New `scripts/release-manifest.json` — declares every artifact (skills, hooks) with its source path, install destination, and hook scope (user vs project); lives in `scripts/` alongside the build scripts that produce and consume it
- New `scripts/generate-manifest.mjs` — scans `src/skills/` and `src/hook/` to create/sync `scripts/release-manifest.json`; preserves hand-authored metadata (hook scope) on re-runs
- Updated `scripts/build-release.mjs` — reads manifest instead of hardcoded skill list and hook allowlist
- Updated `release/install.sh` — reads manifest via `python3` (already available) to drive all install decisions
- Updated `release/install.ps1` — reads manifest via `ConvertFrom-Json` (already available) to drive all install decisions
- Updated `package.json` — `npm run release` chains `generate-manifest && build-release`
- New `scripts/verify-install.mjs` — CI parity check: runs both install scripts against a mock ZIP, asserts output directory trees are identical

## Non-Goals

- No runtime dependency changes at install time (`python3` and PowerShell already used; no `jq` or Node required on end-user machines)
- Does not change what gets installed — only how the install decision is expressed
- Does not introduce install-time network calls or version resolution
- `scripts/verify-install.mjs` checks structural parity between installers; it does not test hook registration or settings patching

## Capabilities

### New Capabilities

- `release-manifest`: Single-source JSON declaring all release artifacts (skills with dest, hooks with scope); consumed by build and both install scripts
- `manifest-generator`: Script that syncs `scripts/release-manifest.json` from `src/` directory structure; preserves existing metadata on re-runs; wired into `npm run release`
- `install-parity-check`: CI script asserting `install.sh` and `install.ps1` produce identical directory layouts from the same manifest; catches installer drift before it ships

### Modified Capabilities

(none — no spec-level behavior changes to existing capabilities)

## Impact

- Affected specs: release-manifest (new), manifest-generator (new), install-parity-check (new)
- Affected code:
  - New: `scripts/release-manifest.json`
  - New: `scripts/generate-manifest.mjs`
  - New: `scripts/verify-install.mjs`
  - Modified: `scripts/build-release.mjs`
  - Modified: `release/install.sh`
  - Modified: `release/install.ps1`
  - Modified: `package.json`
