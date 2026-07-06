# Review report — EPIC-DUAL-TRACK-ORCHESTRATION

Date: 2026-07-05
Scope: `git diff origin/master...HEAD` (8 commits, 59 files, 2690+/75- lines)
Method: gstack `/code-review high` — 8 independent finder angles (line-by-line,
removed-behavior, cross-file trace, reuse, simplification, efficiency,
altitude, CLAUDE.md conventions), self-verified against source.

## Findings (3, all addressed or explicitly deferred)

1. **CONFIRMED — fixed.** `scripts/pilot.mjs` asserted skills/hooks land on
   disk post-install but never `manifest.agents`. Added the missing loop;
   verified end-to-end with `npm run pilot` (new `agent installed: ...` lines
   pass).
2. **CONFIRMED — fixed.** `design.md` D9 claimed hook/SKILL.md guidance-string
   duplication was "lockstep enforced by hook-output tests" — false, those
   tests never read SKILL.md. Corrected the doc claim; true state (untested,
   manually-kept-in-sync duplication) now logged as an idea-002 follow-up.
3. **CONFIRMED — deferred, not blocking.** Installer/build-script `agents`
   category wiring (`install.sh`, `install.ps1`, `build-release.mjs`,
   `dogfood.mjs`) is a third copy-pasted per-category loop (rule of three, no
   shared helper). Consistent with the codebase's existing skills/hooks
   pattern — refactor-scope cleanup, recorded in design.md Risks, not a
   release blocker.

No correctness bugs found in the executable code paths (phase-routing.ts
switch exhaustiveness, hook jq focus-priority chain, manifest fallback
handling across bash/PowerShell/Node all verified safe). Full suite green
after fixes: type-check clean, 69/69 unit tests, `npm run pilot` PASS.

## Gates

- `staff-review`: passed — see findings above, both actionable ones fixed.
- `security-review`: passed — no new attack surface; installer `cp`
  overwrite behavior unchanged from pre-existing skills/hooks pattern
  (already accepted in G1 STRIDE analysis at Think-phase).
- `get_review_context`: passed — full diff read against live source, not
  diff-only.

## Carried-forward follow-ups (non-blocking, tracked in discovery.json idea-002)

1. Add JSON-shape/type check for sub-agent output (not just non-empty).
2. Hook-vs-SKILL.md guidance lockstep has no test (corrected D9 claim above).
3. Installer/build-script rule-of-three duplication (this review's finding 3).
4. Release/Iteration DDD model gap (WorkflowStateInjected mis-classified).
