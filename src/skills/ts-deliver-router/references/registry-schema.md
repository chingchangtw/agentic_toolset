# Registry Schema Reference

## `.ai/ts-deliver-router/registry.json` — Full Field Reference

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
| `type` | enum | `skill` / `plugin` / `mcp` / `agent` |
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
      "id": "atlassian-rovo",
      "type": "mcp",
      "phase": ["plan", "ship", "reflect"],
      "tier": "active",
      "source": "https://mcp.atlassian.com/v1/mcp"
    },
    {
      "id": "semgrep",
      "type": "plugin",
      "phase": ["build", "review"],
      "tier": "active",
      "gate": "G1",
      "source": "https://semgrep.dev"
    },
    {
      "id": "trivy",
      "type": "plugin",
      "phase": ["build", "test"],
      "tier": "active",
      "gate": "G2",
      "source": "https://github.com/aquasecurity/trivy"
    },
    {
      "id": "stryker",
      "type": "plugin",
      "phase": ["test"],
      "tier": "active",
      "gate": "G2",
      "threshold": 60,
      "source": "npm install --save-dev @stryker-mutator/core",
      "notes": "Target 60% for early stage; raise to 85% at stabilizing"
    },
    {
      "id": "github-mcp",
      "type": "mcp",
      "phase": ["plan", "build", "review", "test", "ship"],
      "tier": "pending-setup",
      "source": "github.com/modelcontextprotocol/servers/tree/main/src/github"
    },
    {
      "id": "first-principles-agent",
      "type": "skill",
      "phase": ["think"],
      "tier": "optional"
    },
    {
      "id": "council-advisor",
      "type": "skill",
      "phase": ["review", "reflect"],
      "tier": "optional"
    },
    {
      "id": "ts-event-storming-facilitator",
      "type": "agent",
      "phase": ["think"],
      "tier": "pending-setup",
      "notes": "Sub-agent to build — see references/sub-agents.md"
    },
    {
      "id": "ts-mutation-analyst",
      "type": "agent",
      "phase": ["test"],
      "tier": "pending-setup",
      "notes": "Sub-agent to build — see references/sub-agents.md"
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

## `.ai/ts-deliver-router/registry.log` — Refinement History Format

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

## `.ai/ts-deliver-router/state.json` — Phase State Format

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
