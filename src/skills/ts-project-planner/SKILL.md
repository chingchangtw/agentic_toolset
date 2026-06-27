---
name: ts-project-planner
description: "Dual-track agile orchestrator. Layer D (Discovery) - Layer 0 (Backlog) - Layer 1 (Delivery) - Layer 2 (ts-deliver-router skill)."
---
<!--
 Three-layer dual-track agile orchestrator. Layer D (Discovery): Idea→Explore→Validate→Decide. Layer 0 (Backlog): sync ready items to release map. Layer 1 (Delivery): sequence epics, drive ts-deliver-router per epic. Activate for large project planning, idea validation, MVP breakdown, epic backlog management, or release coordination. Works WITH ts-deliver-router — does NOT replace it.
-->

## On First Use
See 'references/on-first-use.md' for first-use initialization steps.

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

Reference `references/architecture.md` for a diagram and command flow.

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
| `references/on-first-use.md` | First-use initialization steps |

---

## Hard rules

- `/ts-iteration start` is sequencing-only: it resolves epic order and writes
  `.ai/iteration.json` with every epic `status=queued`, `active_epic=null`.
  It NEVER calls `/ts-deliver init` and NEVER touches
  `.ai/ts-deliver-router/state.json`.
- Only `/ts-iteration next` drives the ts-deliver-router spine
  (Think→...→Reflect), and only one epic at a time — the one held in
  `active_epic`. The spine never auto-picks-up on `start`.

