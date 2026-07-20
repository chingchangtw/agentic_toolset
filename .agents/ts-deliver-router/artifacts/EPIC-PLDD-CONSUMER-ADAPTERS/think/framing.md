# Think — EPIC-PLDD-CONSUMER-ADAPTERS (framing)

## Goal
Ship PLDD consumer-project adapters (scaffold/install for downstream projects) AND
dogfood-activate PLDD in agenticToolset itself, with a proven rollback path.
Scope expanded 2026-07-20 (ctony) from fixture-only to include live activation.

## Two sub-deliverables, sequenced
1. **Consumer adapters** (src-only): scaffold/install generators, optional
   dependency-cruiser/ESLint config generation, cards, agent contracts, templates.
   Proven first against isolated fixtures — generated-file manifest + rollback test,
   same discipline as Phase A (pl-scope-guard.mjs boundary: paths outside `src/` fail
   the check).
2. **Dogfood activation**: run the adapters' install path against agenticToolset's
   own live tree — the only step in this epic allowed to write outside `src/*`
   (`.agents/`, `.claude/hooks/`, router config, registries). Runs only after (1) is
   proven on fixtures.

## What already exists (Phase A, done)
- `src/scripts/pl-arch-check.mjs`, `pl-contract-check.mjs`, `pl-scope-guard.mjs` —
  fail-closed architecture/placement checker, stable diagnostics, contract-id parity.
  86.22% mutation score, 0 dep vulns, merged PR #7 (42572ec).
- `pl-scope-guard.mjs` enforces the Phase-A src-only boundary today; dogfood
  activation is the first work that legitimately needs to write outside that
  boundary, so the guard's boundary check itself must be either bypassed
  deliberately for the activation step or extended with an explicit allowlist —
  TBD in Plan, flagged here so it isn't a silent scope violation.

## Not in scope
- Modifying `pl-arch-check.mjs` / `pl-contract-check.mjs` core rule logic (Phase A
  is closed/shipped).
- Root package.json/lockfile changes.
- Any change to `src/skills/ts-deliver-router` spine/phase logic itself (this epic
  is a *consumer* of the router, not a router change).

## Failure modes to design against
- Dogfood install partially fails mid-write, leaving `.agents/`/hooks in a broken
  state with no clear "last known good" — mitigated by manifest-before-write +
  atomic apply + rollback script, tested in Build before Ship.
- Installed hooks/router config silently diverge from `src/` template source over
  time (same class of bug as the Iter3 installer-dedup epic, applied to a new
  category) — manifest must be re-derivable/diffable, not hand-edited post-install.

## Verification plan
- Fixture-only install/uninstall round-trip: byte-identical tree before/after
  install+rollback.
- Dogfood install: snapshot `.agents/`, `.claude/hooks/`, router config before
  install; after install+rollback, diff against snapshot — must be empty.
- G1 threat-model addendum required specifically for the dogfood-activation step
  (see g1-threat-model.md) before Plan starts on that sub-deliverable.
