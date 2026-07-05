# Registry Schema Reference

## `.agents/ts-deliver-router/registry.json` — Full Field Reference

### Top-level fields

| Field | Type | Description |
|---|---|---|
| `project` | string | Project name/identifier |
| `initialized` | ISO date | When `/ts-deliver init` was first run |
| `lifecycle_stage` | enum | `early` / `active` / `stabilizing` / `maintenance` |
| `core` | object | Core 4 invariant tools (never change) |
| `collection` | array | Project-specific tool entries |
| `gates` | object | Gate definitions with required checks |
| `refinement_count` | int | How many times `/ts-deliver refine` has run |
| `next_refinement_trigger` | string | Phase that auto-triggers next refine |
| `extensions` | object | Optional feature flags. `{ "agent_scaffold": false }` — set `true` to enable muscle agent handoff (loads `references/agent-scaffold.md`) |

### `collection[]` entry fields

| Field | Type | Description |
|---|---|---|
| `id` | string | Tool identifier (matches CHECKS REGISTRY check ID) |
| `type` | enum | `skill` / `plugin` / `mcp` / `muscle-agent` / `subagent` |
| `phase` | string[] | Phases this tool is active in |
| `tier` | enum | `active` / `optional` / `pending-setup` / `retired` |
| `gate` | string\|null | Gate ID this tool contributes to (e.g. `"G1"`) |
| `threshold` | number\|null | Numeric threshold (e.g. mutation score `85`) |
| `source` | string\|null | Where to find/install the tool |
| `notes` | string\|null | Free-text notes (e.g. why retired) |

### `gates{}` entry fields

| Field | Type | Description |
|---|---|---|
| `phase` | string | Phase where this gate is enforced |
| `required` | string[] | Tool IDs (and optional threshold e.g. `"mutation>=85"`) that must pass |
| `sign_off` | enum | `human` / `auto` — always `human` for G1/G2 |

---

## Example: Atlassian Admin Tool (your pilot project)

```json
{
  "project": "atlassian-admin-tool",
  "initialized": "2026-06-13",
  "lifecycle_stage": "early",
  "core": {
    "spine": "gstack",
    "bdd": "spectra",
    "review": "code-review-graph",
    "token_discipline": "caveman"
  },
  "collection": [
    {
      "id": "ts-acpl",
      "type": "skill",
      "phase": ["think", "build", "review", "test"],
      "tier": "active",
      "source": "local"
    },
    {
      "id": "atlassian-rest-api",
      "type": "skill",
      "phase": ["build"],
      "tier": "active",
      "source": "local",
      "notes": "Inline API endpoint lookup during code generation"
    },
    {
      "id": "ts-event-storming-facilitator",
      "type": "subagent",
      "phase": ["think"],
      "tier": "pending-setup",
      "source": "local",
      "notes": "Claude Code sub-agent (.claude/agents/ts-event-storming-facilitator.md, built via sub-agents.md) — never triggers agent-scaffold.md"
    }
  ],
  "gates": {
    "G1": {
      "phase": "review",
      "required": ["semgrep", "trivy"],
      "sign_off": "human"
    },
    "G2": {
      "phase": "test",
      "required": ["stryker>=60", "trivy"],
      "sign_off": "human"
    }
  },
  "refinement_count": 0,
  "next_refinement_trigger": "reflect"
}
```

---

## `.agents/ts-deliver-router/registry.log` — Refinement History Format

```json
[
  {
    "date": "2026-06-13",
    "refinement_count": 1,
    "changes": [
      { "tool": "stryker", "field": "threshold", "from": 60, "to": 85 },
      { "tool": "github-mcp", "field": "tier", "from": "pending-setup", "to": "active" },
      { "tool": "ts-event-storming-facilitator", "field": "tier", "from": "pending-setup", "to": "active" }
    ],
    "lifecycle_stage_change": { "from": "early", "to": "active" },
    "rationale": "First Reflect phase complete. GitHub MCP configured. ES facilitator built. Raising mutation target now that core patterns are stable."
  }
]
```

---

## `.agents/ts-deliver-router/state.json` — Phase State Format

```json
{
  "phase": "build",
  "initialized": true,
  "project": "atlassian-admin-tool",
  "updated_at": "2026-06-13T10:30:00Z",
  "artifacts": {
    "spec_dir": "spec/",
    "scenario_count": 12,
    "scenarios_passing": 0
  },
  "gates": {
    "G1": { "status": "pending", "signed_off_by": null, "signed_off_at": null },
    "G2": { "status": "pending", "signed_off_by": null, "signed_off_at": null }
  },
  "metrics": {
    "coverage_pct": null,
    "mutation_score": null
  }
}
```
