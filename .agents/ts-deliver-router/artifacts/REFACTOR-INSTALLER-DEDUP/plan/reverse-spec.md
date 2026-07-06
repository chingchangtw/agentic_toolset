# Reverse-spec — REFACTOR-INSTALLER-DEDUP

What the 4 files DO now, verified against live source (2026-07-06). code-review-graph
MCP not configured in this environment (setup gap) — built by direct read instead.

## `scripts/build-release.mjs` (lines 57-87)

3 loops, each `for (const entry of manifest.X)`:
- **skills** (60-67): resolve src/dest, skip if src missing, `validateSkill()`
  (requires `SKILL.md` present, throws if not), `cp(srcPath, destPath, {filtered: true})`
  (applies `includeInPackage` exclusion filter on directory copy), log.
- **hooks** (72-77): resolve src/dest, `cp(srcPath, destPath)` (no filter, no validate),
  log only if src existed.
- **agents** (82-87): identical shape to hooks, iterates `manifest.agents ?? []`.

Shared helper already exists: `cp(src, dest, {filtered})` (34-43) — recursive dir copy
with optional filter, or plain file copy. Skills passes `filtered: true`; hooks/agents
omit it (default `false`). Variation across the 3 loops: skills adds a
`validateSkill()` call the other two don't have.

## `scripts/dogfood.mjs` (lines 48-66, 120-134)

6 loops total, 2 groups of 3, both push into a flat `targets` array of
`{src, dest, dir, zipPath}`:
- **`mirrorTargets()`** (48-66): skills → `dir: true`; hooks → `dir: false`; agents
  (`?? []`) → `dir: false`. Same push shape all 3 times, differing only in source
  array and `dir` value. Plus one fixed extra target (`load-skill.md`) appended
  after, unconditionally, all 3 categories.
- **`--from-zip` branch** (120-134): same 3-loop shape, reading from
  `zipManifest.{skills,hooks,agents}` instead of the live `manifest`, targets built
  from an extracted zip dir instead of `ROOT`. No `zipPath` field here (unused
  downstream in this branch). Same trailing `load-skill.md` push.

These 6 are the near-pure duplication case: identical push shape, only
`{source array, dir flag, src-root}` vary per call site.

## `release/install.sh` (lines 58-110)

3 separate `"${PYTHON_BIN}" -c "..."` heredoc subprocess spawns inside one
`if [[ -f manifest.json ]]` block, each re-opening and re-parsing `manifest.json`
from scratch, each piped into its own bash `while IFS=$'\t' read -r ...` loop:
- **skills** (62-74): python emits `dest\tinstall_subpath` (subpath = dest minus
  `skills/` prefix); bash loop does `mkdir -p` + `cp -r` into `${SKILLS_DIR}/<subpath>`.
- **hooks** (78-95): python emits `dest\tscope\tname`; bash loop routes target dir
  by `scope` (`project` → `PROJECT_HOOKS_DIR`, else `HOOKS_DIR`), `cp` then
  `chmod +x`.
- **agents** (97-110): python emits `dest\tname` from `manifest.get('agents', [])`
  (absent key → empty loop, no-op — already handles older zips); bash loop does
  `cp` renaming to `${name}.md` under `${PROJECT_CLAUDE_DIR}/agents/`.

Per-entry action genuinely differs per category (plain recursive copy vs.
scope-routed copy+chmod vs. copy-with-rename) — only the *iteration skeleton*
(python emit → tab-split → bash loop) repeats 3x.

Untouched, out of scope: legacy fallback branch (112-155, no-manifest old zips).

## `release/install.ps1` (lines 39-82)

3 native `foreach ($entry in $manifest.X)` blocks inside one
`if (Test-Path $ManifestPath)` block (PowerShell parses JSON natively, no
subprocess):
- **skills** (44-51): `$installSubpath` = dest minus `"skills/"` prefix, `\`-joined;
  `New-Item -Force` dir + `Copy-Item -Recurse -Force`.
- **hooks** (59-67): route target dir by `$entry.scope` (same project/global split
  as install.sh), `Copy-Item`. No chmod-equivalent — confirmed correctly absent
  (Windows has no POSIX +x bit); this is a genuine one-step-shorter action vs.
  install.sh's hook action, not a gap to fix.
- **agents** (75-79): `Copy-Item` renaming to `$entry.name.md` under
  `$ProjectClaudeDir\agents\`.

Same 3-actions-genuinely-differ shape as install.sh, expressed idiomatically
(no tab-split/python-emit indirection needed — `$manifest.skills` etc. are
already typed objects).

Untouched, out of scope: legacy fallback branch (84-131, no-manifest old zips).

## Confirms framing.md's classification

Real duplication (safe, high-value extraction): `dogfood.mjs`'s 6 loops.
Real variation (shape-shared, action-shared but not identical): `build-release.mjs`'s
3 loops (skills validate step), `install.sh`/`install.ps1`'s 3 blocks each
(3 genuinely different per-entry actions behind a shared iterate-manifest-category
skeleton). No new duplication found beyond what framing.md already scoped.

No open questions remain — both installers' 3 per-category actions are now
mapped exactly. Ready for Spectra:propose (spec + Given/When/Then scenarios).
