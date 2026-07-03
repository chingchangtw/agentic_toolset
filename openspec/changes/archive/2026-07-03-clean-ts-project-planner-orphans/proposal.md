## Summary

Delete the stale raw/ staging copy and move README.md into references/ in src/skills/ts-project-planner, applying the same treatment already given to src/skills/ts-deliver-router in the archived align-skill-file-layout change.

## Motivation

skill-validator flags two structural issues in src/skills/ts-project-planner/ that were left unaddressed when the equivalent issues were fixed in ts-deliver-router: an unknown raw/ directory (9 files: SKILL.md plus 8 references/*.md) that agents using the standard skill structure cannot discover, and a root-level README.md flagged as unnecessary agent context per Anthropic's skill-authoring guidance (skills should only contain files that directly support agent functionality). Neither is referenced anywhere in the canonical src/skills/ts-project-planner/SKILL.md or any other file in src/ or scripts/ (confirmed via repository-wide search). Comparing raw/'s content against the canonical references/ + SKILL.md shows raw/ is an earlier draft snapshot, not a distinct or newer version — e.g. raw/references/agents.md still has the pre-trim wording "Strategic fit assessment during /ts-discover validate" where the canonical version reads the shorter "Strategic fit during /ts-discover validate", and raw/SKILL.md is 656 words versus the canonical SKILL.md's 555. Both files trace to the same originating commit and raw/ was never touched again while the canonical files continued to be edited, confirming raw/ was frozen in place as dead weight rather than actively maintained.

## Proposed Solution

Two changes to src/skills/ts-project-planner/:

1. Delete the entire raw/ directory (raw/SKILL.md and the eight files under raw/references/: agents.md, commands.md, discovery-kanban.md, discovery-state.md, iteration-schema.md, router-integration.md, work-unit-profiles.md, workspace-spec.md). This mirrors the deletion of src/skills/ts-deliver-router/rawfiles/ in the archived align-skill-file-layout change: a full duplicate staging copy, unlinked from the canonical SKILL.md, that ships as dead weight in every release.zip.

2. Move src/skills/ts-project-planner/README.md to src/skills/ts-project-planner/references/README.md. This mirrors the equivalent move already done for src/skills/ts-deliver-router/README.md. Note this does not change shipping status either way: EXCLUDED_FILES in scripts/lib/exclusions.mjs matches README.md by basename regardless of directory, so it remains excluded from every release build before and after the move. The move only resolves skill-validator's "unexpected file at root" / "not needed in a skill" warning and removes it from the non-standard-content token count at the skill root.

## Non-Goals

- No content merge or rewrite — unlike PROJECT_SETUP.md in the ts-deliver-router change, no content in raw/ or README.md needs to be preserved elsewhere; raw/ is confirmed stale/superseded and README.md's content (human-facing install/usage docs) has no other skill that should absorb it.
- No change to scripts/lib/exclusions.mjs — same rationale as the ts-deliver-router change: only this skill's directory layout changes, which naturally alters what content the existing filter rules match.
- No fix for the ts-orchestrate/commands/ "unknown directory" warning or the ts-deliver-router registry-<phase>.md "potentially unreferenced" false positives — both were evaluated and are intentionally left as-is: commands/ holds slash-command definitions (a genuinely different category from reference docs, renaming would misrepresent their purpose), and the registry-<phase>.md warnings are false positives from SKILL.md's <phase> templating pattern that skill-validator's string-containment check cannot expand, not real orphans.
- No fix for the unrelated unclosed-code-fence defect in src/skills/ondemand/ts-project-init-advisor/references/init-plan-template.md — different defect class (markdown structural validity, not orphan/broken-reference), pre-existing and unrelated to this change's scope.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- Affected specs: none — no capability requirements change; this is a file-layout cleanup within existing packaging rules, same category as the archived align-skill-file-layout change.
- Affected code:
  - New: src/skills/ts-project-planner/references/README.md
  - Modified: (none)
  - Removed: src/skills/ts-project-planner/raw/SKILL.md, src/skills/ts-project-planner/raw/references/agents.md, src/skills/ts-project-planner/raw/references/commands.md, src/skills/ts-project-planner/raw/references/discovery-kanban.md, src/skills/ts-project-planner/raw/references/discovery-state.md, src/skills/ts-project-planner/raw/references/iteration-schema.md, src/skills/ts-project-planner/raw/references/router-integration.md, src/skills/ts-project-planner/raw/references/work-unit-profiles.md, src/skills/ts-project-planner/raw/references/workspace-spec.md, src/skills/ts-project-planner/README.md (moved)
