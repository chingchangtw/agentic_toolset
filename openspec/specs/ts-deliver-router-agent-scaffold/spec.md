# ts-deliver-router-agent-scaffold Specification

## Purpose

TBD - created by archiving change 'fix-ts-slash-command-system'. Update Purpose after archive.

## Requirements

### Requirement: registry.json schema SHALL include agent_scaffold extension field

`src/skills/ts-deliver-router/SKILL.md` PRIMITIVE 3 (registry.json schema definition) SHALL include
an `extensions` object with field `agent_scaffold` defaulting to `false`. A conditional load
instruction SHALL immediately follow: "If `extensions.agent_scaffold = true`, load
`references/agent-scaffold.md` before executing any phase." When `agent_scaffold` is `false`
(default), the reference file is never loaded and contributes zero token cost.

#### Scenario: Default registry.json omits agent_scaffold load

- **WHEN** a project's `registry.json` does not include `extensions.agent_scaffold` or sets it to `false`
- **THEN** the model SHALL NOT load `references/agent-scaffold.md` and SHALL proceed with normal phase execution

#### Scenario: Enabled registry.json triggers agent_scaffold load

- **WHEN** a project's `registry.json` contains `"extensions": { "agent_scaffold": true }`
- **THEN** the model SHALL load `references/agent-scaffold.md` before executing any `/ts-deliver` phase


<!-- @trace
source: fix-ts-slash-command-system
updated: 2026-06-18
code:
  - .agents/skills/caveman-compress/scripts/__pycache__/__main__.cpython-314.pyc
  - .agents/skills/caveman-compress/scripts/__pycache__/detect.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/registry-schema.md
  - src/skills/ts-project-planner/references/work-unit-profiles.md
  - src/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-project-planner/SKILL.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__init__.cpython-314.pyc
  - src/skills/ts-project-planner/references/commands.md
  - src/skills/ts-deliver-router/PROJECT_SETUP.md
  - src/skills/ts-deliver-router/rawfiles/references/sub-agents.md
  - src/skills/ts-project-planner/raw/references/commands.md
  - .agents/skills/caveman-compress/scripts/__pycache__/cli.cpython-314.pyc
  - src/skills/ts-deliver-router/SKILL.original.md
  - src/skills/ts-project-planner/raw/SKILL.md
  - src/skills/ts-deliver-router/references/registry-schema.md
  - src/skills/ts-deliver-router/references/workspace.md
  - src/skills/ts-deliver-router/rawfiles/references/setup-gaps.md
  - src/skills/ts-project-planner/raw/references/router-integration.md
  - .agents/skills/caveman-compress/scripts/__pycache__/compress.cpython-314.pyc
  - src/skills/ts-deliver-router/references/setup-gaps.md
  - src/skills/ts-project-planner/README.md
  - src/skills/ts-deliver-router/references/commands.md
  - src/skills/ts-project-planner/references/iteration-schema.md
  - src/skills/ts-project-planner/references/router-integration.md
  - docs/agent-scaffold-proposal.md
  - .agents/skills/caveman-compress/scripts/__pycache__/validate.cpython-314.pyc
  - src/skills/ts-deliver-router/references/agent-scaffold.md
  - src/skills/ts-project-planner/raw/references/work-unit-profiles.md
  - src/skills/ts-deliver-router/rawfiles/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-project-planner/raw/references/iteration-schema.md
  - src/skills/ts-deliver-router/references/sub-agents.md
-->

---
### Requirement: /ts-deliver init interview SHALL ask about muscle agents

During the `/ts-deliver init` setup interview, the model SHALL ask: "Muscle agents? (copilot / codex / antigravity / none)". If the user names one or more agents (not "none"), the model SHALL set `extensions.agent_scaffold: true` in `registry.json` and load `references/agent-scaffold.md` to generate the initial `.agent/` scaffold.

#### Scenario: Init with named muscle agent enables scaffold

- **WHEN** user answers the muscle-agent interview question with "copilot" or any named agent
- **THEN** `registry.json` SHALL have `"extensions": { "agent_scaffold": true }` and the initial `.agent/` directories SHALL be generated

#### Scenario: Init with "none" leaves scaffold disabled

- **WHEN** user answers the muscle-agent interview question with "none"
- **THEN** `registry.json` SHALL have `"extensions": { "agent_scaffold": false }` and no `.agent/` directories SHALL be created


<!-- @trace
source: fix-ts-slash-command-system
updated: 2026-06-18
code:
  - .agents/skills/caveman-compress/scripts/__pycache__/__main__.cpython-314.pyc
  - .agents/skills/caveman-compress/scripts/__pycache__/detect.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/registry-schema.md
  - src/skills/ts-project-planner/references/work-unit-profiles.md
  - src/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-project-planner/SKILL.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__init__.cpython-314.pyc
  - src/skills/ts-project-planner/references/commands.md
  - src/skills/ts-deliver-router/PROJECT_SETUP.md
  - src/skills/ts-deliver-router/rawfiles/references/sub-agents.md
  - src/skills/ts-project-planner/raw/references/commands.md
  - .agents/skills/caveman-compress/scripts/__pycache__/cli.cpython-314.pyc
  - src/skills/ts-deliver-router/SKILL.original.md
  - src/skills/ts-project-planner/raw/SKILL.md
  - src/skills/ts-deliver-router/references/registry-schema.md
  - src/skills/ts-deliver-router/references/workspace.md
  - src/skills/ts-deliver-router/rawfiles/references/setup-gaps.md
  - src/skills/ts-project-planner/raw/references/router-integration.md
  - .agents/skills/caveman-compress/scripts/__pycache__/compress.cpython-314.pyc
  - src/skills/ts-deliver-router/references/setup-gaps.md
  - src/skills/ts-project-planner/README.md
  - src/skills/ts-deliver-router/references/commands.md
  - src/skills/ts-project-planner/references/iteration-schema.md
  - src/skills/ts-project-planner/references/router-integration.md
  - docs/agent-scaffold-proposal.md
  - .agents/skills/caveman-compress/scripts/__pycache__/validate.cpython-314.pyc
  - src/skills/ts-deliver-router/references/agent-scaffold.md
  - src/skills/ts-project-planner/raw/references/work-unit-profiles.md
  - src/skills/ts-deliver-router/rawfiles/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-project-planner/raw/references/iteration-schema.md
  - src/skills/ts-deliver-router/references/sub-agents.md
-->

---
### Requirement: /ts-deliver refine SHALL detect agent entries and prompt

When `/ts-deliver refine` detects new `type="agent"` entries in `registry.json → collection[]` that do not have a corresponding `.agent/<id>/` directory, the model SHALL prompt: "Enable agent scaffold? Y/N". If the user confirms, the model SHALL set `extensions.agent_scaffold: true` and generate the missing `.agent/<id>/` directories.

#### Scenario: Refine detects new agent entry

- **WHEN** `/ts-deliver refine` finds `type="agent"` in `collection[]` and `agent_scaffold` is currently `false`
- **THEN** model SHALL prompt the user to enable agent scaffold before completing refine


<!-- @trace
source: fix-ts-slash-command-system
updated: 2026-06-18
code:
  - .agents/skills/caveman-compress/scripts/__pycache__/__main__.cpython-314.pyc
  - .agents/skills/caveman-compress/scripts/__pycache__/detect.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/registry-schema.md
  - src/skills/ts-project-planner/references/work-unit-profiles.md
  - src/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-project-planner/SKILL.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__init__.cpython-314.pyc
  - src/skills/ts-project-planner/references/commands.md
  - src/skills/ts-deliver-router/PROJECT_SETUP.md
  - src/skills/ts-deliver-router/rawfiles/references/sub-agents.md
  - src/skills/ts-project-planner/raw/references/commands.md
  - .agents/skills/caveman-compress/scripts/__pycache__/cli.cpython-314.pyc
  - src/skills/ts-deliver-router/SKILL.original.md
  - src/skills/ts-project-planner/raw/SKILL.md
  - src/skills/ts-deliver-router/references/registry-schema.md
  - src/skills/ts-deliver-router/references/workspace.md
  - src/skills/ts-deliver-router/rawfiles/references/setup-gaps.md
  - src/skills/ts-project-planner/raw/references/router-integration.md
  - .agents/skills/caveman-compress/scripts/__pycache__/compress.cpython-314.pyc
  - src/skills/ts-deliver-router/references/setup-gaps.md
  - src/skills/ts-project-planner/README.md
  - src/skills/ts-deliver-router/references/commands.md
  - src/skills/ts-project-planner/references/iteration-schema.md
  - src/skills/ts-project-planner/references/router-integration.md
  - docs/agent-scaffold-proposal.md
  - .agents/skills/caveman-compress/scripts/__pycache__/validate.cpython-314.pyc
  - src/skills/ts-deliver-router/references/agent-scaffold.md
  - src/skills/ts-project-planner/raw/references/work-unit-profiles.md
  - src/skills/ts-deliver-router/rawfiles/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-project-planner/raw/references/iteration-schema.md
  - src/skills/ts-deliver-router/references/sub-agents.md
-->

---
### Requirement: references/agent-scaffold.md SHALL define the muscle agent handoff contract

`src/skills/ts-deliver-router/references/agent-scaffold.md` SHALL be created and SHALL specify:

1. **Activation**: loaded when `extensions.agent_scaffold = true`; triggered by `/ts-deliver init` (first scaffold) and `/ts-deliver refine` (diff-aware regeneration)
2. **Write rules**: read `registry.json → collection[]` where `type = "agent"` and `tier = "active" | "optional"`; for each agent write `.agent/<id>/AGENTS.md` and `.agent/<id>/capabilities.md`; write `.agent/_registry.json`; on refine diff against previous `_registry.json` and only rewrite changed agents; on `tier → "retired"` delete `.agent/<id>/` and confirm aloud
3. **`.agent/_registry.json` schema**: fields `generated` (ISO date), `source`, and `agents[]` array with `id`, `cli`, `dial` (HIGH|MID|LOW), `tier`, and `phases[]`
4. **`AGENTS.md` template**: project, generated date, source, allowed phases, and task stubs with trigger/CLI/input/output/on-failure fields
5. **`capabilities.md` template**: scope (readable/writable paths), off-limits paths, DIAL level description, and escalation conditions
6. **Lifecycle events**: `/ts-deliver init` → first scaffold; `/ts-deliver refine` → diff-aware regeneration; `tier → retired` → delete `.agent/<id>/`; DIAL change → update `_registry.json` only; `agent_scaffold` flipped to `false` → `.agent/` left on disk, no further writes
7. **Escalation invariant**: muscle agents SHALL never make gate decisions; any task tagged `BLOCK_EXIT` or `ESCALATE` pauses and returns control to Claude Code before phase exit

#### Scenario: First scaffold generates correct directory structure

- **WHEN** `/ts-deliver init` completes with one active agent entry (e.g., `id="copilot"`)
- **THEN** `.agent/copilot/AGENTS.md`, `.agent/copilot/capabilities.md`, and `.agent/_registry.json` SHALL exist with content matching the templates in `agent-scaffold.md`

#### Scenario: Refine is diff-aware

- **WHEN** `/ts-deliver refine` runs and `collection[]` has not changed agent entries
- **THEN** the model SHALL NOT rewrite any `.agent/<id>/` files and SHALL report "No agent scaffold changes"

#### Scenario: Retired agent removes directory

- **WHEN** an agent entry's `tier` changes to `"retired"` and `/ts-deliver refine` runs
- **THEN** `.agent/<id>/` directory SHALL be deleted and the model SHALL confirm aloud


<!-- @trace
source: fix-ts-slash-command-system
updated: 2026-06-18
code:
  - .agents/skills/caveman-compress/scripts/__pycache__/__main__.cpython-314.pyc
  - .agents/skills/caveman-compress/scripts/__pycache__/detect.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/registry-schema.md
  - src/skills/ts-project-planner/references/work-unit-profiles.md
  - src/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-project-planner/SKILL.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__init__.cpython-314.pyc
  - src/skills/ts-project-planner/references/commands.md
  - src/skills/ts-deliver-router/PROJECT_SETUP.md
  - src/skills/ts-deliver-router/rawfiles/references/sub-agents.md
  - src/skills/ts-project-planner/raw/references/commands.md
  - .agents/skills/caveman-compress/scripts/__pycache__/cli.cpython-314.pyc
  - src/skills/ts-deliver-router/SKILL.original.md
  - src/skills/ts-project-planner/raw/SKILL.md
  - src/skills/ts-deliver-router/references/registry-schema.md
  - src/skills/ts-deliver-router/references/workspace.md
  - src/skills/ts-deliver-router/rawfiles/references/setup-gaps.md
  - src/skills/ts-project-planner/raw/references/router-integration.md
  - .agents/skills/caveman-compress/scripts/__pycache__/compress.cpython-314.pyc
  - src/skills/ts-deliver-router/references/setup-gaps.md
  - src/skills/ts-project-planner/README.md
  - src/skills/ts-deliver-router/references/commands.md
  - src/skills/ts-project-planner/references/iteration-schema.md
  - src/skills/ts-project-planner/references/router-integration.md
  - docs/agent-scaffold-proposal.md
  - .agents/skills/caveman-compress/scripts/__pycache__/validate.cpython-314.pyc
  - src/skills/ts-deliver-router/references/agent-scaffold.md
  - src/skills/ts-project-planner/raw/references/work-unit-profiles.md
  - src/skills/ts-deliver-router/rawfiles/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-project-planner/raw/references/iteration-schema.md
  - src/skills/ts-deliver-router/references/sub-agents.md
-->

---
### Requirement: workspace.md SHALL document .agent/ as shared handoff directory

`src/skills/ts-deliver-router/references/workspace.md` SHALL be updated to document `.agent/` as a shared handoff directory: orchestrator writes it, muscle agents read it. The documentation SHALL clarify that `.agent/` is analogous to `.ai/` (shared state) while `.claude/` remains Claude Code's private namespace. `.agent/` SHALL NOT be checked into the skill source repo — it is a runtime artifact generated per project.

#### Scenario: workspace.md contains .agent/ entry

- **WHEN** a developer reads `src/skills/ts-deliver-router/references/workspace.md`
- **THEN** the `.agent/` directory SHALL appear in the workspace layout with its purpose, owner (ts-deliver-router orchestrator), and consumer (muscle agents) documented

<!-- @trace
source: fix-ts-slash-command-system
updated: 2026-06-18
code:
  - .agents/skills/caveman-compress/scripts/__pycache__/__main__.cpython-314.pyc
  - .agents/skills/caveman-compress/scripts/__pycache__/detect.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/registry-schema.md
  - src/skills/ts-project-planner/references/work-unit-profiles.md
  - src/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-project-planner/SKILL.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__init__.cpython-314.pyc
  - src/skills/ts-project-planner/references/commands.md
  - src/skills/ts-deliver-router/PROJECT_SETUP.md
  - src/skills/ts-deliver-router/rawfiles/references/sub-agents.md
  - src/skills/ts-project-planner/raw/references/commands.md
  - .agents/skills/caveman-compress/scripts/__pycache__/cli.cpython-314.pyc
  - src/skills/ts-deliver-router/SKILL.original.md
  - src/skills/ts-project-planner/raw/SKILL.md
  - src/skills/ts-deliver-router/references/registry-schema.md
  - src/skills/ts-deliver-router/references/workspace.md
  - src/skills/ts-deliver-router/rawfiles/references/setup-gaps.md
  - src/skills/ts-project-planner/raw/references/router-integration.md
  - .agents/skills/caveman-compress/scripts/__pycache__/compress.cpython-314.pyc
  - src/skills/ts-deliver-router/references/setup-gaps.md
  - src/skills/ts-project-planner/README.md
  - src/skills/ts-deliver-router/references/commands.md
  - src/skills/ts-project-planner/references/iteration-schema.md
  - src/skills/ts-project-planner/references/router-integration.md
  - docs/agent-scaffold-proposal.md
  - .agents/skills/caveman-compress/scripts/__pycache__/validate.cpython-314.pyc
  - src/skills/ts-deliver-router/references/agent-scaffold.md
  - src/skills/ts-project-planner/raw/references/work-unit-profiles.md
  - src/skills/ts-deliver-router/rawfiles/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-project-planner/raw/references/iteration-schema.md
  - src/skills/ts-deliver-router/references/sub-agents.md
-->