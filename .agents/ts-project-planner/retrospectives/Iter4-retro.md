# Iter4 Retro — Release Close

Both Iter4 epics done: `EPIC-PLDD-ENFORCEMENT-KERNEL` (see its own
epic-level retro, `Iter4-EPIC-PLDD-ENFORCEMENT-KERNEL-retro.md`, for Phase A
detail) and `EPIC-PLDD-CONSUMER-ADAPTERS` (both slices, this retro's focus).
2/2 epics done, 0 deferred.

## Summary

`EPIC-PLDD-CONSUMER-ADAPTERS` shipped in two sequenced slices after scope
expansion (ctony, 2026-07-20) moved dogfood activation in-scope for this
release, superseding the original fixture-only exit criteria:

- **Slice 1** (`pl-consumer-adapter-parity`): fixture-only Codex/Claude Code
  adapter conformance proof. Merged PR #8 (`ec87b4f`). Mutation score 68.33%.
- **Slice 2** (`pl-dogfood-activation`): manifest-driven snapshot/atomic-
  apply/rollback mechanism, proven live against `agenticToolset`'s own tree —
  the first PLDD write outside `src/*` in this repo's history. Merged PR #9
  (`ccc08bc`). Mutation score 88.03%.

## What shipped

- `src/scripts/pl-adapter-conformance.mjs` + Codex/Claude Code descriptors
  and templates (slice 1).
- `src/scripts/pl-dogfood-activate.mjs`, `pl-dogfood-rollback.mjs`, and an
  extended `pl-scope-guard.mjs` (`checkPhaseAScope(paths, allowedPaths=[])`)
  that permits only explicitly declared activation targets to write outside
  `src/*` (slice 2).
- Real-tree proof: activated the Claude Code adapter's single
  `.claude/commands/pl-check.md` file live, verified exact diff, rolled it
  back, verified empty diff — twice (once pre-Review-fixes, once after).

## Gate outcomes

- **G1** (threat model): signed off by ctony once at epic level, explicitly
  covering both slices (`g1-threat-model.md` title: "incl. dogfood
  activation"). Carried forward unchanged into slice 2's Think — no fresh G1
  needed, no new unknowns surfaced that the original threat model hadn't
  anticipated.
- **G2**: signed off separately per slice (68.33% and 88.03% mutation
  scores respectively, both well above the 60% break threshold).

## What worked

- **Reusing the epic-level G1 across both slices** instead of re-running a
  full threat-model exercise for slice 2 — the original threat model's Flow
  2 (dogfood install) analysis was written with enough foresight to cover
  the live-activation case before it was built, so Think for slice 2 was a
  ~15-minute confirmation pass, not a re-derivation.
- **Real-tree verification, not just fixture tests, for a live-write
  mechanism.** Fixture tests proved the activate/rollback logic in
  isolation; a real activate→verify→rollback→verify-empty-diff round-trip
  against this repo's own tree (twice) is what actually validates the G1
  threat model's core promise. The harness even live-picked-up the new
  `pl-check` slash command mid-session — concrete evidence the mechanism
  has real effect, not a simulation.
- **Adversarial review found a genuine HIGH-severity gap** an inside view
  missed: the original apply-phase implementation built its manifest via a
  single `.map()` return, so a failure partway through a multi-target run
  would leave already-applied targets live with zero manifest to roll back
  from — directly contradicting the design's own stated recovery guarantee.
  Fixed before Ship, not discovered after.
- **Mutation testing caught the same class of gap slice 1 already found**
  (CLI/`isMainModule`/`runCli` entrypoints only reachable via subprocess,
  invisible to Stryker's in-process runner) and the fix pattern from slice
  1's retro (in-process dynamic-import tests) transferred directly —
  learned-pattern reuse across slices in the same epic.

## What was hard / notable risk

- **Pausing for a human decision on real-world scope.** This repo had zero
  existing PLDD-related `.claude/hooks/` or `.agents/` registry content to
  reuse as a live-activation target, so "what should the first real payload
  be" was a genuine open question the design docs deliberately left
  unresolved. Surfaced via `AskUserQuestion` rather than guessing — ctony
  chose the minimal-blast-radius option (a single inert slash-command file,
  not a live-enforcement hook).
- **Router state reset between slices within the same epic** (archiving
  slice 1's final `ship` state to `history.jsonl`, resetting `state.json` to
  `think` for slice 2) isn't a pattern any prior epic in this project's
  history needed, since no prior epic split into sequenced slices. Worked
  by mirroring the existing epic-activation archive pattern at slice
  granularity instead of epic granularity — no schema change needed, but
  worth naming explicitly in `router-integration.md` if multi-slice epics
  become common.
- Preflight caught a real artifact bug before Build even started:
  `proposal.md`/`design.md`/`tasks.md` all referenced `src/tests/pl-*.test.ts`
  but this project's actual convention is `src/tests/unit/pl-*.test.ts` —
  a typo that would have made every task's stated verification target
  wrong. Caught by `/spectra-apply`'s preflight check, not by a human
  re-reading the artifacts.

## Follow-ups (non-blocking, not actioned this session)

- 3 LOW-severity findings from slice 2's adversarial review accepted, not
  fixed: no symlink/`realpath` verification in the activate/rollback
  scripts, non-unique tmp filenames (`<target>.tmp` with no PID/random
  suffix), and inherent TOCTOU between `existsSync` and the later
  read/write. All rationalized against the design's explicit single-
  operator/manual-invocation threat model — would need revisiting if this
  mechanism is ever driven by an automated/concurrent caller.
- No live-enforcement hook is wired to run PLDD checks on every session in
  this repo — this release proved the activation *mechanism* is safe, not
  that PLDD is "on" by default here. That's an explicitly separate future
  decision (`host-adapters.md` documents the boundary precisely).
- Codex's adapter was never activated live in this repo (no `.codex/`
  directory exists here) — only the Claude Code adapter was proven as the
  real payload. If Codex support in this repo is ever wanted, it needs its
  own activation pass through the now-proven mechanism.
