# TASK: EPIC-PLDD-CONSUMER-ADAPTERS — slice 2 (pl-dogfood-activation)

## Context for a fresh session

Iter4 release. EPIC-PLDD-ENFORCEMENT-KERNEL (Phase A) and slice 1 of
EPIC-PLDD-CONSUMER-ADAPTERS (Phase B, `pl-consumer-adapter-parity`) are both
shipped and merged to `master`. This epic is **not done** — slice 2 is the
remaining, higher-risk half.

Entry point: `/ts-iteration:next` (routes through `/ts-deliver:init` →
Think). Router state already reflects slice 1's Ship as complete for this
epic — the next session should treat this as **resuming Think for slice 2**,
not starting a new epic and not jumping to Reflect.

## Scope

Dogfood-activate PLDD in `agenticToolset` itself: run the same install path
slice 1 proved on fixtures, live, against this repo's own tree. This is the
**first PLDD work allowed to write outside `src/*`** — everything before it
(Phase A kernel, Phase B slice 1) was `src/*`-only by hard boundary
(`pl-scope-guard.mjs`).

- Sequencing (locked in G1 threat model, see below): fixture-proof already
  done (slice 1) → live activation now, gated by its own G1 addendum.
- Only the activation step may touch `.agents/`, `.claude/hooks/`, router
  config, registries — nothing else in this repo.
- Must ship with: pre-install snapshot of every target path, atomic apply
  (write tmp → rename, matching the router's own `state.json` write
  pattern), and a tested rollback/uninstall that restores the snapshot
  exactly (verified by empty diff).
- Scope expansion history: originally Iter4 excluded dogfood entirely
  (`release_exit_criteria` said "no dogfood activation occurs"). ctony
  explicitly expanded scope to include it on 2026-07-20 — see
  `.agents/iteration.json` release_exit_criteria and
  `.agents/ts-project-planner/plan.json` Iter4 epics notes for the current
  (post-expansion) wording.

## Required reading before Think

1. `.agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/think/g1-threat-model.md`
   — already covers dogfood activation's STRIDE analysis, blast-radius
   bounds, and recovery path. G1 was signed off by ctony covering **both**
   slices, so Think for slice 2 may not need a fresh G1 unless Plan reveals
   something the existing threat model didn't anticipate (e.g. the exact
   `pl-scope-guard.mjs` allowlist mechanism, still an open item from that
   doc).
2. `.agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/think/framing.md`
   and `never_automate.md` — same dir, same scope note.
3. `.agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/review/report.md`
   and `test/` dir — slice 1's evidence, useful precedent for what "real"
   vs "gamed" verification looks like on this epic (mutation-testing
   investigation is worth reading before repeating the same tool blindly).
4. `src/skills/ts-pl/references/host-adapters.md` — slice 1's shipped
   adapter contract; slice 2 activates it, doesn't change it.
5. `src/scripts/pl-adapter-conformance.mjs` + `src/scripts/pl-scope-guard.mjs`
   — slice 2 will likely need to extend `pl-scope-guard.mjs` with an
   explicit allowlist for the activation entry point (open item from the
   G1 threat model — "decide in Plan, not Think").

## Open decisions to make in Plan (explicitly deferred from G1)

- Exact allowlist mechanism for `pl-scope-guard.mjs`: extend the existing
  boundary check with an activation-specific allowlist, vs. bypass it
  entirely for that one command. Decide with a real design tradeoff, not a
  default.
- Whether activation runs as a Spectra-tracked task with its own BDD
  scenario, or as a manual Build-phase checklist item.
- No existing Spectra change proposal for this slice yet (unlike slice 1,
  which reused a pre-existing `pl-consumer-adapter-parity` change) — check
  `spectra list` and `spectra list --parked` first in case one was created
  since this was written, then `/spectra-propose` if not.

## Do NOT

- Do not activate PLDD hooks/router config without the pre-install
  snapshot + rollback proof landing in the same change.
- Do not auto-sign G1/G2 — both hard-block regardless of DIAL autonomy,
  per this repo's router rules.
- Do not bundle slice-2 work into any pre-existing unrelated uncommitted
  change in the working tree (check `git status` before staging — slice 1
  found a stray unrelated `README.md` edit already sitting there;
  confirm whether it's still there and still unrelated before excluding
  it again).
