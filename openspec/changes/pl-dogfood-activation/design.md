## Context

Slice 1 (`pl-consumer-adapter-parity`) proved the Codex/Claude Code adapter
contract on isolated fixtures only. This slice runs that same install path
live against `agenticToolset`'s own tree — the first PLDD work permitted to
write outside `src/*`. G1 threat model (`.agents/ts-deliver-router/artifacts/
EPIC-PLDD-CONSUMER-ADAPTERS/think/g1-threat-model.md`) already covers this
as Flow 2 (dogfood install), names tampering as the primary risk (overwriting
live router state/hooks/registries every future session depends on), and
requires: pre-install snapshot, atomic per-file apply (write tmp → rename,
same pattern the router uses for `state.json`), and a tested rollback
verified by an empty diff. Two decisions were explicitly deferred from G1 to
this Plan step (see `g1-threat-model.md` → "Open items carried into Plan"):
the `pl-scope-guard.mjs` allowlist mechanism, and whether activation is
Spectra-tracked or a manual checklist item.

## Goals / Non-Goals

**Goals:**
- Activate PLDD (adapter descriptors/templates from slice 1) live in
  `agenticToolset`'s own `.agents/`, `.claude/hooks/`, and router registries.
- Every write goes through snapshot → manifest → atomic-apply, with a
  rollback that restores the pre-install state exactly (empty diff).
- `pl-scope-guard.mjs`'s existing unconditional `src/`-only boundary stays
  intact for every caller except this one explicit activation entry point.

**Non-Goals:**
- Modifying `pl-arch-check.mjs` / `pl-contract-check.mjs` core rule logic
  (Phase A is closed/shipped) or the `pl-enforcement-kernel` spec.
- Changing the router's own phase-transition or gate logic
  (`src/skills/ts-deliver-router` spine) — this change is a *consumer* of
  the router, not a router change.
- Root `package.json`/lockfile changes, or any new npm dependency.
- Re-running or modifying slice 1's fixture conformance suite.

## Decisions

### Decision: extend `pl-scope-guard.mjs` with an explicit allowlist, do not bypass it

`checkPhaseAScope(paths)` today filters any path not starting with `src/`
(plus the one hardcoded `MANIFEST` exception) as a violation, unconditionally,
for every caller. Two options were on the table:

1. **Bypass the guard entirely for the activation script** (skip calling
   `checkPhaseAScope` from `pl-dogfood-activate.mjs`). Rejected: this removes
   the one automated check that would catch the activation script itself
   drifting to write somewhere unintended — exactly the failure mode
   `never_automate.md` item 1 warns against ("dogfood install must write
   through the same manifest+rollback path as everything else — no direct
   file replace").
2. **Extend `checkPhaseAScope` to accept an explicit second parameter,
   `allowedPaths` (array of exact project-relative paths or path prefixes)**.
   A path outside `src/` is a violation unless it exact-matches (or is nested
   under) an entry in `allowedPaths`. `pl-dogfood-activate.mjs` is the only
   caller that passes a non-empty `allowedPaths`, populated from its own
   generated manifest — so the allowlist is always derived from, and no
   broader than, what the manifest already declares. Every other existing
   caller (Phase A checks, CI, etc.) passes no `allowedPaths` and keeps
   today's unconditional `src/`-only behavior with zero change in behavior.

**Chosen: option 2.** It keeps the guard meaningful for the one script that
legitimately needs to cross the boundary, while leaving every other caller's
behavior byte-identical to today.

### Decision: track activation as this Spectra change with its own BDD scenarios, not a manual Build checklist

A manual Build-phase checklist item would be faster to write but leaves no
durable, re-runnable specification of what "activation succeeded" means —
exactly the gap slice 1 avoided by writing fixture-manifest-driven Spectra
scenarios instead of an ad-hoc test script. Given the tampering risk G1
flags as primary for this flow, and given `never_automate.md` requires this
path go through the same rigor as everything else, tracking it as a full
Spectra change (this one) with `specs/pl-dogfood-activation/spec.md`
scenarios keeps the same audit trail and repeatability slice 1 already
established.

**Chosen:** full Spectra change with BDD scenarios (this proposal).

## Implementation Contract

**Behavior:**
- `node src/scripts/pl-dogfood-activate.mjs --manifest <path-to-target-list>
  --snapshot-dir <dir>` enumerates the exact target paths declared in its
  input target list (not a dynamic scan — the target list is a fixed,
  reviewed set: specific `.agents/ts-deliver-router/registry.json` keys,
  specific `.claude/hooks/*` files, specific router-config paths), copies
  each target's current bytes (or records "did not exist" if absent) into
  `<snapshot-dir>/<timestamp>/`, writes new content to `<target>.tmp`, then
  renames `<target>.tmp` → `<target>` for each target in turn, and emits a
  JSON manifest (`{version, snapshot_dir, targets: [{path, existed_before,
  snapshot_path, new_hash}]}`) to stdout and to a file at
  `--manifest-out <path>`.
- `node src/scripts/pl-dogfood-rollback.mjs --manifest <manifest-out-path>`
  reads that manifest, and for each target either restores the exact bytes
  from `snapshot_path` (if `existed_before`) or deletes the target (if not
  `existed_before`), using the same tmp-then-rename atomic pattern, then
  diffs the restored tree against the recorded snapshot and exits non-zero
  with a named path if any target differs.
- `pl-scope-guard.mjs`'s `checkPhaseAScope(paths, allowedPaths = [])`: a path
  outside `src/` is a violation unless it exactly equals or is nested under
  an entry in `allowedPaths`. Return shape and the zero-`allowedPaths`
  behavior are unchanged from today.

**Failure modes:**
- Activation aborts before any write if the input target list references a
  path outside the fixed allowlist set, or if any snapshot copy fails
  (nothing written yet at that point — snapshot phase precedes apply phase
  entirely).
- If an apply-phase rename fails partway through, already-renamed targets
  are left in their new state, not-yet-renamed targets are untouched, and
  the manifest (already fully enumerated before any apply began) is
  sufficient for `pl-dogfood-rollback.mjs` to restore every target,
  including the ones that did apply.
- Rollback exits non-zero (does not silently report success) if the
  post-restore diff is non-empty for any target.

**Acceptance criteria:**
- `src/tests/unit/pl-dogfood-activate.test.ts`: activate against a fixture
  target-tree (not the real `.agents/`/`.claude/`) asserts every target's
  new content matches expected, snapshot files contain the exact prior
  bytes, and a target list entry outside the fixed allowlist causes an
  abort with zero writes.
- `src/tests/unit/pl-dogfood-rollback.test.ts`: activate then rollback against
  the same fixture target-tree asserts the final tree is byte-identical to
  the pre-activation tree (empty diff), for both the existed-before and
  did-not-exist-before cases.
- `src/tests/unit/pl-scope-guard.test.ts`: existing zero-argument-allowlist
  behavior is unchanged (regression case), plus a new case proving a path
  under a declared `allowedPaths` entry passes and a path outside it still
  fails.
- Manual verification in Build, before this change's own Review: run
  activation against the real `agenticToolset` tree on a branch, snapshot
  taken, then run rollback, then `git diff` against the pre-activation
  commit must be empty for every activated path.

**Scope boundaries:**
- In scope: the two new scripts, the `pl-scope-guard.mjs` allowlist
  parameter, their tests, and the fixed target-list content for this repo's
  own activation.
- Out of scope: any change to what `pl-adapter-conformance.mjs` or the
  adapter descriptors/templates themselves do (slice 1, already shipped);
  any change to router phase-transition logic; actually wiring a live hook
  to invoke PLDD checks on every session (that is a separate, later
  decision — this change proves the activate/rollback mechanism itself is
  safe, using the adapter install as the first real payload).

## Risks / Trade-offs

- [Risk] A bad target-list entry could point at a path this repo depends on
  every session (e.g. a hook file) → Mitigation: target list is a fixed,
  reviewed set checked into this change (not dynamically discovered),
  and `pl-scope-guard.mjs`'s `allowedPaths` check still runs against it.
- [Risk] Snapshot phase and apply phase both touching the real repo tree
  during Build's manual verification step could leave partial state if the
  process is killed mid-run → Mitigation: snapshot phase fully completes
  (all copies done) before any apply-phase write begins; a kill during
  snapshot leaves the real tree completely untouched; a kill during apply
  is recoverable via the already-complete snapshot.
- [Risk] Extending `checkPhaseAScope`'s signature could regress its zero-
  argument behavior for existing Phase A callers → Mitigation: `allowedPaths`
  defaults to `[]`, and the regression test in
  `src/tests/unit/pl-scope-guard.test.ts` asserts today's behavior is unchanged.

## Migration Plan

1. Build: implement both scripts + scope-guard extension + unit tests
   against fixture target-trees.
2. Build (manual, real-tree): run activation on a branch against the real
   `agenticToolset` tree with the actual PLDD target list, verify
   `git status` shows exactly the expected paths changed, run rollback,
   verify `git diff` is empty.
3. Review: adversarial pass on both scripts (tampering is the primary risk
   per G1) — same discipline as slice 1's Review.
4. Test: mutation score on both new scripts + the scope-guard extension.
5. Ship: G2 sign-off required (this is the first live write outside
   `src/*` — `never_automate.md` item 3 makes this non-negotiable).
6. Rollback strategy if Ship is aborted: the branch is never merged; nothing
   on `master` changes. If a real activation on `master` itself ever needs
   undoing post-merge, `pl-dogfood-rollback.mjs` against that merge's own
   manifest is the mechanism — no separate revert process is needed.

## Open Questions

None outstanding — both items G1 deferred to Plan are resolved above
(allowlist extension, Spectra-tracked scenarios). The fixed target-list
content itself (exact `.claude/hooks/*` filenames, exact registry.json keys)
is enumerated in `tasks.md` and `specs/pl-dogfood-activation/spec.md`, not
here, since it is task-level detail rather than a design decision.
