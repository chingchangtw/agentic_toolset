# Agent Scaffold — Extension Proposal for `ts-deliver-router`

**Date:** 2026-06-18
**Status:** Approved for implementation
**Scope:** Optional extension — no change to invariant core

---

## Background

Muscle agents (Copilot CLI, Codex CLI, Antigravity CLI) have no equivalent of
Claude Code's slash command system. The orchestrator needs a version-controlled
handoff layer that these agents can consume. Inlining this as PRIMITIVE 4 in
`SKILL.md` was rejected: it would load unconditionally, violating token discipline
and the prime directive — *add rigour, never add scope*.

---

## Design Decision: Optional Extension via Reference File

Agent scaffold is opt-in. Users who have no muscle agents pay zero token cost.
The extension activates via one flag in `registry.json` and loads a single
reference file on demand.

---

## File Layout

```
~/.claude/skills/ts-deliver-router/
  SKILL.md                        ← primary (minimal change only)
  references/
    registry-schema.md            ← existing
    gate-checklists.md            ← existing
    setup-gaps.md                 ← existing
    phase-exit-contracts.md       ← existing
    sub-agents.md                 ← existing
    acpl-integration.md           ← existing
    agent-scaffold.md             ← NEW — loaded on-demand only
```

---

## Change to `SKILL.md`

### 1. Add one field to `registry.json` schema (inside PRIMITIVE 3)

```json
"extensions": {
  "agent_scaffold": false
}
```

### 2. Add one conditional load instruction at the bottom of PRIMITIVE 3

```markdown
If `extensions.agent_scaffold = true`, load
references/agent-scaffold.md before executing any phase.
```

**Total change to SKILL.md: ~5 lines.**

---

## Opt-In Trigger Points

| Trigger | Action |
|---|---|
| `/ts-router init` interview asks "Muscle agents? (copilot / codex / antigravity / none)" | Any named → set `agent_scaffold: true`, load reference |
| User edits `registry.json` manually | Picked up on next invoke |
| `/ts-router refine` detects new `type="agent"` entries in `collection[]` | Prompts "Enable agent scaffold? Y/N" |
| `agent_scaffold: false` (default) | Reference never loaded, zero token cost |

---

## `.agent/` Directory Contract

```
.agent/
  _registry.json          ← active agent index (source of truth)
  copilot/
    AGENTS.md             ← task stubs (muscle reads this)
    capabilities.md       ← scope + DIAL + escalation rules
  codex/
    AGENTS.md
    capabilities.md
  antigravity/
    AGENTS.md
    capabilities.md
```

One directory per agent where `tier = "active" | "optional"`.

`.agent/` is the **shared handoff layer** — orchestrator writes, muscles read.
Mirrors the `.ai/` pattern: `.ai/` is shared state, `.ai/ts-deliver-router/` is
private. `.agent/` is shared contracts, `.claude/` is Claude Code's private namespace.

---

## `references/agent-scaffold.md` — Full Specification

### Purpose

Instructs the orchestrator to generate `.agent/<id>/` directories containing task
contracts and capability declarations for each active muscle agent.

### Activation

```json
"extensions": { "agent_scaffold": true }
```

Triggered by:
- `/ts-router init` → first-time scaffold
- `/ts-router refine` → regenerate on `collection[]` change (diff-aware)

### Write Rules

1. Read `registry.json → collection[]` where `type = "agent"`
2. Filter `tier = "active" | "optional"`
3. For each agent: write `.agent/<id>/AGENTS.md` + `capabilities.md`
4. Write `.agent/_registry.json`
5. On refine: diff against previous `_registry.json`; only rewrite changed agents. Print diff summary.
6. On `tier → "retired"`: delete `.agent/<id>/` and confirm aloud.

### `.agent/_registry.json` Schema

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

### `AGENTS.md` Template

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

### `capabilities.md` Template

```markdown
# <agent-id> — Capabilities
Scope:      <readable/writable paths>
Off-limits: <paths agent must never touch>
DIAL:       <level> — <one-line behaviour description>
Escalate when:
  - <condition 1>
  - <condition 2>
```

### Lifecycle

| Event | Action |
|---|---|
| `/ts-router init` | First scaffold from registry |
| `/ts-router refine` | Diff-aware regeneration |
| `tier → retired` | Delete `.agent/<id>/`, confirm aloud |
| DIAL change | Update `_registry.json → agents[].dial` only |
| Phase entered | Orchestrator reads relevant task block |
| `agent_scaffold` flipped `false` | `.agent/` left on disk; no further writes |

### Escalation Invariant

Muscle agents never make gate decisions. Any task tagged `BLOCK_EXIT` or
`ESCALATE` pauses and returns control to Claude Code before phase exit is
allowed. DIAL is per-agent convenience only — never a gate bypass.

---

## Token Impact

| Scenario | Token cost from SKILL.md change |
|---|---|
| No muscle agents (default) | +0 — flag stays `false` |
| Opt-in at init | +~80 tokens — reference loaded once |
| Reference reloaded per phase | Only when `agent_scaffold = true` |

---

## Implementation Checklist

- [ ] Add `extensions.agent_scaffold: false` to `registry.json` schema in PRIMITIVE 3
- [ ] Add conditional load instruction at bottom of PRIMITIVE 3 (~3 lines)
- [ ] Create `references/agent-scaffold.md` from this spec
- [ ] Update `/ts-router init` interview to ask about muscle agents
- [ ] Update `/ts-router refine` to detect `type="agent"` entries and prompt
- [ ] Update `WORKSPACE.md` to document `.agent/` as a shared handoff directory
