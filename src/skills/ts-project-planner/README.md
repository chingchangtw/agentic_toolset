# ts-project-planner

Three-layer dual-track agile project orchestrator that sits above ts-deliver-router.

## What it does

- **Layer D — Discovery:** Seed ideas, explore domains, validate assumptions, make
  build/kill/reduce-scope decisions. Produces a ready-for-delivery buffer
  (`.ai/discovery.json`).
- **Layer 0 — Backlog:** Decompose a project vision into a release map + epic
  backlog. Sync ready discoveries into `plan.json`.
- **Layer 1 — Delivery:** Sequence epics into iterations, run ts-deliver-router
  per work unit, close releases.

**Does not replace ts-deliver-router. Calls it.**

## File Structure

```
ts-project-planner/
├── SKILL.md                           ← Canonical skill (full prose)
├── SKILL_caveman.md                   ← Token-optimized variant
├── README.md                          ← This file
└── references/
    ├── workspace-spec.md              ← .ai/ layout contract + shared schemas
    ├── iteration-schema.md            ← iteration.json full reference + example
    ├── work-unit-profiles.md          ← Registry profiles: epic / refactor / bugfix
    └── discovery-kanban.md            ← Discovery stage criteria, WIP, stale, dedup
```

## Workspace (shared with ts-deliver-router)

```
.ai/                            ← workspace root
├── WORKSPACE.md                ← layout contract (created by /ts-deliver init)
├── discovery.json              ← Ready-for-Delivery buffer (this skill primary writer)
├── domain.json                 ← ES output (written by ts-event-storming-facilitator)
├── iteration.json              ← release state (primary writer: this skill)
├── risks.md                    ← risk register (primary writer: this skill)
├── decisions/                  ← ADRs (any skill appends)
├── ts-deliver-router/          ← private to ts-deliver-router
└── ts-project-planner/         ← private to this skill
    ├── plan.json
    └── retrospectives/
```

## Commands

| Command | Purpose |
|---|---|
| `/ts-discover idea "<title>"` | Add idea to discovery backlog |
| `/ts-discover idea --from-router` | Feedback hook from ts-deliver-router |
| `/ts-discover explore <id>` | Domain analysis + risk identification |
| `/ts-discover validate <id>` | Feasibility + strategic fit validation |
| `/ts-discover decide <id> [build\|kill\|keep-learning\|reduce-scope]` | Product decision |
| `/ts-discover status` | Discovery Kanban board |
| `/ts-project plan --new "<vision>"` | Seed discovery with candidate ideas |
| `/ts-project plan --sync` | Sync ready ideas → plan.json as epics |
| `/ts-project status` | Cross-iteration progress |
| `/ts-project refine` | Update backlog after iteration close |
| `/ts-iteration start <release>` | Load + sequence epics for a release |
| `/ts-iteration next` | Advance to next epic → calls `/ts-deliver init` |
| `/ts-iteration status` | Cross-epic progress in current release |
| `/ts-iteration close` | Close release → retro → promote next |

## Work Unit Types

| Type | Phases | Gates | Mutation |
|---|---|---|---|
| `epic` | Full 7 | G1 + G2 | 60→85% |
| `refactor` | Think→Build→Review→Test→Reflect | G1 only | 90% |
| `bugfix` | Plan→Build→Test→Ship | G2 only | 80% |

## Skills & Agents Used

`ts-event-storming-facilitator` → `first-principles-agent` → `council-advisor` →
`tows-strategy-analyst` → `critical-thinker` → `ts-deliver-router` →
`ts-acpl` → Atlassian Rovo MCP → GitHub MCP

## Prerequisites

- `ts-deliver-router` installed (see ts-deliver-router change PRD)
- `/ts-deliver init` creates `.ai/WORKSPACE.md` if not present
