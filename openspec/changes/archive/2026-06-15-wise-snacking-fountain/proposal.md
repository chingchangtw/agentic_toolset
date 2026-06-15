## Why

`src/skills/ts-deliver-router/SKILL.md` currently keeps runtime routing concise, but missing reference material from the secondary variant forces ad-hoc decisions during proposal/apply work. This change captures those missing contracts as lazy-loaded references so behavior guidance is complete without inflating the core router document.

## What Changes

- Add a structured backfill package under `src/skills/ts-deliver-router/references/` for project registry modeling, command flows, sub-agent specs, phase-exit contracts, expanded gate checklists, setup-gap guidance, ACPL integration, GitHub MCP traceability, and workspace contract.
- Extend `src/skills/ts-deliver-router/SKILL.md` with minimal LOAD INDEX and pointer lines so new references are discoverable through existing primitives.
- Add targeted updates in existing module docs where cross-links are required (`modules/security-gates.md`, `modules/phases.md`, and relevant `modules/registry/registry-<phase>.md` files) while preserving current spine and primitive semantics.
- Keep Atlassian Rovo/Jira-Confluence traceability out of scope to align with current PRIMARY routing boundaries.

## Capabilities

### New Capabilities

- `ts-deliver-router-secondary-backfill`: Backfills missing secondary guidance into PRIMARY as reference artifacts while preserving core router structure and primitive model.

### Modified Capabilities

(none)

## Impact

- Affected specs: `ts-deliver-router-secondary-backfill` (new)
- Affected code:
  - New:
    - `src/skills/ts-deliver-router/references/project-registry.md`
    - `src/skills/ts-deliver-router/references/registry-schema.md`
    - `src/skills/ts-deliver-router/references/commands.md`
    - `src/skills/ts-deliver-router/references/sub-agents.md`
    - `src/skills/ts-deliver-router/references/phase-exit-contracts.md`
    - `src/skills/ts-deliver-router/references/gate-checklists.md`
    - `src/skills/ts-deliver-router/references/setup-gaps.md`
    - `src/skills/ts-deliver-router/references/acpl-integration.md`
    - `src/skills/ts-deliver-router/references/github-mcp.md`
    - `src/skills/ts-deliver-router/references/workspace.md`
    - `openspec/changes/wise-snacking-fountain/specs/ts-deliver-router-secondary-backfill/spec.md`
  - Modified:
    - `src/skills/ts-deliver-router/SKILL.md`
    - `src/skills/ts-deliver-router/modules/security-gates.md`
    - `src/skills/ts-deliver-router/modules/phases.md`
    - `src/skills/ts-deliver-router/modules/state.md`
    - `src/skills/ts-deliver-router/modules/registry/registry-think.md`
    - `src/skills/ts-deliver-router/modules/registry/registry-plan.md`
    - `src/skills/ts-deliver-router/modules/registry/registry-build.md`
    - `src/skills/ts-deliver-router/modules/registry/registry-review.md`
    - `src/skills/ts-deliver-router/modules/registry/registry-test.md`
    - `src/skills/ts-deliver-router/modules/registry/registry-ship.md`
  - Removed:
    - (none)
