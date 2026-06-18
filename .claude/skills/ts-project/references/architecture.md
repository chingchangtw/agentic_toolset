## Architecture
```
Layer D — Discovery (this skill)
  /ts-discover:idea "<desc>"        → seed discovery.json, status=idea
  /ts-discover:explore <id>         → Problem Understanding + Solution Exploration
  /ts-discover:validate <id>        → Validation (council-advisor, tows-strategy-analyst)
  /ts-discover:decide <id> [...]    → build|kill|keep-learning|reduce-scope
  /ts-discover:status               → kanban view of discovery backlog
  /ts-discover:idea --from-router   → feedback intake from ts-deliver-router

         status=ready items
              │
              ▼
Layer 0 — Backlog (this skill)
  /ts-project:plan --new   → vision interview → seed Discovery with candidate ideas
  /ts-project:plan --sync  → pull status=ready items → .ai/ts-project-planner/plan.json
  /ts-project:status       → cross-iteration progress
  /ts-project:refine       → update backlog after each iteration

Layer 1 — Delivery (this skill, orchestrates Layer 2)
  /ts-iteration:start <release>  → load epics → .ai/iteration.json
  /ts-iteration:next             → advance to next epic → /ts-deliver:init
  /ts-iteration:close            → release tag + retro + promote next

Layer 2 — ts-deliver-router (separate skill, called per epic)
  /ts-deliver:init  →  ...7-phase spine...  →  /ts-deliver:refine
```