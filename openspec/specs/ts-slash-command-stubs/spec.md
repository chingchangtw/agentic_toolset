# ts-slash-command-stubs Specification

## Purpose

TBD - created by archiving change 'fix-ts-slash-command-system'. Update Purpose after archive.

## Requirements

### Requirement: ts-deliver-router SKILL.md SHALL self-provision command stubs on first project use

`src/skills/ts-deliver-router/SKILL.md` SHALL contain an `## On First Use` section. When the model
loads this skill and detects that `.claude/commands/ts-deliver/` does not exist in the current
project, the model SHALL create the following stub files before proceeding with the user's request:
`.claude/commands/ts-deliver/init.md`, `.claude/commands/ts-deliver/refine.md`,
`.claude/commands/ts-deliver/status.md`. Each stub file SHALL follow the two-line format: line 1
identifies the skill and instructs loading `src/skills/ts-deliver-router/SKILL.md`; line 2 declares
the sub-command with `$ARGUMENTS` placeholder. On subsequent invocations where the directory exists,
the model SHALL skip stub creation and proceed immediately.

#### Scenario: First invocation creates ts-deliver stubs

- **WHEN** ts-deliver-router skill is loaded in a project where `.claude/commands/ts-deliver/` does not exist
- **THEN** the model SHALL create `.claude/commands/ts-deliver/init.md`, `refine.md`, and `status.md` before executing the user's request

##### Example: stub file content for init

| Line | Content |
|------|---------|
| 1 | `You are operating as the ts-deliver-router skill. Load and follow src/skills/ts-deliver-router/SKILL.md before proceeding.` |
| 2 | `Sub-command: /ts-deliver init $ARGUMENTS` |

#### Scenario: Subsequent invocation skips stub creation

- **WHEN** ts-deliver-router skill is loaded in a project where `.claude/commands/ts-deliver/` already exists
- **THEN** the model SHALL NOT recreate or overwrite existing stub files and SHALL proceed immediately with the user's request


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
### Requirement: ts-project-planner SKILL.md SHALL self-provision command stubs on first project use

`src/skills/ts-project-planner/SKILL.md` SHALL contain an `## On First Use` section. When the
model loads this skill and detects that `.claude/commands/ts-iteration/` does not exist in the
current project, the model SHALL create 11 stub files before proceeding: 3 under
`.claude/commands/ts-iteration/` (start, next, close), 5 under `.claude/commands/ts-discover/`
(idea, explore, validate, decide, status), and 3 under `.claude/commands/ts-project/` (plan,
status, refine). Each stub file SHALL follow the two-line format: line 1 identifies ts-project-planner
and instructs loading `src/skills/ts-project-planner/SKILL.md`; line 2 declares the sub-command
with `$ARGUMENTS` placeholder.

#### Scenario: First invocation creates ts-project-planner stubs

- **WHEN** ts-project-planner skill is loaded in a project where `.claude/commands/ts-iteration/` does not exist
- **THEN** the model SHALL create all 11 stub files across ts-iteration, ts-discover, and ts-project command directories before executing the user's request

##### Example: stub file content for ts-iteration/start

| Line | Content |
|------|---------|
| 1 | `You are operating as the ts-project-planner skill. Load and follow src/skills/ts-project-planner/SKILL.md before proceeding.` |
| 2 | `Sub-command: /ts-iteration start $ARGUMENTS` |

#### Scenario: Subsequent invocation skips stub creation

- **WHEN** ts-project-planner skill is loaded in a project where `.claude/commands/ts-iteration/` already exists
- **THEN** the model SHALL NOT recreate stub files and SHALL proceed immediately with the user's request


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
### Requirement: SKILL.md architecture sections SHALL reference the new invocation syntax

Each SKILL.md that documents ts-* command prefixes SHALL show the `:` separator syntax
(e.g., `/ts-deliver:init`, `/ts-iteration:start`) so users know how to invoke commands from Claude Code.

#### Scenario: Architecture diagram uses colon syntax

- **WHEN** a user reads the Architecture section of ts-deliver-router or ts-project-planner SKILL.md
- **THEN** command examples SHALL use the form `/prefix:subcommand` rather than `/prefix subcommand`

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