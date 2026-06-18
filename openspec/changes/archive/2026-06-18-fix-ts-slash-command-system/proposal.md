## Why

The ts-deliver-router skill documents `/ts-router init|refine|status` internally but the skill is named `ts-deliver-router`, creating a naming mismatch. More broadly, all ts-* skills document slash command prefixes (`/ts-iteration`, `/ts-discover`, `/ts-project`, `/ts-router`) that have no Claude Code harness backing — users cannot invoke them as real slash commands. Additionally, muscle agents (Copilot CLI, Codex CLI, Antigravity CLI) have no equivalent of Claude Code's slash command system and need a version-controlled handoff layer. This change fixes the naming inconsistency, makes each skill self-provisioning for its command stubs, and adds an optional agent scaffold extension to ts-deliver-router so muscle agents can consume task contracts.

## What Changes

- **BREAKING (rename)**: `/ts-router` command prefix renamed to `/ts-deliver` in `src/skills/ts-deliver-router/` SKILL.md and reference files
- `src/skills/ts-deliver-router/SKILL.md` gains a first-use initialization section: on first invocation in a project (detected by absence of `.claude/commands/ts-deliver/`), the skill instructs the model to create stub files for `/ts-deliver:init`, `/ts-deliver:refine`, `/ts-deliver:status`
- `src/skills/ts-project-planner/SKILL.md` gains a first-use initialization section: on first invocation in a project (detected by absence of `.claude/commands/ts-iteration/`), the skill instructs the model to create 11 stub files covering `/ts-iteration:*`, `/ts-discover:*`, `/ts-project:*`
- SKILL.md Architecture sections updated to show `:` invocation syntax
- `src/skills/ts-deliver-router/SKILL.md` PRIMITIVE 3 gains `extensions.agent_scaffold: false` field and a conditional load instruction: if `agent_scaffold = true`, load `references/agent-scaffold.md` before executing any phase
- New `src/skills/ts-deliver-router/references/agent-scaffold.md` specifies write rules, `.agent/` directory schema, AGENTS.md and capabilities.md templates, and lifecycle events for muscle agent handoff
- `/ts-deliver init` interview gains a muscle-agent question; `/ts-deliver refine` gains detection of `type="agent"` entries in `collection[]` to prompt enabling the scaffold
- `src/skills/ts-deliver-router/references/workspace.md` updated to document `.agent/` as a shared handoff directory (orchestrator writes, muscles read)

## Non-Goals

- No changes to skill names or directory names (`ts-deliver-router`, `ts-project-planner` stay)
- No pre-baked `.claude/commands/` stub files created as part of this change — stubs are created by skills at first use
- No changes to `.agents/` files (skill source mirrors)
- No changes to SKILL.md behavioral logic, phase spine, registry, or security gates beyond PRIMITIVE 3 extension field and conditional load
- Agent scaffold is opt-in (`agent_scaffold: false` by default) — projects without muscle agents pay zero token cost

## Capabilities

### New Capabilities

- `ts-slash-command-stubs`: First-use initialization behavior added to each SKILL.md; each skill self-provisions its `.claude/commands/` stub files on first project invocation
- `ts-deliver-router-agent-scaffold`: Optional extension in ts-deliver-router for muscle agent handoff; activates via `extensions.agent_scaffold: true` in registry.json; generates `.agent/<id>/` directories with task contracts and capability declarations

### Modified Capabilities

- `ts-deliver-router-secondary-backfill`: Command prefix in ts-deliver-router SKILL.md and `src/skills/ts-deliver-router/references/` changes from `/ts-router` to `/ts-deliver`

## Impact

- Affected specs: `ts-slash-command-stubs` (new), `ts-deliver-router-agent-scaffold` (new), `ts-deliver-router-secondary-backfill` (delta — command rename)
- Affected code:
  - New: `src/skills/ts-deliver-router/references/agent-scaffold.md`
  - Modified: `src/skills/ts-deliver-router/SKILL.md`, `src/skills/ts-deliver-router/references/commands.md`, `src/skills/ts-deliver-router/references/workspace.md`, `src/skills/ts-project-planner/SKILL.md`, `src/skills/ts-project-planner/references/router-integration.md`
