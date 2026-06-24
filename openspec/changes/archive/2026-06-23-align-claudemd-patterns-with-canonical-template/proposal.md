## Why

`claudemd-patterns.md` (the ts-project-init-advisor pattern library) has drifted from the canonical `CLAUDE.md` template in `src/project_root_structure/CLAUDE.md`. It teaches wrong section names ("Behavior Rules" instead of "Hard Rules"), includes sections that belong in `.claude/settings.json` or `goverance_CLAUDE.md` (Tool Permissions, Sub-agent Contracts, Compaction Strategy), and is missing the required Commands section. An advisor using this library will produce malformed project CLAUDE.md files.

## What Changes

- Add `Commands` section template to pattern library (required section, currently absent)
- Rename "Behavior Rules" → "Hard Rules" throughout (section name, rubric, good example)
- Remove "Tool Permissions" template (belongs in `.claude/settings.json` and Hard Rules)
- Remove "Sub-agent Contracts" template (belongs in `goverance_CLAUDE.md` Agents Registry)
- Remove "Compaction Strategy" template (not in canonical template or any golden file)
- Move "MCP / Tool References" from required to optional sections
- Remove generic "Always/Never" items from Hard Rules template (duplicated from `.claude/CLAUDE.md` Core Principles and Anti-Slop Discipline)
- Update scoring rubric: remove Tool Permissions and Sub-agent Contracts rows; add Commands row; adjust max score 16 → 12
- Add rubric threshold descriptions for 12-point scale
- Remove Sub-agents and Compaction blocks from the Good Example section

## Non-Goals

- No changes to any file other than `src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md`
- Not updating `src/project_root_structure/CLAUDE.md` (canonical template is source of truth, not changed)
- Not adding any new advisor logic or scoring heuristics beyond what the PLAN specifies
- Not restructuring the anti-patterns section (Section 3) — already correct

## Capabilities

### New Capabilities

- `claudemd-pattern-library`: Canonical section checklist and rubric for the ts-project-init-advisor pattern library, specifying which sections are required, which are optional, and the 12-point scoring scale

### Modified Capabilities

(none)

## Impact

- Affected specs: none
- Affected code:
  - Modified: `src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md`
