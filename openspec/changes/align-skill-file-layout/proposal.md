## Summary

Align src/skills/ts-deliver-router's file layout with the scripts/references/assets convention used by other skills, consolidate its setup documentation into ts-project-init-advisor, and delete two dead backup files.

## Motivation

ts-deliver-router carries four structural problems flagged independently by the earlier reference audit (tasks/src-skills-reference-audit.md) and by running skill-validator against the tree: a registry/ directory that skill-validator flags as non-standard AND that scripts/lib/exclusions.mjs excludes from every release build, even though SKILL.md's own LOAD INDEX table (four rows) instructs agents to read registry/registry-index.md and registry/registry-<phase>.md for core routing behavior — end users installing this skill get a SKILL.md that references files never present in their package. A skill-root README.md that skill-validator flags as unnecessary agent context per Anthropic's skill-authoring guidance. A PROJECT_SETUP.md skill-root file containing a ready-to-paste CLAUDE.md template for ts-deliver-router setup, duplicating territory that belongs with ts-project-init-advisor (the skill whose entire purpose is generating CLAUDE.md setup content). Two backup files, SKILL.original.md and SKILL_caveman.md, that serve no runtime purpose and are already excluded from every release build by scripts/lib/exclusions.mjs (EXCLUDED_FILES: 'SKILL_caveman.md'; EXCLUDED_FILE_SUFFIXES: '.original.md').

## Proposed Solution

Four changes to src/skills/ts-deliver-router/ and src/skills/ondemand/ts-project-init-advisor/:

1. Move the nine files in src/skills/ts-deliver-router/registry/ into src/skills/ts-deliver-router/references/, preserving filenames (registry-build.md, registry-index.md, registry-plan.md, registry-reflect.md, registry-review.md, registry-schema.md, registry-ship.md, registry-test.md, registry-think.md), then delete the now-empty registry/ directory. Update all four registry/ path references inside src/skills/ts-deliver-router/SKILL.md (the LOAD INDEX table rows and the routing-logic line) to references/. This is the one change with a real packaging-behavior effect: registry/ is in EXCLUDED_DIRS in scripts/lib/exclusions.mjs, so these nine files never ship today; references/ is never excluded, so after this move they will ship for the first time, closing the gap between what SKILL.md instructs agents to read and what installed packages actually contain.

2. Move src/skills/ts-deliver-router/README.md to src/skills/ts-deliver-router/references/README.md. Note this does not change shipping status either way: EXCLUDED_FILES in scripts/lib/exclusions.mjs matches by basename regardless of directory, so README.md remains excluded from every release build before and after the move. The move only resolves skill-validator's "unexpected file at root" warning and removes it from the non-standard-content token count at the skill root.

3. Merge the ts-deliver-router CLAUDE.md template content from src/skills/ts-deliver-router/PROJECT_SETUP.md into src/skills/ondemand/ts-project-init-advisor/SKILL.md as a new section named "ts-deliver-router CLAUDE.md Template", placed immediately before the existing "Reference Files" section, preserving the full markdown code block content of PROJECT_SETUP.md (Workflow Hub, Core 4, Agents, Required External Dependencies, Build Phase rules, Discovery Feedback Hook, Security Gates, Plugin Stack, MCPs Active, Harvested Skills, Sub-Agents, Commands, Design Principles) verbatim. Delete src/skills/ts-deliver-router/PROJECT_SETUP.md afterward. No other file references PROJECT_SETUP.md (confirmed via repository-wide search), so no other update is needed.

4. Delete src/skills/ts-deliver-router/SKILL.original.md and src/skills/ts-deliver-router/SKILL_caveman.md. Neither is referenced by src/skills/ts-deliver-router/SKILL.md or by any script; src/skills/ts-project-planner/README.md mentions SKILL_caveman.md only as an illustrative example of the general pattern (a package-contents listing), not as a functional reference to this specific file, so it needs no update.

## Non-Goals

- No change to scripts/lib/exclusions.mjs — the exclusion filter's directory/file-name rules stay as-is; only ts-deliver-router's own directory layout changes, which naturally alters what content those existing rules match.
- No new delta spec for the release-encapsulation capability — its requirement (shared exclusion filter definition and behavior) is unchanged; this change only alters which files in one skill fall under existing filter categories.
- No content rewrite of the merged CLAUDE.md template — moved verbatim into ts-project-init-advisor/SKILL.md; deciding whether/how ts-project-init-advisor's Phase 3/4 recommendation logic should actively surface this template is separate follow-up work.
- No reorganization of any other skill's directory layout (ts-acpl, ts-project-planner, ts-orchestrate) — scoped to ts-deliver-router and the one merge target in ts-project-init-advisor.
- Rejected: keeping registry/ as a name but excluding it from EXCLUDED_DIRS instead of moving files. Rejected because the skill-validator non-standard-directory warning would persist, and the fix wouldn't align the directory with the scripts/references/assets convention the other five skills already follow.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- Affected specs: none — no capability requirements change; this is a file-layout reorganization within existing packaging rules.
- Affected code:
  - New: src/skills/ts-deliver-router/references/README.md, src/skills/ts-deliver-router/references/registry-build.md, src/skills/ts-deliver-router/references/registry-index.md, src/skills/ts-deliver-router/references/registry-plan.md, src/skills/ts-deliver-router/references/registry-reflect.md, src/skills/ts-deliver-router/references/registry-review.md, src/skills/ts-deliver-router/references/registry-schema.md, src/skills/ts-deliver-router/references/registry-ship.md, src/skills/ts-deliver-router/references/registry-test.md, src/skills/ts-deliver-router/references/registry-think.md
  - Modified: src/skills/ts-deliver-router/SKILL.md, src/skills/ondemand/ts-project-init-advisor/SKILL.md
  - Removed: src/skills/ts-deliver-router/registry/registry-build.md, src/skills/ts-deliver-router/registry/registry-index.md, src/skills/ts-deliver-router/registry/registry-plan.md, src/skills/ts-deliver-router/registry/registry-reflect.md, src/skills/ts-deliver-router/registry/registry-review.md, src/skills/ts-deliver-router/registry/registry-schema.md, src/skills/ts-deliver-router/registry/registry-ship.md, src/skills/ts-deliver-router/registry/registry-test.md, src/skills/ts-deliver-router/registry/registry-think.md, src/skills/ts-deliver-router/README.md (moved), src/skills/ts-deliver-router/PROJECT_SETUP.md, src/skills/ts-deliver-router/SKILL.original.md, src/skills/ts-deliver-router/SKILL_caveman.md
