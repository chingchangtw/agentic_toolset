## Context

Four files each wire the skills/hooks/agents manifest categories as separate
near-identical blocks: `scripts/build-release.mjs` (3 loops), `scripts/dogfood.mjs`
(6 loops), `release/install.sh` (3 python-subprocess + bash-loop blocks),
`release/install.ps1` (3 foreach blocks). Confirmed against live source in
`.agents/ts-deliver-router/artifacts/REFACTOR-INSTALLER-DEDUP/plan/reverse-spec.md`:
`dogfood.mjs`'s 6 loops are near-pure duplication (identical push shape, only
source array + `dir` flag vary); the other three files share only an iteration
skeleton per category — the per-entry action (skills: recursive dir copy;
hooks: scope-routed copy + chmod +x; agents: copy + rename) is genuinely
different per category and must stay that way.

Constraint: `openspec/specs/install-parity-check` already requires
`scripts/verify-install.mjs` to assert install.sh/install.ps1 produce
byte-identical trees — this refactor must keep that spec's requirement
passing unchanged, not modify it.

## Goals / Non-Goals

**Goals:**

- One call site per manifest category per file — adding a 4th category means
  one new call, not a new copy-pasted block.
- Zero change to installed output: paths, content, permission bits.

**Non-Goals:**

- Changing `scripts/release-manifest.json`'s schema.
- Touching either installer's legacy no-manifest fallback branch.
- Touching `generate-manifest.mjs`'s own 3 scan loops (real variation: different
  source-directory filters per category, not the duplication this refactor targets).
- Any output-message wording changes.
- Unifying the per-entry *action* across install.sh/install.ps1 behind one
  shared callback — the three actions are genuinely different, and a
  callback/scriptblock indirection is exactly the higher-risk shape identified
  at G1 (harder-to-spot bugs in an unsandboxed, per-OS, not-unit-tested
  installer). Only the iteration skeleton is extracted, never the action.

## Decisions

### dogfood.mjs: extract pushCategoryTargets

Extract `pushCategoryTargets(targets, entries, {srcRoot, destRoot, dir})` —
appends one `{src, dest, dir, zipPath}` entry per manifest entry into the
shared `targets` array. Replaces all 6 loops (3 in `mirrorTargets()`, 3 in the
`--from-zip` branch) with one call each. Chosen over a class/generator
abstraction because the existing shape is already a flat array-builder; a
function matching that exact shape is the smallest correct extraction.
Implemented in `scripts/lib/dedup-helpers.mjs` (not inline in dogfood.mjs) —
matches the existing `scripts/lib/exclusions.mjs` / `golden-templates.mjs`
convention for cross-file shared helpers, and makes the function importable
by a Vitest unit test without triggering dogfood.mjs's module-scope side
effects (manifest read, argv dispatch). The `--from-zip` call sites need an
additional `srcField: 'dest'` option (an extracted zip's layout mirrors
manifest `dest` paths, not `src` paths) — discovered during implementation,
not present in the original design sketch.

### build-release.mjs: extract copyManifestCategory

Extract `copyManifestCategory(entries, {rootDir, buildDir, filtered, validate, label})` —
iterates entries, resolves src/dest, optionally runs `validate(srcPath, entry.name)`
before copying, calls the existing `cp()` helper with `{filtered}`, logs under
`label`. Skills call passes `validate: validateSkill, filtered: true`;
hooks/agents calls omit both (default `validate: undefined`, `filtered: false`),
preserving current no-op behavior for those two categories exactly.

### install.sh: consolidate to one tagged loop

The existing `mkdir -p "${SKILLS_DIR}"` / `"${HOOKS_DIR}"` / `"${PROJECT_HOOKS_DIR}"` /
`"${PROJECT_CLAUDE_DIR}/agents"` calls stay exactly where they are relative to
the loop — run once, up front, before any row is processed (not moved inside
the merged loop, not made per-row). Replace the 3 separate `python3 -c`
subprocess spawns with one heredoc that opens `manifest.json` once and emits
every row across all 3 categories, each line prefixed with a category tag
(`skill\t...` / `hook\t...` / `agent\t...`). One bash
`while IFS=$'\t' read -r tag f1 f2 f3` loop (4 variables — max field-width
across categories; hook rows carry 3 data fields, skill/agent rows carry 2)
dispatches via
`case "$tag" in skill) ... ;; hook) ... ;; agent) ... ;; *) echo "unknown manifest category tag: $tag" >&2; exit 1 ;; esac`,
each named arm doing exactly what its current per-category block does today
(same field order, same `mkdir`/`cp`/`chmod` calls), just relocated into a
case arm and reading only the `f1`/`f2`(/`f3`) variables it needs. The `*)`
default arm is new — today's 3 independent loops have no dispatch step to get
wrong; a single merged loop does, so an unrecognized tag must fail loudly
(manifest-generator bug) rather than silently vanish. Declaring fewer than 4
`read` variables would silently fold a wider row's excess columns (with their
original tab separators) into the last declared variable — a real footgun
this design explicitly avoids.

**Header ordering (resolved during Build, user confirmed)**: today's 3
separate loops each print their `→ Installing X...` header immediately before
that category's entries. A single merged loop consuming one python emission
(skill rows, then hook rows, then agent rows, in that order) cannot preserve
that exact interleaving without a per-tag "header already shown" flag — and
that flag would silently suppress a category's header if it ever had zero
entries (today's headers print unconditionally, even for an empty category).
Chosen: print all 3 headers together, up front, right after the 4 `mkdir`
calls, in skill/hook/agent order — same text, correct for the empty-category
case, but a real (accepted) stdout reordering relative to pre-refactor output.
Task 1.1/6.1's stdout baseline diff will show exactly this 3-line move; it is
an expected, reviewed difference, not a regression to chase.

### install.ps1: mirror the tagged-loop shape

The existing `New-Item -ItemType Directory -Path $HooksDir/$ProjectHooksDir/$AgentsDir -Force`
calls stay exactly where they are — run once, up front, before any row is
processed. Define `$InstallActions = @{ skill = {...}; hook = {...}; agent = {...} }`
(one scriptblock per category, each scriptblock body identical to today's
corresponding foreach body) and one `foreach` over a category-tagged flat list
built from `$manifest.skills`/`.hooks`/`.agents`, checking
`$InstallActions.ContainsKey($tag)` before invoking — throwing a clear error
on a miss instead of invoking `$InstallActions[$tag]` directly, which would
silently return `$null` for an unrecognized tag and then throw an opaque
null-reference error from `.Invoke()`. No chmod-equivalent step for hooks
(confirmed absent by design on Windows — not a gap, see reverse-spec.md).

### Verification harness: byte-diff against a captured baseline

No new test framework. Reuse `npm run pilot` (asserts full installed tree),
`node scripts/verify-install.mjs` (sh/ps1 parity), `npm run release` (zip
contents), `npm run dogfood` (`.claude/` mirror) as the full regression
harness, run once before any edit (baseline capture) and once after
(diff against baseline) for all 4 files.

## Implementation Contract

**Behavior**: Every file that lands on disk after `install.sh`/`install.ps1`/
`npm run dogfood`/`npm run release` — path, content, permission bits
(`chmod +x` on hooks) — is byte-identical to pre-refactor output. No new
manifest categories, no new CLI flags, no new console output beyond
today's `console.log`/`Write-Host`/`echo` lines — wording unchanged
everywhere; ordering unchanged everywhere EXCEPT install.sh's 3
`→ Installing X...` headers, which move from interleaved-per-category to
grouped-up-front (see the install.sh decision's "Header ordering" note —
a deliberate, user-confirmed exception, not a regression) — verified by
capturing and diffing stdout in the regression
harness, not just file trees, since merging 3 loops into 1 could otherwise
silently reorder per-category header lines).

**Interface / data shape**:
- `pushCategoryTargets(targets: Array, entries: Array<{src,dest,...}>, opts: {srcRoot: string, destRoot: string, dir: boolean}): void` in `scripts/dogfood.mjs`.
- `copyManifestCategory(entries: Array, opts: {rootDir: string, buildDir: string, filtered?: boolean, validate?: (srcPath: string, name: string) => void, label: string}): void` in `scripts/build-release.mjs`.
- install.sh: single heredoc emits tab-separated rows `<tag>\t<field1>\t<field2>...`; one `while read` + `case "$tag"` loop.
- install.ps1: `$InstallActions` hashtable of scriptblocks keyed by category tag (`skill`/`hook`/`agent`); one `foreach` invoking the matching scriptblock.

**Failure modes**: missing source file still triggers the existing per-file
`SKIP (missing)` warning (build-release.mjs) or `⚠ skip (source missing)`
warning (dogfood.mjs) and continues; missing `manifest.json` still triggers
the existing legacy-fallback branch in both installers, untouched by this
refactor. **New failure mode, not present today**: the merged tagged loop in
install.sh/install.ps1 introduces a dispatch step that today's 3 independent
loops don't have. An unrecognized category tag exits non-zero with an
explicit error in install.sh (`case`'s `*)` arm) and throws a named error in
install.ps1 (`ContainsKey` guard) — it must never silently no-op (install.sh)
or throw an opaque null-ref (install.ps1). This can only happen if
`generate-manifest.mjs` and the installers drift out of sync (a dev-time bug,
not a runtime risk against real manifests), but the design must not claim
"unchanged from today" for this path — there is no today-equivalent.

**Acceptance criteria**:
1. `npm run pilot` passes, output (including captured stdout) identical to pre-refactor baseline capture.
2. `node scripts/verify-install.mjs` passes.
3. `npm run release` produces a `dist/release.zip` with identical file listing (paths + categories) to the pre-refactor baseline.
4. `npm run dogfood` produces an identical `.claude/` tree to the pre-refactor baseline; `--rollback` and `--from-zip` continue to work.
5. Static syntax check on install.ps1 passes (`[System.Management.Automation.PSParser]::Tokenize` — install.ps1 has no `param()`/`CmdletBinding`/`SupportsShouldProcess`, so `-WhatIf` is not a safe dry-run option and must not be used for this check). Live execution is verified separately, only in task 6.2's manual smoke test against a freshly built zip.

**Scope boundaries**: In scope — the 4 files named above, category-loop
extraction only. Out of scope — `manifest.json` schema, either installer's
legacy fallback branch, `generate-manifest.mjs`'s scan loops, any output
wording change, any cross-file callback that would make the per-category
*action* (not just the iteration skeleton) shared.

## Risks / Trade-offs

[Indirection bugs harder to spot in an unsandboxed, not-unit-tested-per-OS
installer script] → Mitigation: the extracted helper/scriptblock in each file
still contains the exact same per-category action as today — only the
iteration skeleton is shared, never the action itself; byte-diff verification
against a captured baseline catches any behavioral drift before merge.

[`install.ps1` has no CI test harness — only `install.sh` is covered by
`npm run pilot`] → Mitigation: static review plus manual smoke test with the
locally installed `pwsh 7.6.3`, per the verification precedent from the prior
epic (REFACTOR-HOOK-GUIDANCE-TABLE).

[`dogfood.mjs`'s `--from-zip` branch reads from an extracted zip's
`manifest.json`, a structurally different source than the live `mirrorTargets()`
call, despite sharing the same `pushCategoryTargets` shape] → Mitigation:
both call sites pass explicit `srcRoot`/`destRoot` per call, so the helper
never assumes a single global root; each call site's baseline diff is checked
independently.

[Merging 3 independent loops into 1 tagged dispatch introduces a genuinely
new failure mode — an unrecognized category tag — that today's code has no
equivalent for] → Mitigation: explicit `*)` default arm in install.sh (exit
non-zero, clear message) and `ContainsKey` guard in install.ps1 (throw a
named error) instead of silent no-op or opaque null-ref; caught by outside-voice
review during this Plan phase, not deferred to Build.

## Migration Plan

No deployment migration — this ships as a normal commit + release like any
other change. Rollback: `git revert`; `npm run dogfood:rollback` restores the
local mirror if a dogfood sync regresses; reinstalling with a prior GitHub
Release zip is unaffected since old zips are untouched.

## Open Questions

None — reverse-spec.md resolved the one open question (ps1 hooks correctly
have no chmod-equivalent) before this design was written.
