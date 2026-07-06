# Iter3 Retro — REFACTOR-INSTALLER-DEDUP

## Summary

1 epic, refactor type, direct Delivery entry (no Discovery track — refactor of
shipped code). Think→Plan[G1]→Build→Review→Ship completed this session, no
Test/G2 per D6 (refactor spine). Pushed to origin/master: `37927cf..a9e0e21`
(3 commits).

## What shipped

`scripts/build-release.mjs`, `scripts/dogfood.mjs`, `release/install.sh`,
`release/install.ps1` deduplicated to one call site per manifest category
(skills/hooks/agents) per file, via new `scripts/lib/dedup-helpers.mjs`
(`pushCategoryTargets`, `copyManifestCategory`). Zero change to installed
output, verified against a pre-refactor baseline at every task.

## Gate outcomes

- **G1** (threat-model, end of Think): signed off by ctony. Elevated scrutiny
  applied given install.sh/install.ps1 run unsandboxed on end-user machines.
- **design-review** (`/plan-eng-review`): passed after 6 findings fixed
  (bash `read` field-width footgun, missing unit tests, unsafe ps1 `-WhatIf`
  verification step that would live-execute the installer, missing
  unknown-tag guard in both installers, dir-precreation placement, stdout
  diffing gap). Outside-voice (Claude subagent, Codex unavailable) caught 4
  of the 6.
- **G2**: not required (refactor, D6).
- Code review (8-angle, high effort): 0 correctness bugs. 4 cleanup findings,
  1 fixed same session (`printField` footgun, commit `a9e0e21`), 3 accepted
  as low-severity/inherited.

## What worked

- Reverse-spec (verifying framing.md's claims against live source before
  Plan) caught nothing new but confirmed the Think-phase analysis was
  accurate — cheap insurance.
- Per-task live verification during Build (not just code review) caught a
  real bug — `pushCategoryTargets`'s `--from-zip` call sites needed `src`
  resolved against `dest`, not `src` — before it shipped.
- Outside-voice review at both Plan (design-review) and Build-adjacent
  (code-review) stages caught real issues an inside-view missed each time,
  including one (`install.ps1`'s `-WhatIf` "syntax check" that would have
  live-executed the installer) that could have caused real damage on a
  contributor's machine during Build.

## What to watch

- A review subagent ran `install.sh` live against the user's real
  `~/.claude/` (not sandboxed) while independently verifying behavior during
  code-review. No damage this time (files came back byte-identical to repo
  source), but subagents doing "let me just run it to check" against
  end-user-facing installer scripts need an explicit sandboxing instruction
  — worth adding to this project's review tooling guidance.
- `openspec/changes/<name>/` artifacts (proposal/design/tasks) were not
  committed until after the code commit, in a separate pass — matches this
  repo's established `docs(openspec): propose`/`archive` convention, but the
  propose-time commit was skipped and only caught up at archive time. Worth
  committing proposal/design/tasks right after `/spectra-propose` next time,
  not deferred.

## Follow-ups (not blocking, not actioned this session)

- `install.ps1`'s `$taggedEntries` built via array `+=` in 3 loops — O(n²),
  negligible at ~14 manifest entries today, would need an ArrayList/List if
  the manifest ever grows into the hundreds.
- `copyManifestCategory`'s `validate`-presence-as-mode-switch inherits a
  pre-existing asymmetry from the original code rather than resolving it —
  fine as-is, flagged for awareness only.
