# Review — EPIC-PLDD-CONSUMER-ADAPTERS, slice 2 (pl-dogfood-activation)

Branch: `codex/pldd-dogfood-activation`, diff vs `master`. ~800 lines of
implementation (below the 200-line specialist-army threshold this project
uses; ran a single adversarial pass instead of the full gstack
multi-specialist dispatch, which isn't configured in this repo — same as
slice 1).

## Adversarial pass (independent subagent, fresh context)

6 findings across `pl-dogfood-activate.mjs`, `pl-dogfood-rollback.mjs`,
`pl-scope-guard.mjs`.

1. **FIXED (HIGH)** — Partial apply-phase failure left already-renamed
   targets modified live on disk with **no manifest ever produced**, since
   the manifest was only built via `.map()`'s single return value. A
   mid-loop throw (disk full, permission denied on a later target) meant
   `pl-dogfood-rollback.mjs` had nothing to restore the already-applied
   targets from — directly contradicting the design contract's own failure
   mode ("the manifest ... is sufficient ... to restore every target,
   including the ones that did apply"). Fixed: manifest built incrementally
   in a loop; on throw, the partial manifest (every target applied so far)
   is attached to the error as `error.partialManifest` and `runCli` writes
   it to `--manifest-out` before exiting non-zero, so an operator can
   immediately roll back whatever did apply.
2. **FIXED (MEDIUM)** — `new_hash` was computed and stored in the manifest
   but never read anywhere. Rollback verified the *post-restore* state
   against the *snapshot*, but never checked whether the target had been
   tampered with *since activation* before silently overwriting it. Fixed:
   rollback now does a pre-restore integrity pass — if a target currently
   exists and its hash doesn't match the manifest's recorded `new_hash`,
   rollback aborts (naming the path) before touching anything, rather than
   clobbering an intervening change.
3. **FIXED (MEDIUM)** — `checkPhaseAScope`'s `allowedPaths` entries weren't
   validated; an entry of `.` or `..` (or anything normalizing to those)
   would have made the allowlist meaningless (since the guard is prefix-
   based). Fixed: `checkPhaseAScope` now rejects `''`, `.`, `..`, and any
   entry starting with `../` in `allowedPaths`, throwing before any path
   check runs.
4. **Accepted, not fixed (LOW)** — no symlink/`realpath` verification;
   string-level scope checks don't catch a path segment that's (or
   becomes) a symlink escaping the repo. Accepted: this is a single-
   operator, manually-invoked CLI tool over a fixed, reviewed target list
   (design.md's own Risks/Trade-offs already treats the target-list content
   itself, not the filesystem API, as the trust boundary); out of proportion
   to harden against a threat model that assumes the operator already
   controls the target list.
5. **Accepted, not fixed (LOW)** — tmp filenames (`<target>.tmp`) have no
   PID/random suffix, so two concurrent runs on the same target would race.
   Accepted: design.md's Migration Plan explicitly scopes this to "single
   manual invocation, no auto-retry" — concurrent invocation is out of scope
   for this change, same class of accepted risk as slice 1's rate-limiting
   n/a determination.
6. **Accepted, not fixed (LOW)** — inherent TOCTOU between `existsSync` and
   the later read/write in both scripts. Same rationale as #4/#5: single-
   operator manual tool, not a concurrent/adversarial-process threat model.

**Not a bug** (adversarial pass confirmed): the `startsWith` prefix-matching
in `isAllowed` correctly appends `/` before comparing, so an allowlist entry
of `.claude/hooks` does not wrongly match `.claude/hooks-evil/x`; path
traversal segments normalize out of both the `src/`-prefix check and the
allowlist-prefix check rather than bypassing them (verified by the existing
"rejects traversal disguised beneath src" test).

## Verification after fixes

- `npx vitest run`: 367/367 pass (3 new tests: partial-manifest-on-failure,
  unsafe-allowedPaths-entry-rejected, pre-restore-divergence-abort).
- `npm run type-check`: clean.
- Real-tree round-trip re-verified after the fixes: activation against
  `agenticToolset`'s own live tree still produces exactly one changed path
  (`.claude/commands/pl-check.md`, correct hash), rollback still produces
  an empty `git status`/`git diff`.

## Scope check

Intent (Think framing + design.md): prove the activate/snapshot/rollback
mechanism safe against this repo's own live tree, using the Claude Code
adapter file as the first real payload; no live-enforcement hook wiring.
Delivered: matches — the fixes are all within `pl-dogfood-activate.mjs`,
`pl-dogfood-rollback.mjs`, `pl-scope-guard.mjs`, and their tests; nothing
outside the design's stated scope boundaries was touched. All 9/9 tasks
from `tasks.md` remain done; no task's intent changed, only its
implementation hardened.

## Verdict

Clean after fixes (1 HIGH + 2 MEDIUM addressed; 3 LOW accepted with stated
rationale). Ready for Test phase.
