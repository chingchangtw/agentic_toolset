## 1. Scope guard extension (Decision: extend `pl-scope-guard.mjs` with an explicit allowlist, do not bypass it)

- [x] 1.1 Implement requirement "Scope guard allows only the declared activation targets outside src/": extend `checkPhaseAScope` in `src/scripts/pl-scope-guard.mjs` with
  an optional `allowedPaths` parameter (default `[]`): a path outside `src/`
  is compliant only if it exactly matches or is nested under an entry in
  `allowedPaths`. Verify via `src/tests/unit/pl-scope-guard.test.ts`: a new test
  asserting a declared allowed path passes and an undeclared path still
  fails.
- [x] 1.2 Confirm the zero-argument call path is unchanged: existing
  `pl-scope-guard.mjs` callers with no `allowedPaths` argument produce
  identical violation output to before this change. Verify by re-running the
  pre-existing `src/tests/unit/pl-scope-guard.test.ts` suite unmodified and
  confirming all prior assertions still pass ("default behavior unchanged
  for existing callers" scenario).

## 2. Activation script

- [x] 2.1 Implement requirement "Activation snapshots every target before any write" in `src/scripts/pl-dogfood-activate.mjs`: given a fixed
  target-list input, snapshot every target's current bytes (or record
  "did not exist") into a timestamped snapshot directory, completing the
  full snapshot phase before any apply-phase write begins. Verify via
  `src/tests/unit/pl-dogfood-activate.test.ts` against a fixture target-tree,
  covering scenarios "snapshot completes before any write" and "snapshot failure
  aborts before any apply".
- [x] 2.2 Implement requirement "Activation applies atomically per target" as the apply phase of `pl-dogfood-activate.mjs`: write each
  target's new content to a temp path and rename into place (write tmp →
  rename), and emit a JSON manifest with `{path, existed_before,
  snapshot_path, new_hash}` per target. Verify via
  `src/tests/unit/pl-dogfood-activate.test.ts` asserting the manifest shape
  matches the "manifest enumerates every applied target" scenario and its
  "manifest shape" example exactly.

## 3. Rollback script

- [x] 3.1 Implement requirement "Rollback restores the pre-activation state exactly" in `src/scripts/pl-dogfood-rollback.mjs`: given an
  activation manifest, restore every target to its pre-activation state
  (exact snapshot bytes if `existed_before`, delete if not) using the same
  tmp-then-rename atomic pattern. Verify via
  `src/tests/unit/pl-dogfood-rollback.test.ts` asserting the restored tree is
  byte-identical to the pre-activation snapshot for both existed-before and
  did-not-exist-before cases, covering scenario "rollback produces an empty diff".
- [x] 3.2 Implement rollback's post-restore verification: diff the restored
  tree against the recorded snapshot and exit non-zero naming the first
  mismatching path on any difference. Verify via
  `src/tests/unit/pl-dogfood-rollback.test.ts` asserting a deliberately
  corrupted post-restore file produces a non-zero exit naming that path
  ("rollback detects a mismatch" scenario).

## 4. Real-tree manual verification (Build, per design.md Migration Plan — Decision: track activation as this Spectra change with its own BDD scenarios, not a manual Build checklist)

- [x] 4.1 Define the fixed target-list for this repo's actual activation
  (specific `.agents/ts-deliver-router/registry.json` keys, specific
  `.claude/hooks/*` files, specific router-config paths) as reviewed,
  checked-in content (not dynamically discovered). Verify by a content
  review confirming every listed path is one of the categories G1's Flow 2
  blast-radius bounds names, and none fall outside that set.
- [x] 4.2 Run `pl-dogfood-activate.mjs` on a branch against the real
  `agenticToolset` tree using the target-list from 4.1, then run
  `pl-dogfood-rollback.mjs` against the resulting manifest. Verify via
  `git status` showing exactly the expected paths changed immediately after
  activation, and `git diff` showing zero changes after rollback (design.md
  "Migration Plan" step 2, and the epic's own Do-NOT requirement that
  rollback be proven by an empty diff before Review).

## 5. Documentation

- [x] 5.1 Update `src/skills/ts-pl/references/host-adapters.md`'s "What's
  not proven" section to reflect that dogfood activation is now proven for
  the activate/rollback mechanism itself (not a claim that live hooks are
  wired to invoke PLDD checks on every session — design.md's Implementation
  Contract "Scope boundaries" explicitly excludes that). Verify by a content
  review confirming the updated section accurately states what this change
  did and did not prove.
