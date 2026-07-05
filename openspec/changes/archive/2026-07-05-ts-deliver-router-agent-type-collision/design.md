## Context

`ts-deliver-router` is a Claude Code skill (prose + reference markdown files, not
compiled code) that coordinates a 7-phase delivery flow via a project-local
`registry.json`/`state.json` pair. `registry.json`'s `collection[]` array tracks
every tool/skill/agent/plugin the project uses, tagged by `type`. Two reference
files depend on that `type` tag matching cleanly: `agent-scaffold.md` (generates
`.agent/<id>/` handoff files for muscle CLI agents) and `sub-agents.md`
(documents build specs for Claude Code sub-agents, authored manually as
`.claude/agents/<id>.md`). Both currently share `type="agent"`.

This project's own `registry.json` (this repo dogfoods ts-deliver-router on
itself) has 4 `type="agent"` entries that are actually sub-agents
(`ts-event-storming-facilitator`, `ts-spec-validator`, `ts-ddd-tactical-validator`,
`ts-mutation-analyst`), none of which have ever gone through `/ts-deliver refine`'s
scaffold-detection trigger yet (`agent_scaffold` is `false`, no `.agent/` dirs
exist). The collision is latent, not yet manifested as a wrong file on disk —
this design closes the gap before it does.

## Goals / Non-Goals

**Goals:**
- Give muscle CLI agents and Claude Code sub-agents distinct `type` values so
  every reference file that filters on `type` (`agent-scaffold.md`, `refine`'s
  trigger in `commands.md`) can key on the correct one unambiguously.
- Fix `registry-schema.md`'s own reference example, which currently shows a
  sub-agent (`ts-event-storming-facilitator`) moving through scaffold-style
  tier refinement — the schema's own documentation must stop implying the
  collision is intended behavior.
- Migrate this project's `registry.json` to the corrected type so its own
  dogfood state matches the fixed spec.

**Non-Goals:**
- Building any of the 4 pending-setup sub-agents themselves.
- Adding new automation for `subagent`-type entries (e.g., an auto-scaffold
  path for `.claude/agents/*.md` files) — they stay manually authored.
- Changing `agent-scaffold.md`'s actual file-generation templates/content —
  only the filter that decides which `collection[]` entries qualify changes.

## Decisions

### Split `type="agent"` into `type="muscle-agent"` and `type="subagent"`

Two enum values replace one. `muscle-agent` = CLI tools (copilot/codex/antigravity)
with a `cli:` invocation string, eligible for `agent-scaffold.md`'s generated
`.agent/<id>/AGENTS.md` + `capabilities.md`. `subagent` = Claude Code sub-agents
built via `sub-agents.md`'s manual `.claude/agents/<id>.md` prompt-file contract,
never eligible for scaffold generation. Rejected alternative: keep one `type="agent"`
value and add a second discriminating field (e.g., `agent_kind`) — rejected because
it adds a field instead of fixing the enum, and every existing filter
(`type = "agent"`) would still need updating to check the new field anyway,
so splitting the enum is no more invasive and removes the ambiguity at its source
rather than layering a workaround on top.

### `agent-scaffold.md` write rules filter on `type="muscle-agent"` only

Step 1 of the write rules (`Read registry.json → collection[] where type = "agent"`)
becomes `type = "muscle-agent"`. This is the direct fix that stops scaffold
generation from ever misfiring on a sub-agent entry.

### `/ts-deliver refine`'s scaffold-detection trigger scoped to `type="muscle-agent"`

`commands.md`'s refine contract ("If `collection[]` contains any `type="agent"`
entry without a corresponding `.agent/<id>/` directory...") becomes
`type="muscle-agent"`. Sub-agent entries (`type="subagent"`) never trigger this
prompt — their build status is tracked via `tier` (`pending-setup` until a human
authors the `.claude/agents/<id>.md` file) but no automated detection fires.

### `registry-schema.md`'s reference example corrected

The sample `registry.log` entry currently reads:
`{ "tool": "ts-event-storming-facilitator", "field": "tier", "from": "pending-setup", "to": "active" }`
— this is left as-is structurally (tier transitions apply the same way to
subagents as any other tool), but the surrounding collection[] example and the
type enum table are updated so a reader can see `ts-event-storming-facilitator`
would carry `type: "subagent"`, not `type: "agent"`, and therefore does not
enter `agent-scaffold.md`'s write path even at `tier: "active"`.

## Implementation Contract

**Behavior observed by a developer reading these reference files or running `/ts-deliver refine`:**
- `registry-schema.md`'s `collection[].type` enum table lists `skill` / `plugin`
  / `mcp` / `muscle-agent` / `subagent` — `agent` no longer appears as a valid value.
- Running `/ts-deliver refine` on a `registry.json` containing only
  `type="subagent"` entries (no `muscle-agent` entries) does NOT prompt "Enable
  agent scaffold? Y/N" — the prompt only fires when an eligible `muscle-agent`
  entry lacks a `.agent/<id>/` directory.
- `agent-scaffold.md`'s write-rules step 1 explicitly reads
  "`type = "muscle-agent"`", not "`type = "agent"`".
- This project's `.agents/ts-deliver-router/registry.json` has all 4 existing
  sub-agent entries (`ts-event-storming-facilitator`, `ts-spec-validator`,
  `ts-ddd-tactical-validator`, `ts-mutation-analyst`) with `"type": "subagent"`.

**Interface / data shape:**
- `registry.json` `collection[].type`: enum values `"skill" | "plugin" | "mcp" |
  "muscle-agent" | "subagent"`.
- No change to any other `collection[]` field (`id`, `phase`, `tier`, `gate`,
  `threshold`, `source`, `notes` all keep their existing shape).

**Failure modes:**
- A `registry.json` still containing a bare `"type": "agent"` value (not yet
  migrated) is not a crash case — reference files simply won't match it against
  either the `muscle-agent` or `subagent` filter, so it is silently excluded
  from both scaffold generation and refine's trigger. This is an acceptable
  degrade (nothing generates incorrectly) but means un-migrated entries should
  be flagged, not silently dropped — task-level verification checks for this.

**Acceptance criteria:**
- `grep -n 'type="agent"' src/skills/ts-deliver-router/references/*.md` and
  `grep -n '"type": "agent"' .agents/ts-deliver-router/registry.json` both
  return zero matches after the change.
- `grep -n 'muscle-agent'` and `grep -n 'subagent'` each return matches in
  `registry-schema.md`, `commands.md`, and `agent-scaffold.md`.
- `openspec/specs/ts-deliver-router-agent-scaffold/spec.md`'s three
  `type="agent"`-referencing requirements read `type="muscle-agent"`, and a
  new requirement documents that `type="subagent"` entries never trigger
  `agent-scaffold.md`.

**Scope boundaries:** in scope — the type enum split across
`registry-schema.md`, `commands.md`, `agent-scaffold.md`, the
`ts-deliver-router-agent-scaffold` spec, and this project's own `registry.json`
migration. Out of scope — `sub-agents.md`'s content itself, `agent-scaffold.md`'s
templates/content, building any of the 4 pending sub-agents.

## Risks / Trade-offs

- **Enum rename is a breaking change for any other project's `registry.json`
  that already has `type="agent"` entries** — mitigated by this being an
  internal dev-tooling convention (not distributed to end users via
  `dist/release.zip`; `.agents/` and `registry.json` are per-project runtime
  state, not packaged), and by the failure mode above being a silent no-op
  rather than a crash.
- **Two enum values instead of one adds a small amount of cognitive overhead**
  when authoring new `collection[]` entries — accepted trade-off; the
  alternative (one value, ambiguous filtering) is what caused this change.
