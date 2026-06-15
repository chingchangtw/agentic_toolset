## Why

`src/skills/ts-project-planner/SKILL.md` is 641 lines / 25 KB. Loaded in full context on every invocation — even when only one command (e.g. `/ts-discover status`) is active. Wastes context budget and slows routing. Goal: match the proven `ts-deliver-router` pattern (109 lines).

## What Changes

- Rewrite `src/skills/ts-project-planner/SKILL.md` from 641 lines to ~100 lines (core + LOAD INDEX only)
- Extract 4 inline sections from SKILL.md into new reference files under `src/skills/ts-project-planner/references/`
- Copy 4 pre-written reference files from `tasks/ts-project-planner/references/` into `src/skills/ts-project-planner/references/`
- Create `src/skills/ts-project-planner/raw/` hierarchy preserving verbose originals as canonical source
- Caveman-compress all 8 `references/*.md` files in-place (40-60% line reduction)
- Update `src/skills/ts-project-planner/SKILL_caveman.md` to mirror new compact core shape

## Non-Goals

- No behavior changes to any command logic, state machine rules, or integration contracts
- No new commands or capabilities introduced
- No changes to `ts-deliver-router` or any other skill
- `raw/` files are NOT compressed — they are canonical human-readable source

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none — no spec-level behavior changes, only internal file organization)

## Impact

- Affected specs: none
- Affected code:
  - Modified: `src/skills/ts-project-planner/SKILL.md`, `src/skills/ts-project-planner/SKILL_caveman.md`
  - New: `src/skills/ts-project-planner/references/workspace-spec.md`, `src/skills/ts-project-planner/references/discovery-kanban.md`, `src/skills/ts-project-planner/references/iteration-schema.md`, `src/skills/ts-project-planner/references/work-unit-profiles.md`, `src/skills/ts-project-planner/references/discovery-state.md`, `src/skills/ts-project-planner/references/commands.md`, `src/skills/ts-project-planner/references/router-integration.md`, `src/skills/ts-project-planner/references/agents.md`, `src/skills/ts-project-planner/raw/SKILL.md`, `src/skills/ts-project-planner/raw/references/workspace-spec.md`, `src/skills/ts-project-planner/raw/references/discovery-kanban.md`, `src/skills/ts-project-planner/raw/references/iteration-schema.md`, `src/skills/ts-project-planner/raw/references/work-unit-profiles.md`, `src/skills/ts-project-planner/raw/references/discovery-state.md`, `src/skills/ts-project-planner/raw/references/commands.md`, `src/skills/ts-project-planner/raw/references/router-integration.md`, `src/skills/ts-project-planner/raw/references/agents.md`
  - Removed: none (existing `tasks/ts-project-planner/references/` source files not removed — copy only)
