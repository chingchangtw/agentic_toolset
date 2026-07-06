# Think — REFACTOR-INSTALLER-DEDUP

Date: 2026-07-06 · WORK_TYPE: refactor · Spine: Think → Plan[G1] → Build → Review → Ship → Reflect

## Goal (one sentence)

Collapse the skills/hooks/agents manifest-category duplication in
`build-release.mjs`, `dogfood.mjs`, `install.sh`, `install.ps1` to one
reusable pattern per file, so a 4th category needs one call site instead of
a new copy-pasted loop — with zero change to what actually gets installed.

## Problem (tracked open item, docs/Ideas.md §12/§14)

Flagged during EPIC-DUAL-TRACK-ORCHESTRATION's Review phase, deferred as
non-blocking, still open. Four files each wire skills/hooks/agents as
separate near-identical loops:

- **`scripts/build-release.mjs`**: 3 loops (skills/hooks/agents), each
  `for (const entry of manifest.X) { cp(src, dest); log(...) }`. Skills adds
  `validateSkill()` + `filtered: true`; hooks/agents don't. Real variation,
  not pure duplication.
- **`scripts/dogfood.mjs`**: 6 loops total — 3 in `mirrorTargets()` building
  a `{src, dest, dir, zipPath}` array, 3 more in the `--from-zip` branch
  doing the same from a zip-extracted manifest. These 6 ARE near-pure
  duplication — same shape, differing only in source array and the `dir`
  flag (skills=true, hooks/agents=false).
- **`release/install.sh`**: 3 separate `python -c` subprocess spawns (one
  per category) each parsing `manifest.json` fresh, feeding a bash
  `while read` loop with a different field set and action per category
  (skills: recursive dir copy + subpath split; hooks: scope-routed copy +
  chmod +x; agents: copy + rename to `<name>.md`).
- **`release/install.ps1`**: 3 `foreach` blocks over `$manifest.X` directly
  (PowerShell parses JSON natively — no subprocess dance). Same three
  distinct actions as install.sh, expressed natively.

**Real duplication vs. real variation.** Not all four files have the same
disease. `dogfood.mjs`'s 6 loops are near-pure duplication (safe, high-value
extraction). `build-release.mjs`'s 3 loops share a shape but skills needs an
extra validation step. `install.sh`/`install.ps1`'s 3 blocks each share only
the *iteration skeleton* (read category → act per entry) — the per-entry
action is genuinely different per category (dir-copy vs. scope-routed
file-copy-with-chmod vs. renamed-file-copy). A single "one true function"
across all three actions would need a callback/scriptblock parameter, which
is where the real risk of introducing installer bugs on end-user machines
lives (indirection bugs are harder to spot in a script nobody unit-tests
per-OS).

## Target shape per file

- **`dogfood.mjs`**: extract `pushCategoryTargets(targets, entries, {srcRoot, destRoot, dir})`
  — one helper, 6 call sites shrink to one line each.
- **`build-release.mjs`**: extract `copyManifestCategory(entries, {rootDir, buildDir, filtered, validate, label})`
  — one helper, 3 call sites; skills passes `validate: validateSkill, filtered: true`,
  hooks/agents omit both (defaults are the current no-op behavior).
- **`install.sh`**: consolidate 3 python subprocess spawns into 1 — a single
  python heredoc reads `manifest.json` once and emits ALL rows across all 3
  categories, each line prefixed with a category tag
  (`skill\t...` / `hook\t...` / `agent\t...`). ONE bash `while read` loop
  dispatches on the tag via `case`, each arm doing exactly what its current
  per-category block does (byte-identical action, just relocated into a
  case arm instead of a standalone loop).
- **`install.ps1`**: mirror the same shape — a single `foreach` over a
  category-tagged flat list (or, more idiomatically for PowerShell, define
  `$InstallActions = @{ skill = {...}; hook = {...}; agent = {...} }` and one
  loop that looks up the right scriptblock per manifest key). Exact per-entry
  logic unchanged, just relocated.

## Invariants (non-negotiable)

- **Byte-identical installed output.** Every file that lands on disk after
  install — path, content, permission bits (`chmod +x` on hooks) — must be
  identical to today's. This is the acceptance contract, verified by
  `npm run pilot` (already asserts the full installed tree) plus a manual
  `diff -r` against a captured baseline install for extra confidence given
  this touches release/install.sh directly (pilot only covers install.sh,
  not install.ps1 — no pwsh test harness exists in CI, so install.ps1
  changes get static review + the pwsh 7.6.3 now installed locally, per the
  earlier verification precedent this session).
- **`node scripts/verify-install.mjs` passes** — sh/ps1 parity check.
- **Zip contents unchanged.** `npm run release` must produce the same
  `dist/release.zip` file listing (paths + categories) as before.
- **Dogfood mirror unchanged.** `npm run dogfood` must produce the same
  `.claude/` tree; rollback (`--rollback`) and `--from-zip` paths keep
  working (both exercised by existing scripts, not just the default sync).
- **No new dependencies**, no new config files, no change to
  `scripts/release-manifest.json`'s shape.
- **Legacy no-manifest fallback branches stay untouched** in both installers
  (old zips without `manifest.json` — out of scope, not manifest-category
  code).

## Explicitly out of scope

- Changing the manifest.json schema itself.
- Touching the legacy (no-manifest) fallback install paths.
- `generate-manifest.mjs`'s own 3 scan loops (skills/hooks/agents) — these
  scan *source* directories with genuinely different filters (skills:
  recursive dir scan with ondemand/ special-case; hooks: flat file scan
  excluding `.md`; agents: flat file scan requiring `.md`) — real variation,
  not the duplication this epic targets. Not touched.
- Any output-message wording changes.

## G1 threat-model (elevated scrutiny — installer runs on end-user machines)

- **Data flows:** unchanged — reads `manifest.json` (bundled in the zip,
  trusted — it's our own release artifact), writes to `~/.claude/`,
  `<project>/.claude/`, and (dogfood only) this repo's own `.claude/`
  mirror. No new read/write targets introduced.
- **STRIDE — Tampering (the relevant category for an installer):** the
  refactor does not change *what* gets written or *where* — only how the
  loop that decides that is structured. The existing unconditional-cp
  overwrite behavior (already accepted at G1 for the prior epic, matches
  skills/hooks) is unchanged, extended to the same shape it already has for
  agents. No new overwrite-without-guard surface introduced.
- **Privacy:** no PII touched, before or after.
- **Auth:** N/A — local install, no auth boundary. `curl|bash` / `irm|iex`
  trust model is unchanged (same GitHub Releases source, same zip).
- **Never-automate:** none of the 3 categories' install actions are
  human-gated today (they're mechanical file placement, not decisions) —
  refactor preserves that; no new automation of a previously-manual step.
- **Blast radius:** `scripts/build-release.mjs`, `scripts/dogfood.mjs`,
  `release/install.sh`, `release/install.ps1` — 4 files, all regenerated/
  redistributed via the release pipeline (`npm run release`), never
  hand-run against a real user machine during development.
- **Recovery:** `git revert`; `npm run dogfood:rollback` for the local
  mirror; installer changes only affect *future* installs — no migration of
  already-installed user machines needed (reinstalling with the old zip
  still works if a regression ships, since GitHub Releases keeps prior
  versions).

## Verification plan (Build phase)

1. Capture baseline: `npm run release` (fresh zip), `npm run pilot` output,
   `npm run dogfood` tree listing, `node scripts/verify-install.mjs` output —
   before any edit.
2. Apply the 4 file changes.
3. Re-run all of the above; `diff` zip file listings, `diff -r` a pilot
   install of old-zip vs new-zip into two temp dirs, `diff -r` the dogfood
   `.claude/` mirror before/after.
4. Manual smoke: run `install.ps1` under the newly-installed local `pwsh`
   against a locally-built zip (`$env:ZIP_FILE`), inspect the resulting tree.
