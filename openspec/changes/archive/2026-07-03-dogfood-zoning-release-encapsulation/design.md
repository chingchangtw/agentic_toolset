## Context

The repo is a distribution framework: skills, hooks, commands, and scaffold authored in `src/`, packaged by `scripts/build-release.mjs` into `dist/release.zip` per `scripts/release-manifest.json`, and installed into end-user projects by `release/install.sh` / `release/install.ps1` (targets `<project>/.claude/`). The author dogfoods in this same repo by hand-copying or running the installer against it. Current state: `.claude/skills/` holds both 18 external dev-tooling skills and hand-maintained copies of 7 deliverable skills; `.claude/hook/` mirrors `src/hook/`; all of `.claude/` and `.agents/` are git-tracked. A recent dogfood copy dirtied 43 tracked files. The build blindly `cpSync`s whole skill directories (ships `rawfiles/`, `ideas/`, `registry/`, `SKILL.original.md`), the committed manifest can go stale, `commands/` is zipped but never installed, and no version is stamped anywhere.

## Goals / Non-Goals

**Goals:**

- Dogfood deployment never dirties git: mirror paths are generated, gitignored, disposable.
- `src/` is the single hand-edited source of truth for deliverables.
- Release zip contains only manifest-declared, exclusion-filtered files, stamped with the release version.
- Dogfooding is safe: static gate before sync, pilot install in a fixture before self-install, one-command rollback, last-known-good recovery.

**Non-Goals:**

- No blanket gitignore of `.claude/` — dev tooling skills, `settings.json`, `CLAUDE.md`, and command dirs stay tracked.
- No rewrite of `verify-install.mjs` parity architecture (its hand-duplicated installer logic is a known drift risk, out of scope).
- No CI pipeline creation; commands are wired for local use, CI wiring is follow-up.
- No changes to skill content or hook behavior — packaging and deployment only.
- No symlink-based mirror: rejected because hooks registered via absolute paths and cross-platform (Windows) behavior of symlinked skill dirs are unverified; copies are predictable.

## Decisions

### Manifest is the single contract driving sync, gitignore, and packaging

`scripts/release-manifest.json` (always regenerated before build) is the sole authority for what is a deliverable. `dogfood.mjs`, the gitignore block generator, and `build-release.mjs` all read it. Alternative — separate config lists per tool — rejected: lists drift, manifest already exists.

### Gitignore block is generated, not hand-maintained

`scripts/generate-gitignore-block.mjs` rewrites a marked region in `.gitignore` (`# BEGIN dogfood-mirror (generated)` ... `# END dogfood-mirror`) containing one entry per manifest skill dest mapped to `.claude/skills/<dest-without-skills-prefix>/`, plus `.claude/hook/`, `.claude/commands/load-skill.md`, `.claude/.dogfood-prev/`, `.claude/.toolset-version`, and machine-local state (`.agents/discovery.json`, `.agents/ts-deliver-router/state.json`, `.agents/ts-deliver-router/history.jsonl`). Alternative — hand-edit `.gitignore` — rejected: new skills would silently re-enter tracking.

### Mirror sync uses delete-then-copy with pre-sync snapshot

`scripts/dogfood.mjs` for each manifest entry: snapshot current mirror dir to `.claude/.dogfood-prev/`, delete the mirror path, copy from `src/` applying the same exclusion filter as the build. Mirror semantics (not additive copy) so stale files cannot survive. `--rollback` flag restores `.claude/.dogfood-prev/` contents. Sync refuses to run if Ring 0 fails.

### Packaging uses a global exclusion filter shared by build and sync

Exclusion patterns (directory names `rawfiles`, `raw`, `ideas`, `registry`, `node_modules`; file patterns `*.original.md`, `SKILL_caveman.md`, `README.md`, `.DS_Store`) live in one module (`scripts/lib/exclusions.mjs`) consumed by both `build-release.mjs` and `dogfood.mjs`, so the mirror equals the shipped artifact. Alternative — per-skill allowlist in SKILL.md frontmatter — deferred: more durable but requires touching every skill; exclusion list is the v1 with a follow-up path.

### Version stamping via manifest field plus installed marker

`build-release.mjs` writes `releaseVersion` (from `package.json` `version`) into the `manifest.json` placed at zip root. Installers write that value to `<project>/.claude/.toolset-version`. Existing `version: "1"` schema field is untouched. Enables upgrade detection and "what is installed" queries.

### Ring 0 static gate: skill lint plus hook smoke tests

`scripts/ring0-check.mjs`: for each manifest skill, assert `SKILL.md` exists and frontmatter parses; for each manifest hook that is executable on the current platform, run it with a fixture payload from `test-fixtures/hook-payloads/` on stdin and assert exit code 0. Wired as pre-step of `dogfood` and `pilot` npm scripts. Rationale: a broken hook bricks every prompt turn — hooks get executed, not just existence-checked.

### Ring 1 pilot install runs the real installer against a fixture

`scripts/pilot.mjs`: build the zip, create a clean temp fixture project dir, run `release/install.sh` against it with the local zip (installer gains a `ZIP_FILE` override env var to skip the GitHub download), assert expected tree (skills, hooks, commands, version marker, settings patch) and run installed hooks once against fixture payloads. The pilot absorbs damage; the repo is untouched. Alternative — install straight into the repo and hope — is the current failure mode.

### Last-known-good zip for nuclear recovery

`npm run dogfood:bless` copies `dist/release.zip` to `dist/release-lkg.zip` (gitignored). `npm run dogfood:restore-lkg` re-syncs the mirror from the LKG zip contents. Recovery works from a plain terminal without a working Claude session.

### Untrack mirror and state files in ignore-then-untrack order

Migration commits: (1) tag `pre-dogfood-zoning`; (2) add generated gitignore block; (3) `git rm -r --cached` the mirror paths and state files (disk copies retained). Order matters — untracking before ignoring re-shows the files as untracked noise.

### Remove dead packaged wrappers, install commands

`src/hook/ts-statusline_wrapper.sh` and `.ps1` are deleted (installers generate their own wrapper dynamically; packaged copies are dead weight). Both installers gain a `commands/` deploy step into `<project>/.claude/commands/` so `load-skill.md` actually reaches end users.

## Implementation Contract

**Commands and observable behavior:**

- `npm run dogfood` → runs Ring 0, snapshots, syncs mirror; afterwards `git status --porcelain` is empty (given clean pre-state). Non-zero exit and no sync if Ring 0 fails.
- `npm run dogfood:rollback` → restores mirror from `.claude/.dogfood-prev/`; exits non-zero with message if no snapshot exists.
- `npm run dogfood:bless` / `npm run dogfood:restore-lkg` → manage `dist/release-lkg.zip`; restore-lkg exits non-zero if no LKG exists.
- `npm run pilot` → builds zip, installs into a temp fixture via real `install.sh` with `ZIP_FILE` override, asserts tree + hook smoke, prints PASS/FAIL, exits accordingly. Repo working tree untouched.
- `npm run build:release` (existing `release` script) → always regenerates manifest first; resulting zip contains no path matching the exclusion list; `manifest.json` at zip root has `releaseVersion` equal to `package.json` `version`; `.release-build/` absent after completion.
- `install.sh` / `install.ps1` → additionally copy zip `commands/` into `<project>/.claude/commands/` and write `<project>/.claude/.toolset-version` containing `releaseVersion`. Legacy zips without `releaseVersion` install without a marker (no failure).
- `scripts/generate-gitignore-block.mjs` → idempotent: running twice yields identical `.gitignore`; content outside the marked block is never modified.

**Error modes:** every script exits non-zero with a one-line reason on failure; `dogfood.mjs` never deletes outside manifest-derived `.claude/` paths (guard: computed target must be inside `.claude/`).

**In scope:** scripts listed in proposal Impact, installers, `.gitignore`, `package.json` scripts, git untracking migration, fixture payloads.
**Out of scope:** skill/hook content, CI, verify-install rewrite, symlinks, per-skill allowlists.

## Risks / Trade-offs

- [Exclusion list rots as new scratch dirs appear] → single shared module, Ring 0 could later add a zip-content audit; per-skill allowlist is the documented follow-up.
- [`git rm --cached` mistake removes wrong tracked files] → tag `pre-dogfood-zoning` first; migration on a branch; paths generated from manifest, reviewed in diff before commit.
- [Windows parity: install.ps1 changes untested locally] → `verify-install.mjs` parity harness updated for commands + marker; ps1 logic kept structurally identical to sh.
- [Hook smoke tests flaky across platforms (python availability)] → Ring 0 skips non-runnable hooks on current platform with a warning, never silently passes a failing one.
- [`ZIP_FILE` override diverges installer code path from real download path] → override only replaces the download step; unzip and routing code identical.

## Migration Plan

1. Branch `dogfood-zoning` (worktree recommended); tag `pre-dogfood-zoning` on master.
2. Land exclusion module + build hardening + version stamp (release pipeline valid on its own).
3. Land gitignore generator, run it, commit `.gitignore`; then `git rm -r --cached` mirror + state paths, commit.
4. Land `dogfood.mjs`, `ring0-check.mjs`, fixtures, npm scripts.
5. Land `pilot.mjs` + installer `ZIP_FILE` override + commands install + version marker; update `verify-install.mjs` expectations.
6. Merge to master; in main tree run `npm run pilot` then `npm run dogfood`; verify `git status` clean; `npm run dogfood:bless`.

Rollback: revert merge commit; tracked mirror copies restorable from tag `pre-dogfood-zoning`.

## Open Questions

- None blocking. Per-skill allowlist frontmatter is deliberately deferred.
