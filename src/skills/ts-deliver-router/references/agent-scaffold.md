# Agent Scaffold Reference

Instructs the orchestrator to generate `.agent/<id>/` directories containing task
contracts and capability declarations for each active muscle agent.

## Activation

```json
"extensions": { "agent_scaffold": true }
```

Triggered by:
- `/ts-deliver:init` — first-time scaffold
- `/ts-deliver:refine` — regenerate on `collection[]` change (diff-aware)

## Write Rules

1. Read `registry.json → collection[]` where `type = "agent"`
2. Filter `tier = "active" | "optional"`
3. For each agent: write `.agent/<id>/AGENTS.md` + `capabilities.md`
4. Write `.agent/_registry.json`
5. On refine: diff against previous `_registry.json`; only rewrite changed agents. Print diff summary.
6. On `tier → "retired"`: delete `.agent/<id>/` and confirm aloud.

## `.agent/_registry.json` Schema

```json
{
  "generated": "<ISO date>",
  "source": ".ai/ts-deliver-router/registry.json",
  "agents": [
    {
      "id": "copilot | codex | antigravity",
      "cli": "<invocation string>",
      "dial": "HIGH | MID | LOW",
      "tier": "active | optional",
      "phases": ["Build", "Ship"]
    }
  ]
}
```

## `AGENTS.md` Template

```markdown
# <agent-id> — Task Contract
Project:   <project>
Generated: <ISO date>
Source:    .agent/_registry.json

## Allowed phases
<phases from registry>

## Tasks

### <phase>:<task-id>
Trigger:    CHECKS.<phase>.<check-id> (<type>)
CLI:        <full invocation with <placeholders>>
Input:      <what orchestrator passes>
Output:     <what orchestrator expects back>
On failure: BLOCK_EXIT | LOG_ONLY | ESCALATE
```

## `capabilities.md` Template

```markdown
# <agent-id> — Capabilities
Scope:      <readable/writable paths>
Off-limits: <paths agent must never touch>
DIAL:       <level> — <one-line behaviour description>
Escalate when:
  - <condition 1>
  - <condition 2>
```

## Lifecycle

| Event | Action |
|---|---|
| `/ts-deliver:init` | First scaffold from registry |
| `/ts-deliver:refine` | Diff-aware regeneration |
| `tier → retired` | Delete `.agent/<id>/`, confirm aloud |
| DIAL change | Update `_registry.json → agents[].dial` only |
| Phase entered | Orchestrator reads relevant task block |
| `agent_scaffold` flipped `false` | `.agent/` left on disk; no further writes |

## Escalation Invariant

Muscle agents never make gate decisions. Any task tagged `BLOCK_EXIT` or
`ESCALATE` pauses and returns control to Claude Code before phase exit is
allowed. DIAL is per-agent convenience only — never a gate bypass.
