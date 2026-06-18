## ADDED Requirements

### Requirement: ts-deliver-router command prefix SHALL be /ts-deliver
The ts-deliver-router skill's user-facing command prefix SHALL be `/ts-deliver` (not `/ts-router`).
All references to `/ts-router init`, `/ts-router refine`, and `/ts-router status` in skill files
SHALL be updated to `/ts-deliver init`, `/ts-deliver refine`, and `/ts-deliver status` respectively.
The skill name `ts-deliver-router`, directory paths, and state path `.ai/ts-deliver-router/` are NOT renamed.

#### Scenario: Quick reference uses /ts-deliver prefix

- **WHEN** a user reads the Quick Reference or Architecture section of ts-deliver-router SKILL.md
- **THEN** all command examples SHALL use `/ts-deliver:init`, `/ts-deliver:refine`, `/ts-deliver:status` (no occurrences of `/ts-router`)

#### Scenario: ts-project-planner integration references use /ts-deliver

- **WHEN** a user reads Layer 2 in ts-project-planner SKILL.md or router-integration.md
- **THEN** references to the ts-deliver-router command SHALL show `/ts-deliver:init` and `/ts-deliver:refine`

#### Scenario: No residual /ts-router occurrences in skill files

- **WHEN** a developer runs `grep -r "/ts-router " src/skills/ .agents/skills/`
- **THEN** the command SHALL return zero matches
