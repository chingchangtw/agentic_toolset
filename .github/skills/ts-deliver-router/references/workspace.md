# reference: workspace contract

Shared workspace root: `.ai/`.

## Router-owned paths

- `.ai/ts-deliver-router/state.json`
- `.ai/ts-deliver-router/autonomy`
- `.ai/ts-deliver-router/registry.json`
- `.ai/ts-deliver-router/registry.log`

## Cross-skill expectations

- other skills may read router state but SHALL NOT infer phase independently
- router may push unknowns to discovery flows; this does not block current phase
- router records gate results and ingest events as durable trail

## `.agent/` — muscle agent handoff directory

Runtime artifact, generated per project. NOT checked into skill source repo.

| Property | Value |
|---|---|
| Owner (writer) | ts-deliver-router orchestrator (via `references/agent-scaffold.md`) |
| Consumer (reader) | Muscle agents (Copilot, Codex, Antigravity) |
| Analogous to | `.ai/` (shared state) — not `.claude/` (Claude Code private namespace) |

Layout:
```
.agent/
├── _registry.json        ← generated agent manifest
└── <agent-id>/
    ├── AGENTS.md          ← task contract for this agent
    └── capabilities.md   ← scope, off-limits, DIAL, escalation conditions
```

Created/updated by `/ts-deliver init` (first scaffold) and `/ts-deliver refine` (diff-aware regeneration).
Requires `extensions.agent_scaffold: true` in `registry.json`. See `references/agent-scaffold.md`.

## Boundaries

- router governs phase transitions and gate checks
- implementation skills govern code changes inside Build
- planner/discovery skills govern backlog and unresolved unknown capture

