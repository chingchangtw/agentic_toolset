# Reflect — EPIC-PLDD-CONSUMER-ADAPTERS

Date: 2026-07-20
Slices: pl-consumer-adapter-parity, pl-dogfood-activation (this cycle)

## What shipped
- pl-scope-guard.mjs extended with `allowedPaths` param (extend, not bypass).
- pl-dogfood-activate.mjs / pl-dogfood-rollback.mjs: snapshot, atomic apply, manifest, verified rollback.
- Real-tree proof: activation run against agenticToolset's own tree (single target, Claude Code adapter only), rollback verified empty-diff.
- host-adapters.md updated. PR #9 merged (ccc08bc).

## Gate outcomes
- G1 (threat model): carried forward from epic-level model, re-validated — no new unknowns surfaced.
- G2 (security review): 1 HIGH + 2 MEDIUM real bugs found in Review and fixed before sign-off:
  - partial apply-phase failure produced no manifest → broke rollback recovery contract.
  - `new_hash` computed but never verified → rollback could silently overwrite a tampered target.
  - `allowedPaths` entries unvalidated → accepted `.`/`..`/`../`-prefixed paths.
- 3 LOW findings (no symlink/realpath check, non-unique tmp filenames, TOCTOU) accepted with rationale: single-operator/manual-invocation threat model, same class accepted in slice 1.

## Test signal
- 394/394 tests pass, type-check clean, 0 dependency vulnerabilities.
- Mutation testing: first pass 53.42% — gap was CLI/isMainModule/runCli paths unreachable by Stryker's in-process runner (same class of gap as slice 1). Fixed by adding in-process CLI-path tests mirroring pl-scope-guard.test.ts's dynamic-import cache-busting pattern. Re-run: 88.03%.

## Lessons for registry / next cycle
1. **CLI entrypoint mutation-coverage gap is now a recurring pattern** (2 slices in a row). Worth a `registry-build.md` rec-row: "new CLI script → add in-process runCli/isMainModule test alongside subprocess test, don't rely on Stryker crossing the subprocess boundary." Not yet added — flagging for harvest-skill review.
2. **Unverified hash-before-overwrite is a repeatable review finding class** for any script that restores/writes based on a stored checksum — worth naming explicitly in review-phase checklist prompts for future file-mutation scripts, not just this one.
3. Real-tree round-trip verification (activate → verify → rollback → verify-empty-diff) against the tool's own live tree was decisive in catching nothing new post-fix — cheap confidence check, worth keeping as a standard Test-phase step for any script that mutates repo state outside `src/*`.

## harvest-skill
No new reusable skill/pattern rose to the level of a standalone skill this cycle — the CLI-mutation-coverage pattern (item 1) is a checklist row, not a skill.
