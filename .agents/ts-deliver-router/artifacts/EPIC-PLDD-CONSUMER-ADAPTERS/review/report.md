# Review — EPIC-PLDD-CONSUMER-ADAPTERS, slice 1 (pl-consumer-adapter-parity)

Branch: `codex/pldd-consumer-adapter-parity`, diff vs `origin/master`.
14 files changed, ~800 insertions (below the 200-line specialist-army
threshold this project uses; ran a single adversarial pass instead of the
full gstack multi-specialist dispatch, which isn't configured in this repo).

## Adversarial pass (independent subagent, fresh context)

4 findings, all in `src/scripts/pl-adapter-conformance.mjs`:

1. **FIXED** — `loadDescriptor` rejected absolute `entry` paths but not `..`
   traversal. A descriptor `{"entry": "../../../../../../etc/hosts"}`
   passed validation and was read by `checkAdapterBoundary` before any
   temp-dir isolation applied — an arbitrary-file-read reachable straight
   from CLI input. Fixed: reject any `entry` containing a `..` segment.
2. **FIXED** — `installAdapter` containment-checked only the destination
   (consumer root), not the source (host templates root). Safe only by
   directory-depth coincidence, not by invariant. Fixed: symmetric
   containment check on both source and destination.
3. **FIXED** — Two descriptors for the same host silently collapsed to one
   observation in `perHostObservations`, so `hosts.length === 2` never
   held and parity comparison never ran — exit 0 without ever diffing
   codex vs claude-code. Fixed: `runConformance` now rejects any
   descriptor list that isn't exactly two distinct hosts (exit 2,
   `PL-ADAPTER-DESCRIPTOR-HOST`).
4. **FIXED** — `RULE_ID_PATTERN` was case-sensitive; a lower-case
   `pl-arch-forbidden-import` embedded in a template would defeat the
   boundary check. Fixed: added the `i` flag.

Also flagged as test-coverage gaps (addressed, not bugs): zero-case
manifest behavior, duplicate-host behavior. Both now have explicit tests.

Not a bug (adversarial pass confirmed): exit-code precedence
(`structuralFailure ? 2 : diagnostics.length ? 1 : 0`) is correctly
ordered; `normalizeObservation`'s JSON-parse-failure fallback still
participates in comparison, not silently dropped.

## Verification after fixes

- `npm run type-check`: clean.
- `npx vitest run` (adapter-conformance + Phase A kernel + ts-pl-skill):
  198/198 pass (5 new tests covering the 4 fixes + the 2 coverage gaps).
- src-only scope guard: clean on every implementation path.
- `spectra validate pl-consumer-adapter-parity`: pass.

## Scope check

Intent (from Think framing + reused Spectra proposal): prove Codex/Claude
Code adapter fixture-parity, fixture-only, no dogfood. Delivered: matches —
no writes outside temp dirs in any test; `pl-scope-guard.mjs` confirms
implementation stays below `src/*`. No scope creep, no missing requirement
against the reused proposal's task list (13/13 done).

## Verdict

Clean after fixes. Ready for Test phase (acceptance = Spectra scenarios
already exercised via the 198-test suite; no separate Given/When/Then
scenarios beyond what `specs/pl-consumer-adapter-parity/spec.md` encodes,
already covered by the fixture-manifest driven tests).
