# Plan — design-review gate: EPIC-GOLDEN-TEMPLATES

Reviewed: openspec/changes/golden-agent-context-templates/ (proposal, design, 3 specs, tasks).

## Step 0 — Scope check
2 new files, 3 modified. Under complexity threshold (8 files / 2 new services). No reduction needed.

## Architecture
1 issue found and resolved: design.md D4 said "unified diff" without specifying a generation mechanism. Checked repo state directly — zero runtime dependencies in package.json, no diff-generation code anywhere. Root cause: the advisor is agent-executed (SKILL.md instructions run by an end user's own Claude Code session), not compiled Node code — no diff library needed, the agent compares files itself. design.md D4, tasks.md 3.2, and specs/advisor-golden-gap-scan/spec.md updated to remove the "unified diff" phrasing and state this explicitly.

## Code Quality
No issues. Sync/parity implementation plan reuses existing `cp()`/`validateSkill()` conventions from scripts/build-release.mjs rather than introducing new patterns.

## Test Review
Build-time code (sync, parity gate) has unit test tasks (1.1, 2.1) — real Node code, real tests. Advisor SKILL.md behavior (3.1-3.3) is manual-verification only — appropriate for prose-instruction content, matches existing project convention for other skills' behavior verification. No gap.

## Regression
None. Pure addition; install.sh gets documentation only.

## Performance
No concern at this scale (5 small text files).

## NOT in scope
Automated content merge/patch (deliberate — resolves Discovery's top M-risk by refusing to guess); install.sh behavior change; runtime update-checking; new slash command. All already stated in proposal.md Non-Goals.

## What already exists (reused, not rebuilt)
- `cp()`/`cpSync` pattern — scripts/build-release.mjs
- `validateSkill()` fail-the-build pattern — scripts/build-release.mjs
- Target-project file reading — advisor SKILL.md Phase 1-2 (existing capability, no new mechanism for gap-scan's file reads)

## Failure modes
Covered in design.md Implementation Contract: missing/stale golden file → build fails with named file; target-file unreadable at advisor-run time → surfaced as setup gap, never silently skipped.

## Verdict
CLEARED. design-review gate passed with one correction applied (diff mechanism clarified across design.md, tasks.md, and the advisor-golden-gap-scan spec).
