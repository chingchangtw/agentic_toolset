## ADDED Requirements

### Requirement: registry.json collection[].type SHALL distinguish muscle-agent from subagent

`registry-schema.md`'s `collection[].type` enum SHALL list `skill` / `plugin` /
`mcp` / `muscle-agent` / `subagent` as valid values. `agent` SHALL NOT appear
as a valid value. `muscle-agent` SHALL denote CLI tools (copilot/codex/antigravity)
eligible for `agent-scaffold.md`'s generated `.agent/<id>/` handoff files.
`subagent` SHALL denote Claude Code sub-agents built manually via
`sub-agents.md`'s `.claude/agents/<id>.md` prompt-file contract.

#### Scenario: Schema table lists both values

- **WHEN** a developer reads `registry-schema.md`'s `collection[]` entry field table
- **THEN** the `type` row SHALL list `muscle-agent` and `subagent` as distinct enum
  values, and SHALL NOT list a bare `agent` value

#### Scenario: Reference example reflects the split

- **WHEN** a developer reads `registry-schema.md`'s example `registry.json` or
  `registry.log`
- **THEN** any sub-agent entry (e.g. `ts-event-storming-facilitator`) SHALL be
  shown with `"type": "subagent"`, not `"type": "agent"`

### Requirement: type="subagent" entries SHALL NOT trigger agent-scaffold.md

`collection[]` entries with `type="subagent"` SHALL NOT be read by
`agent-scaffold.md`'s write rules and SHALL NOT trigger `/ts-deliver refine`'s
scaffold-detection prompt, regardless of `tier`. Sub-agent build status SHALL
continue to be tracked via `tier` (`pending-setup` until a human authors the
`.claude/agents/<id>.md` file), with no automated detection or generation.

#### Scenario: Refine ignores subagent-only registries

- **WHEN** `/ts-deliver refine` runs against a `registry.json` whose `collection[]`
  contains only `type="subagent"` entries (no `muscle-agent` entries) lacking
  `.agent/<id>/` directories
- **THEN** the model SHALL NOT prompt "Enable agent scaffold? Y/N"

#### Scenario: Subagent entry promoted to active tier still does not scaffold

- **WHEN** a `type="subagent"` entry's `tier` changes from `pending-setup` to
  `active`
- **THEN** `agent-scaffold.md`'s write rules SHALL NOT generate a
  `.agent/<id>/` directory for that entry

## MODIFIED Requirements

### Requirement: /ts-deliver refine SHALL detect agent entries and prompt

When `/ts-deliver refine` detects new `type="muscle-agent"` entries in
`registry.json → collection[]` that do not have a corresponding `.agent/<id>/`
directory, the model SHALL prompt: "Enable agent scaffold? Y/N". If the user
confirms, the model SHALL set `extensions.agent_scaffold: true` and generate
the missing `.agent/<id>/` directories. `type="subagent"` entries SHALL NOT
trigger this prompt (see the type="subagent" exclusion requirement above).

#### Scenario: Refine detects new muscle-agent entry

- **WHEN** `/ts-deliver refine` finds `type="muscle-agent"` in `collection[]`
  and `agent_scaffold` is currently `false`
- **THEN** model SHALL prompt the user to enable agent scaffold before
  completing refine

### Requirement: references/agent-scaffold.md SHALL define the muscle agent handoff contract

`src/skills/ts-deliver-router/references/agent-scaffold.md` SHALL be created and
SHALL specify:

1. **Activation**: loaded when `extensions.agent_scaffold = true`; triggered by
   `/ts-deliver init` (first scaffold) and `/ts-deliver refine` (diff-aware
   regeneration)
2. **Write rules**: read `registry.json → collection[]` where `type =
   "muscle-agent"` and `tier = "active" | "optional"`; for each agent write
   `.agent/<id>/AGENTS.md` and `.agent/<id>/capabilities.md`; write
   `.agent/_registry.json`; on refine diff against previous `_registry.json`
   and only rewrite changed agents; on `tier → "retired"` delete `.agent/<id>/`
   and confirm aloud
3. **`.agent/_registry.json` schema**: fields `generated` (ISO date), `source`,
   and `agents[]` array with `id`, `cli`, `dial` (HIGH|MID|LOW), `tier`, and
   `phases[]`
4. **`AGENTS.md` template**: project, generated date, source, allowed phases,
   and task stubs with trigger/CLI/input/output/on-failure fields
5. **`capabilities.md` template**: scope (readable/writable paths), off-limits
   paths, DIAL level description, and escalation conditions
6. **Lifecycle events**: `/ts-deliver init` → first scaffold; `/ts-deliver
   refine` → diff-aware regeneration; `tier → retired` → delete `.agent/<id>/`;
   DIAL change → update `_registry.json` only; `agent_scaffold` flipped to
   `false` → `.agent/` left on disk, no further writes
7. **Escalation invariant**: muscle agents SHALL never make gate decisions; any
   task tagged `BLOCK_EXIT` or `ESCALATE` pauses and returns control to Claude
   Code before phase exit

#### Scenario: First scaffold generates correct directory structure

- **WHEN** `/ts-deliver init` completes with one active `type="muscle-agent"`
  entry (e.g., `id="copilot"`)
- **THEN** `.agent/copilot/AGENTS.md`, `.agent/copilot/capabilities.md`, and
  `.agent/_registry.json` SHALL exist with content matching the templates in
  `agent-scaffold.md`

#### Scenario: Refine is diff-aware

- **WHEN** `/ts-deliver refine` runs and `collection[]` has not changed
  `type="muscle-agent"` entries
- **THEN** the model SHALL NOT rewrite any `.agent/<id>/` files and SHALL
  report "No agent scaffold changes"

#### Scenario: Retired agent removes directory

- **WHEN** a `type="muscle-agent"` entry's `tier` changes to `"retired"` and
  `/ts-deliver refine` runs
- **THEN** `.agent/<id>/` directory SHALL be deleted and the model SHALL
  confirm aloud
