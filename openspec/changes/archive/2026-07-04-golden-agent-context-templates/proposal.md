## Why

ts-project-init-advisor generates PROJECT_INIT_PLAN.md to set up Claude Code for a target project, but has no concept of this repo's own five agent-context files (CLAUDE.md, AGENTS.md, .claude/CLAUDE.md, .claude/goverance_CLAUDE.md, .github/copilot-instructions.md, authored in src/project_root_structure/). Today those files only reach an end user via install.sh SCAFFOLD=y, a blind copy-if-absent path most users never invoke, with no path for projects that already have partial context files. Three Discovery pivots (copy/merge to user's project directly to recommend-only to recommend ADD-or-MODIFY with a direct-create carve-out for absent files) converged on a design with almost no automated-merge risk: absent files are safe to create directly since nothing exists to clobber, and existing files only ever get a human-approved recommendation, never an automatic write.

## What Changes

- New build-time sync step copies the five files from src/project_root_structure/ into src/skills/ondemand/ts-project-init-advisor/assets/golden/, preserving each file's relative subpath (assets/golden/CLAUDE.md, assets/golden/AGENTS.md, assets/golden/.claude/CLAUDE.md, assets/golden/.claude/goverance_CLAUDE.md, assets/golden/.github/copilot-instructions.md).
- New parity gate in the release build fails scripts/build-release.mjs when assets/golden/ content differs from the src/project_root_structure/ sources, so a stale or hand-edited golden copy cannot ship.
- New advisor behavior: for each of the five golden files, scan the target project for presence. Absent → create it directly from assets/golden/<file>, byte-identical, guarded to the absent-only case (never overwrites). Present → run gap analysis against the golden content and emit an approval-gated MODIFY task into PROJECT_INIT_PLAN.md; the advisor never writes to an existing target file itself.
- Documented coexistence posture between this new advisor path and the existing install.sh SCAFFOLD=y blind-copy path (no installer behavior change in this epic — decision recorded in design.md).

## Non-Goals

- No automated content merge or patch logic that edits an existing file's content — MODIFY is always a human-approved task, never an automatic edit. This is the core risk-reduction decision from the Discovery pivots and is not open for reconsideration within this epic.
- No change to install.sh SCAFFOLD=y behavior — only its coexistence posture is documented, not its implementation.
- No runtime "check for template updates" feature — parity is enforced once, at release-build time, not checked against a live upstream at install or advisor-run time.
- No new user-facing slash command — the gap scan runs as part of the advisor's existing PROJECT_INIT_PLAN.md generation flow (Phase 4 of the existing advisor SKILL.md), not a separate invocation.
- No changes to the other files under src/project_root_structure/ that are not in the five-file golden set: .claude/settings.json, .claude/settings.local.json, docs/, tasks/, .github/backend.instructions.md, .github/frontend.instructions.md.

## Capabilities

### New Capabilities

- `golden-template-sync`: build-time step that copies the five golden agent-context files from src/project_root_structure/ into src/skills/ondemand/ts-project-init-advisor/assets/golden/, preserving subpaths, so the advisor skill package carries its own canonical copy independent of the installer's scaffold path.
- `golden-template-parity-gate`: release-build-time check that fails scripts/build-release.mjs when assets/golden/ content diverges from the src/project_root_structure/ sources, preventing a stale or manually-edited golden copy from shipping.
- `advisor-golden-gap-scan`: ts-project-init-advisor behavior that scans a target project for each of the five golden files and either creates the file directly (absent case, guarded) or emits an approval-gated MODIFY recommendation task (present case, gap analysis vs golden content, never auto-writes).

### Modified Capabilities

(none)

## Impact

- Affected specs: new golden-template-sync, golden-template-parity-gate, advisor-golden-gap-scan capability specs.
- Affected code:
  - New: src/skills/ondemand/ts-project-init-advisor/assets/golden/CLAUDE.md, src/skills/ondemand/ts-project-init-advisor/assets/golden/AGENTS.md, src/skills/ondemand/ts-project-init-advisor/assets/golden/.claude/CLAUDE.md, src/skills/ondemand/ts-project-init-advisor/assets/golden/.claude/goverance_CLAUDE.md, src/skills/ondemand/ts-project-init-advisor/assets/golden/.github/copilot-instructions.md, scripts/sync-golden-templates.mjs
  - Modified: scripts/build-release.mjs, src/skills/ondemand/ts-project-init-advisor/SKILL.md, release/install.sh
  - Removed: (none)
