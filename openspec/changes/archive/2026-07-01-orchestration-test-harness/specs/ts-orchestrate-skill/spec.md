## ADDED Requirements

### Requirement: ts-orchestrate SKILL.md implements passive routing logic
`src/skills/ts-orchestrate/SKILL.md` SHALL define a passive orchestrator skill that reads the `[WORKFLOW STATE]` context injected by the Epic 1 hook and determines the exact next step. It SHALL NOT re-read state files from scratch — the hook provides per-turn state.

#### Scenario: skill reads injected context (not raw state files)
- **WHEN** a developer reads ts-orchestrate/SKILL.md
- **THEN** the skill description references the `[WORKFLOW STATE]` prefix from the hook as the primary state input, not direct jq reads of state.json

### Requirement: ts-orchestrate enforces entry gate (no deliver:init without active_epic)
The skill SHALL refuse to invoke `/ts-deliver:init` unless `iteration.json.active_epic` is non-null. When active_epic is null, the skill SHALL surface the gap and direct the user to `/ts-project:plan --new`.

#### Scenario: entry gate blocks deliver:init with no active epic
- **WHEN** `[WORKFLOW STATE]` shows `active epic: none` and user asks to start delivery
- **THEN** skill responds with guidance to create an epic first, not by invoking /ts-deliver:init

### Requirement: ts-orchestrate routes by epic.type to correct phase spine
The skill SHALL read `epic.type` from iteration.json (via injected context) and route to the correct phase spine using the `getPhaseList` contract: bugfix→Think→Build→Ship, refactor→6-phase, epic→full 7-phase.

#### Scenario: bugfix routes to lean spine
- **WHEN** active epic has `type = "bugfix"` and user invokes /ts-orchestrate:next
- **THEN** skill routes to Think→Build→Ship and does NOT include Plan, Review, or Test phases

### Requirement: 3 ts-orchestrate command stubs exist as markdown files
`src/skills/ts-orchestrate/commands/start.md`, `status.md`, and `next.md` SHALL exist with content describing each command's responsibility.

#### Scenario: start command stub describes entry point
- **WHEN** a user reads commands/start.md
- **THEN** the file describes that /ts-orchestrate:start accepts work type (EPIC/REFACTOR/BUGFIX) and autonomy (HIGH/MID/LOW) and sets active_epic + dial in iteration.json

#### Scenario: status command stub describes cross-layer view
- **WHEN** a user reads commands/status.md
- **THEN** the file describes showing Discovery WIP + active epic phase in a single unified view

#### Scenario: next command stub describes enforced advancement
- **WHEN** a user reads commands/next.md
- **THEN** the file describes advancing to the next phase after the user confirms current phase work is complete
