# reference: workspace contract

Shared workspace root: `.agents/`.

## Router-owned paths

- `.agents/ts-deliver-router/state.json`
- `.agents/ts-deliver-router/autonomy`
- `.agents/ts-deliver-router/registry.json`
- `.agents/ts-deliver-router/registry.log`

## Cross-skill expectations

- other skills may read router state but SHALL NOT infer phase independently
- router may push unknowns to discovery flows; this does not block current phase
- router records gate results and ingest events as durable trail

## Boundaries

- router governs phase transitions and gate checks
- implementation skills govern code changes inside Build
- planner/discovery skills govern backlog and unresolved unknown capture

