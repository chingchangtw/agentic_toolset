# Think — slice 2 (pl-dogfood-activation)

## Resuming, not re-threat-modeling
G1 (`g1-threat-model.md`, this dir) already covers dogfood activation — title
is explicit ("incl. dogfood activation"), Flow 2 STRIDE, blast-radius bounds,
and recovery path are all written against the live-install case, and it's
signed off by ctony. Nothing found in slice 1's Review/Test that the existing
threat model failed to anticipate. No fresh G1 required.

## What slice 1 proved (inputs to this slice)
- `src/scripts/pl-adapter-conformance.mjs` + Codex/Claude Code descriptors:
  proven on fixtures only. Confirmed reachable and correct via 216/216 tests,
  68.33% mutation score, 2 real security bugs found+fixed in Review.
- `host-adapters.md` "What's not proven" section names this slice directly:
  "Activating either adapter inside `agenticToolset` itself is a separate,
  explicitly-approved step tracked outside this suite."

## Open items carried from G1 (unresolved, confirmed still open)
1. `pl-scope-guard.mjs` (read this session) is a flat `src/`-prefix filter
   with no allowlist mechanism today — `checkPhaseAScope` rejects anything
   outside `src/` unconditionally. Slice 2 needs an explicit decision:
   extend this function with an activation-specific allowlist parameter, or
   invoke a bypassed/separate check for the one activation entry point.
   → Decide in Plan (per TASK.md open decisions), not here.
2. Whether activation runs as a Spectra-tracked task with its own BDD
   scenario vs. a manual Build-phase checklist item.
   → Decide in Plan.

## Scope for this slice
- Run slice 1's proven install path live against agenticToolset's own tree.
- Required before Ship: pre-install snapshot of every target path, atomic
  apply (write tmp → rename), tested rollback verified by empty diff.
- Allowed to touch: `.agents/`, `.claude/hooks/`, router config, registries
  — nothing else in this repo (never_automate.md items 1/2/5 still apply).

## Exit
Think complete for slice 2. No new unknowns beyond the two G1-deferred open
items above (both already tracked, neither newly discovered) — the router's
Think-phase hook criteria (blocks G1/G2, affects >1 epic, new external dep)
are not triggered. Proceeding to Plan: check `openspec/changes/` for an
existing `pl-dogfood-activation` proposal (none found — verified this
session, only `pl-consumer-adapter-parity` and `archive` exist) → run
`/spectra-propose`.
