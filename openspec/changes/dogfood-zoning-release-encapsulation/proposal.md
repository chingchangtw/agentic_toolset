## Why

The repo authors deliverable artifacts in `src/` but dogfoods them by copying into git-tracked `.claude/` locations. Every dogfood deploy dirties dozens of tracked files outside `src/` (two sources of truth), and the release zip ships undeclared junk (`rawfiles/`, `ideas/`, drafts) with no version stamp, no exclusions, and a stale committed manifest. Dogfooding is also unsafe: a broken hook installed into this repo bricks the dev environment with no rollback path.

## What Changes

- Introduce three git zones: tracked source (`src/`), tracked dev tooling (external skills in `.claude/skills/`), and a gitignored dogfood mirror (framework's own skills/hooks/commands copied into `.claude/`).
- Generate the dogfood-mirror gitignore entries from `scripts/release-manifest.json` into a marked block in `.gitignore`; untrack the currently tracked mirror copies and machine-local state files under `.agents/`.
- Add `scripts/dogfood.mjs` (`npm run dogfood`): manifest-driven mirror sync `src/` to `.claude/` with stale-file deletion, pre-sync snapshot to a rollback dir, and a rollback command.
- Add safety rings before dogfood: Ring 0 static checks (skill lint + hook smoke tests against fixture payloads) wired as a mandatory pre-step; Ring 1 pilot install (`npm run pilot`) running the real installer from the built zip into a disposable fixture project; last-known-good zip commands (`dogfood:bless`, `dogfood:restore-lkg`).
- Harden `scripts/build-release.mjs`: always regenerate the manifest before building, apply packaging exclusions (scratch dirs and draft files never enter the zip), stamp the `package.json` version into the zip's `manifest.json`, clean `.release-build/` after zipping.
- Installers (`release/install.sh`, `release/install.ps1`): deploy the packaged `commands/` directory and write an installed-version marker file into the target project.
- Remove dead packaged wrapper hooks from `src/hook/` (installers generate their own wrapper dynamically).

## Capabilities

### New Capabilities

- `dogfood-sync`: manifest-driven mirror sync from `src/` into this repo's `.claude/` dogfood zone, generated gitignore block, and untracked machine-local state.
- `dogfood-safety-rings`: Ring 0 static verification gate, Ring 1 pilot fixture install, snapshot rollback, and last-known-good zip recovery for safe self-deployment.
- `release-encapsulation`: allowlist/exclusion packaging, release version stamping, commands install step, installed-version marker, and build staging cleanup.

### Modified Capabilities

- `release-manifest`: manifest gains a stamped release version (from `package.json`) at build time, alongside the existing schema version.

## Impact

- Affected specs: `dogfood-sync` (new), `dogfood-safety-rings` (new), `release-encapsulation` (new), `release-manifest` (modified).
- Affected code:
  - New: scripts/dogfood.mjs, scripts/generate-gitignore-block.mjs, scripts/ring0-check.mjs, scripts/pilot.mjs, scripts/lib/exclusions.mjs, test-fixtures/hook-payloads/user-prompt-submit.json
  - Modified: scripts/build-release.mjs, release/install.sh, release/install.ps1, .gitignore, package.json, scripts/verify-install.mjs
  - Removed: src/hook/ts-statusline_wrapper.sh, src/hook/ts-statusline_wrapper.ps1, tracked git index entries for the dogfood mirror paths under .claude/ and machine-local state under .agents/ (files stay on disk, removed from tracking only)
