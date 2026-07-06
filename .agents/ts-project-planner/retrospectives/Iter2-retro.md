# Iter2 retro — REFACTOR-HOOK-GUIDANCE-TABLE

Date: 2026-07-06

## Release exit criteria (4/4 verified)

1. Hook output byte-identical for every existing test case — ✅ 24/24 tests
   pass unedited (`git diff --stat src/tests/` empty); plus 22 manually
   captured pre/post scenarios byte-diffed identical.
2. Each `[NEXT]` case row maps 1:1 to a Workflow Guidance table row —
   ✅ every arm in `next_for_delivery`/`next_for_discovery` carries a
   `# SKILL.md: <Track>|<row>` comment.
3. No if/elif nesting deeper than 1 level — ✅ the spike-reflect nesting
   dissolved into sibling case arms (`reflect:spike` / `reflect:*`); the
   only remaining `if/elif` is the bottom-of-file track dispatch.
4. `npm run pilot` PASS — ✅.

## What went well

- Capturing a byte-diff baseline (22 scenarios) *before* touching the file
  turned "did I preserve behavior?" from a judgment call into a mechanical
  check. Worth doing for any refactor with informational-only (no compiler)
  output contracts.
- The compound dispatch key (`"$phase:$epic_type"`) resolved the one real
  nesting case cleanly — no new primitive, just a wider case pattern.
- Scope discipline: skipped an 8-agent code-review for a single-file,
  already-byte-verified mechanical change. Matches "add rigour, never add
  scope" — the review effort matched the actual risk surface.

## What to watch next time

- This refactor made the D9 hook↔SKILL.md duplication *legible* (comments
  naming source rows) but did not make it *enforced*. The lockstep-test gap
  flagged in EPIC-DUAL-TRACK-ORCHESTRATION's Review phase is still open —
  legibility lowers the cost of a future drift-catching test, doesn't
  replace it.

## Carried-forward follow-ups (unchanged, still open)

1. JSON-shape/type check for Discovery sub-agent output (non-empty check
   only today).
2. No test asserts hook `[NEXT]` strings match `SKILL.md`'s Workflow
   Guidance table — now easier to write given the per-arm source comments.
3. Installer/build-script `agents` manifest category rule-of-three
   duplication (`install.sh`/`.ps1`/`build-release.mjs`/`dogfood.mjs`).
4. Release/Iteration DDD model gap (`WorkflowStateInjected` mis-classified).
