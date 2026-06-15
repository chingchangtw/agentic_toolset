# ts-project-planner

Three-layer project orchestrator implementing **dual-track agile** (Discovery +
Delivery, per Aktia) above `ts-deliver-router`.

## What it does

- **Layer D — Discovery:** Idea → Explore → Validate → Decide. Cheap, fast,
  killable learning loops produce a Ready-for-Delivery buffer
  (`.ai/discovery.json`).
- **Layer 0 — Backlog:** Syncs `status=ready` items into a release map + epic
  backlog (`.ai/ts-project-planner/plan.json`).
- **Layer 1 — Delivery:** Sequences epics per release, runs `ts-deliver-router`
  per work unit, closes releases.

Both tracks run **continuously and in parallel** — Discovery for the next
release runs while Delivery ships the current one. A feedback hook
(`--from-router`) lets `ts-deliver-router` re-enter Discovery when Delivery
surfaces a new unknown.

**Does not replace ts-deliver-router. Calls it.**

## File Structure

```
ts-project-planner/
├── SKILL.md                           ← Canonical skill (full prose)
├── SKILL_caveman.md                   ← Token-optimized variant (~43%)
├── README.md                          ← This file
└── references/
    ├── workspace-spec.md              ← .ai/ layout contract + shared schemas
    ├── discovery-kanban.md            ← Discovery stage criteria, WIP, stale, dedup
    ├── iteration-schema.md            ← iteration.json full reference + example
    └── work-unit-profiles.md          ← Registry profiles: epic / refactor / bugfix
```

## Workspace (shared with ts-deliver-router)

```
.ai/                        ← workspace root
├── WORKSPACE.md            ← layout contract (created by /ts-router init)
├── domain.json             ← ES output (written by ts-event-storming-facilitator)
├── discovery.json          ← Discovery backlog + Ready-for-Delivery buffer
│                              (primary writer: this skill; ts-deliver-router
│                              append-only via --from-router, dedup-checked)
├── iteration.json          ← release state (primary writer: ts-project-planner)
├── risks.md                ← risk register (primary writer: ts-project-planner)
├── decisions/              ← ADRs (any skill appends)
├── ts-deliver-router/       ← private to ts-deliver-router
└── ts-project-planner/        ← private to ts-project-planner
    ├── plan.json
    └── retrospectives/
```

## Commands

Grouped by layer, in typical flow order.

### Discovery (Layer D)

| Command | Purpose |
|---|---|
| `/ts-discover idea "<desc>"` | Seed the Discovery backlog with a candidate |
| `/ts-discover explore <id>` | Problem Understanding + Solution Exploration (WIP-limited: 3) |
| `/ts-discover validate <id>` | Validation — mandatory only if an H-risk assumption exists |
| `/ts-discover decide <id> [build\|kill\|keep-learning\|reduce-scope]` | The decision point |
| `/ts-discover status` | Kanban view of the Discovery backlog |
| `/ts-discover idea --from-router` | Feedback intake from `ts-deliver-router` (not user-invoked) |

### Backlog (Layer 0)

| Command | Purpose |
|---|---|
| `/ts-project plan --new "<vision>"` | Seed Discovery with candidate ideas (no epics yet) |
| `/ts-project plan --sync [release]` | Pull `status=ready` items into `plan.json` as epics |
| `/ts-project status` | Cross-iteration progress, including Discovery summary |
| `/ts-project refine` | Update backlog after iteration close |

### Delivery (Layer 1)

| Command | Purpose |
|---|---|
| `/ts-iteration start <release>` | Load + sequence epics for a release |
| `/ts-iteration next` | Advance to next epic → calls `/ts-router init` |
| `/ts-iteration status` | Cross-epic progress in current release |
| `/ts-iteration close` | Close release → retro → promote next |

## Discovery State Machine (summary)

```
idea ──explore──> exploring ──validate──> validating
                       │                       │
                       │  (skip if no H-risk)  ├──build──────> ready
                       └────────build──────────┘
                                               ├──kill───────> killed (+ADR)
                                               ├──keep-learning──> exploring
                                               │   (keep_learning_count++)
                                               └──reduce-scope──> split into
                                                                   new ideas
```

- **WIP limit:** 3 concurrent `exploring`+`validating`
- **Stale rule:** `keep_learning_count >= 3` → flagged, advisory
- **Dedup** (`--from-router` only): Jaccard similarity > 0.5 on title tokens

Full detail: `references/discovery-kanban.md`

## Work Unit Types

Set at `/ts-discover decide build` time, based on exploration + validation.

| Type | Phases | Gates | Mutation |
|---|---|---|---|
| `epic` | Full 7 | G1 + G2 | 60→85% |
| `refactor` | Think→Build→Review→Test→Reflect | G1 only | 90% |
| `bugfix` | Plan→Build→Test→Ship | G2 only | 80% |

## Skills Used

`ts-event-storming-facilitator` → `first-principles-agent` → `council-advisor`
→ `tows-strategy-analyst` → `critical-thinker` → `ts-deliver-router` →
Atlassian Rovo MCP → GitHub MCP
