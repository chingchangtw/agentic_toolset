## Problem

`registry.json`'s `collection[]` entries use a single `type="agent"` enum value for
two unrelated concepts: (1) muscle CLI agents (copilot/codex/antigravity) that
`references/agent-scaffold.md` generates `.agent/<id>/` handoff files for, and
(2) Claude Code sub-agents (`ts-event-storming-facilitator`, `ts-spec-validator`,
`ts-ddd-tactical-validator`, `ts-mutation-analyst`) defined in
`references/sub-agents.md` as `.claude/agents/<id>.md` prompt files with a
role/trigger/input/output/handoff contract — not CLI tools with an invocation
string. Both currently satisfy the same `type="agent"` filter that
`/ts-deliver refine`'s scaffold-detection trigger (`commands.md`) and
`agent-scaffold.md`'s write rules (`collection[] where type="agent"`) both key on.

`registry-schema.md`'s own reference example bakes this collision in: its sample
`registry.log` entry moves `"ts-event-storming-facilitator"` through a
`tier: pending-setup → active` refinement exactly like any muscle agent would,
with no distinguishing field. This is not a one-off misuse of the schema — the
schema's own documentation conflates the two categories.

## Root Cause

`ts-deliver-router-agent-scaffold`'s spec (openspec/specs/ts-deliver-router-agent-scaffold/spec.md)
defines the `/ts-deliver refine` trigger as "detects new `type="agent"` entries in
`collection[]`" without qualifying that only muscle CLI agents should trigger
scaffold generation. `agent-scaffold.md`'s write rules read the same unqualified
filter (`type = "agent"` AND `tier = "active" | "optional"`). Nothing in the type
enum, the trigger condition, or the write rules distinguishes "muscle CLI agent
that gets a `.agent/<id>/` directory with a `cli:` invocation" from "Claude Code
sub-agent that gets a `.claude/agents/<id>.md` prompt file" — despite these being
built by entirely different mechanisms (`agent-scaffold.md` vs `sub-agents.md`).

Surfaced concretely in this project's own `registry.json`: 4 sub-agent entries
(`ts-event-storming-facilitator`, `ts-spec-validator`, `ts-ddd-tactical-validator`,
`ts-mutation-analyst`) sit in `collection[]` with `type="agent"`, `agent_scaffold`
is `false`, and zero `.agent/<id>/` directories exist on disk — so the refine
trigger has never actually fired in practice, but would misfire (generate
muscle-agent-shaped files for a sub-agent id) the first time it does.

## Proposed Solution

Split the overloaded `type="agent"` enum value into two distinct values. The
first, `muscle-agent`, denotes CLI tools (copilot/codex/antigravity) that
`agent-scaffold.md` generates `.agent/<id>/` handoff files for. The second,
`subagent`, denotes Claude Code sub-agents built via `sub-agents.md`'s
`.claude/agents/<id>.md` prompt-file contract.

Update:
1. `registry-schema.md`'s `collection[].type` enum: `skill` / `plugin` / `mcp` /
   `muscle-agent` / `subagent` (replacing the single `agent` value). Fix the
   `registry.log` example so `ts-event-storming-facilitator` entries use
   `"tool"` semantics consistent with a `subagent`, not implying scaffold
   generation.
2. `commands.md`'s `/ts-deliver refine` agent-scaffold-detection trigger: scope
   explicitly to `type="muscle-agent"` entries only.
3. `agent-scaffold.md`'s write rules step 1: filter `collection[] where
   type = "muscle-agent"` (not `type = "agent"`).
4. `ts-deliver-router-agent-scaffold` capability spec: update the three
   requirements referencing `type="agent"` to `type="muscle-agent"`, and add a
   new requirement clarifying that `type="subagent"` entries never trigger
   `agent-scaffold.md`'s write path — they are built via `sub-agents.md`
   instead, with no automated scaffold-detection trigger (sub-agent build specs
   are authored manually, not generated).
5. This project's own `registry.json`: migrate the 4 existing sub-agent entries
   from `type="agent"` to `type="subagent"`.

## Non-Goals

- Building the 4 pending-setup sub-agents themselves (`ts-event-storming-facilitator`
  etc.) — out of scope, tracked separately as `pending-setup` tier entries.
- Adding a new automated scaffold/generation mechanism for `subagent`-type
  entries — sub-agent build specs remain manually authored per `sub-agents.md`;
  this change only stops the type collision from misfiring, it does not add
  new automation.
- Any change to muscle-agent scaffold behavior itself (`agent-scaffold.md`'s
  actual file-generation logic) — only the filter/type-tag distinguishing
  which entries qualify for it changes.

## Capabilities

### Modified Capabilities

- `ts-deliver-router-agent-scaffold`: the agent-type filter used by the
  `/ts-deliver refine` scaffold-detection trigger and `agent-scaffold.md`'s
  write rules is narrowed to muscle CLI agents only, and a new requirement is
  added clarifying sub-agent entries never trigger scaffold generation.

## Impact

- Affected specs: `ts-deliver-router-agent-scaffold` (modified)
- Affected code:
  - Modified: `src/skills/ts-deliver-router/references/registry-schema.md`,
    `src/skills/ts-deliver-router/references/commands.md`,
    `src/skills/ts-deliver-router/references/agent-scaffold.md`,
    `.agents/ts-deliver-router/registry.json`
  - New: (none)
  - Removed: (none)
