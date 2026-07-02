---
name: ts-project-planner
description: >
  Three-layer project orchestrator implementing dual-track agile. Layer D
  (Discovery) runs Idea → Explore → Validate → Decide to produce a
  Ready-for-Delivery buffer (.ai/discovery.json). Layer 0 (Backlog) syncs ready
  items into a release map + epic backlog (.ai/ts-project-planner/plan.json).
  Layer 1 (Delivery) sequences epics per release and drives ts-deliver-router as
  a per-epic sub-loop. Activate whenever a user wants to plan a large project,
  run discovery on an idea, decide whether to build/kill/reduce-scope something,
  break down a vision into MVP and iterations, manage an epic backlog, start or
  close a release, check iteration or discovery progress, or coordinate multiple
  epics across a release cycle. Also activate on: "how do I manage this whole
  project", "what should we build next", "is this idea worth building", "what
  epics are next", "plan my MVP", "start iteration", "what's in discovery",
  "what's the status across all epics", "break this down into manageable
  pieces". Works with ts-deliver-router — do NOT replace it. Reads and writes
  shared artifacts in .ai/ workspace root per WORKSPACE.md convention.
---

# ts-project-planner

A three-layer orchestrator implementing **dual-track agile** (Discovery +
Delivery, per Aktia) for projects too large for a single ts-deliver-router
cycle.

- **Layer D — Discovery**: cheap, fast, killable learning loops. Turns raw
  ideas into a validated, Ready-for-Delivery buffer.
- **Layer 0 — Backlog**: syncs the Ready-for-Delivery buffer into a release map
  and epic backlog.
- **Layer 1 — Delivery**: sequences epics per release, drives
  ts-deliver-router as a per-epic sub-loop.

Both tracks run **continuously and in parallel** — Discovery for the next
release runs while Delivery ships the current one. A feedback hook from
ts-deliver-router re-enters Discovery when Delivery surfaces a new unknown.

**Does not replace ts-deliver-router.** Calls it.

---

## Workspace

All artifacts follow the `.ai/` workspace convention defined in
`references/workspace-spec.md`. Read it before first use.

```
.ai/                          ← workspace root
├── domain.json               ← shared: ES domain model (read here)
├── discovery.json            ← shared: Discovery backlog + Ready-for-Delivery buffer
├── iteration.json            ← shared: current release state (primary writer)
├── risks.md                  ← shared: risk register (primary writer)
├── decisions/                ← shared: ADRs (read + append)
├── ts-deliver-router/         ← private to ts-deliver-router (append-only on discovery.json)
└── ts-project-planner/
    ├── plan.json             ← private: full project backlog
    └── retrospectives/       ← private: per-iteration retros
```

---

## Architecture

```
Layer D — Discovery (this skill)
  /ts-discover idea "<desc>"        → seed discovery.json, status=idea
  /ts-discover explore <id>         → Problem Understanding + Solution Exploration
  /ts-discover validate <id>        → Validation (council-advisor, tows-strategy-analyst)
  /ts-discover decide <id> [...]    → build|kill|keep-learning|reduce-scope
  /ts-discover status               → kanban view of discovery backlog
  /ts-discover idea --from-router   → feedback intake from ts-deliver-router

         status=ready items
              │
              ▼
Layer 0 — Backlog (this skill)
  /ts-project plan --new   → vision interview → seed Discovery with candidate ideas
  /ts-project plan --sync  → pull status=ready items → .ai/ts-project-planner/plan.json
  /ts-project status       → cross-iteration progress
  /ts-project refine       → update backlog after each iteration

Layer 1 — Delivery (this skill, orchestrates Layer 2)
  /ts-iteration start <release>  → load epics → .ai/iteration.json
  /ts-iteration next             → advance to next epic → /ts-deliver init
  /ts-iteration close            → release tag + retro + promote next

Layer 2 — ts-deliver-router (separate skill, called per epic)
  /ts-deliver init  →  ...7-phase spine...  →  /ts-deliver refine
```

---

## LOAD INDEX

Load the relevant file(s) before executing a command. Do not load all files at once.

| File | Load when |
|---|---|
| `references/workspace-spec.md` | First use — `.ai/` layout contract, schemas, R/W matrix |
| `references/commands.md` | Any command invoked — step-by-step procedures for all commands |
| `references/discovery-state.md` | Any `/ts-discover` command — state machine schema and transitions |
| `references/discovery-kanban.md` | `/ts-discover explore/validate/decide/status` — stage criteria, WIP, stale rule, dedup |
| `references/router-integration.md` | `/ts-iteration next` or ts-deliver-router interaction — integration contracts, feedback hook, G1 enrichment |
| `references/iteration-schema.md` | `/ts-iteration start/status/close` — full `iteration.json` field reference |
| `references/work-unit-profiles.md` | `/ts-iteration next` — registry profiles per work unit type |
| `references/agents.md` | Choosing sub-agents for a Discovery or Delivery task |

