## Why

`pl-consumer-adapter-parity` (slice 1) proved the Codex/Claude Code adapter
contract against isolated fixtures only — `host-adapters.md` names this gap
directly: "Activating either adapter inside `agenticToolset` itself is a
separate, explicitly-approved step tracked outside this suite." Iter4's
release goal now explicitly includes that live activation (scope expanded
2026-07-20, ctony), and it is the first PLDD work permitted to write outside
`src/*`. Without a manifest-driven snapshot, atomic apply, and a tested
rollback, activating live risks leaving this repo's own `.agents/` state,
`.claude/hooks/`, and router registries in a broken, unrecoverable state —
breaking every future session that reads them.

## What Changes

- New `src/scripts/pl-dogfood-activate.mjs`: enumerates every target path the
  activation step will write (`.agents/ts-deliver-router/registry.json`,
  `.claude/hooks/*` PLDD-related hooks, router config additions), snapshots
  each target's current content to a timestamped snapshot directory before
  any write, writes new content to a temp path and renames it into place
  (matching the router's own `state.json` atomic-write pattern), and emits a
  generated-file manifest listing every path touched with old/new content
  hashes.
- New `src/scripts/pl-dogfood-rollback.mjs`: given a manifest produced by
  `pl-dogfood-activate.mjs`, restores every listed path from its snapshot
  using the same atomic write-tmp-then-rename pattern, and asserts the
  restored tree diffs empty against the pre-install snapshot.
- Modified `src/scripts/pl-scope-guard.mjs`: `checkPhaseAScope` currently
  rejects any path outside `src/` unconditionally with no allowlist
  mechanism. Extend it with an explicit, named allowlist parameter (not a
  blanket bypass) so only paths declared in the activation manifest are
  permitted outside `src/*` — every other caller of the guard keeps today's
  unconditional behavior.
- The activation step is tracked as this Spectra change with its own BDD
  scenarios (not an ad-hoc Build-phase checklist item), so its behavior is
  specified and testable the same way slice 1's adapter conformance was.

## Capabilities

### New Capabilities

- `pl-dogfood-activation`: manifest-driven snapshot, atomic apply, and
  tested rollback for activating PLDD live inside agenticToolset's own
  .agents/, .claude/hooks/, and router registries, plus the explicit
  scope-guard allowlist that permits only this activation entry point to
  write outside src/*.

### Modified Capabilities

(none — pl-enforcement-kernel's Phase A isolation requirement governs
Phase A implementation only and is not changed by this proposal; this
proposal's writes go through a new, separately-gated activation path, not
through Phase A's checkers)

## Impact

- Affected specs: `pl-dogfood-activation` (new)
- Affected code:
  - New: `src/scripts/pl-dogfood-activate.mjs`
  - New: `src/scripts/pl-dogfood-rollback.mjs`
  - New: `src/tests/unit/pl-dogfood-activate.test.ts`
  - New: `src/tests/unit/pl-dogfood-rollback.test.ts`
  - Modified: `src/scripts/pl-scope-guard.mjs`
  - Modified: `src/tests/unit/pl-scope-guard.test.ts`
