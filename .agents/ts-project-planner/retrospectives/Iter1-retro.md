# Iter1 retro — EPIC-DUAL-TRACK-ORCHESTRATION

Date: 2026-07-05

## Release exit criteria (4/4 verified)

1. `npm test` fully green incl. previously-failing hook tests — ✅ 69/69, 6 files.
2. `dist/release.zip` contains both agent files; `npm run dogfood` mirrors both
   into `.claude/agents/` — ✅ verified live (T12 + Ship-phase re-check).
3. `ts-orchestrate/SKILL.md` has both Workflow Guidance and Workflow Routing
   tables (D7) — ✅ `grep -c '| Discovery |'` → 7, `grep -c '| Delivery |'` → 7.
4. `/ts-discover explore` and `/ts-discover decide build` enforce facilitator/
   ddd-validator gates (D2/D3) — ✅ `commands.md` step 5 gate (explore) and
   `build:` precondition (decide) both present, committed in cb71d9f.

## What went well

- The runbook (`tasks/dual-track-orchestration-plan.md`, T1-T12 + T9.5, 12
  locked decisions) let Build execute with zero re-litigated design
  questions — every anchor/edit was pre-verified against the working tree.
- state.json's `tasks_done: 1` was stale by the time this session picked the
  epic back up — git history (8 commits, T1-T11 all landed) was the actual
  source of truth. Caught by comparing state.json against `git log` before
  trusting the router's claimed phase, per the router's own staleness rule.
- 8-angle code-review at Review phase caught two real gaps that unit tests
  didn't: `pilot.mjs` never asserted the new `agents` manifest category
  actually installs, and `design.md`'s D9 overstated test coverage it didn't
  have. Both were cheap, surgical fixes (3 lines, 2 doc edits).

## What to watch next time

- **state.json can drift silently from git reality** when Build-phase work
  happens across sessions without a router-driven exit write. Before trusting
  `tasks_done`/`complete` flags, diff against `git log` when the numbers look
  suspiciously low relative to committed work.
- **Doc claims about test coverage need the same rigor as code claims.**
  D9's "lockstep enforced by hook-output tests" was never checked against
  what the tests actually assert — a design doc asserting test coverage that
  doesn't exist is the same failure mode as a comment describing behavior
  the code doesn't have.

## Carried-forward follow-ups (non-blocking, tracked in discovery.json idea-002)

1. Add JSON-shape/type check for sub-agent output (not just non-empty).
2. Hook-vs-SKILL.md guidance lockstep has no test (D9, corrected doc claim
   during this epic's Review phase — the gap itself remains open).
3. Installer/build-script rule-of-three duplication (`install.sh`/`.ps1`,
   `build-release.mjs`, `dogfood.mjs`) — flagged during Review, deferred as
   refactor-scope.
4. Release/Iteration DDD model gap (`WorkflowStateInjected` mis-classified
   as a domain event rather than a projection).
