# .agents/WORKSPACE.md — Shared Skill Workspace

Shared working space for all skills. Read on first use.

---

## Directory Convention

```
.agents/
│
├── WORKSPACE.md              ← this file — layout contract for all skills
│
├── ── SHARED ZONE ──────────────────────────────────────────────────────
│
├── domain.json               ← Event Storming output (project-level domain model)
│                               primary writer: ts-event-storming-facilitator (Think)
│                               readers: ts-project-planner, ts-deliver-router, ts-acpl
│
├── discovery.json            ← Discovery backlog + Ready-for-Delivery buffer
│                               primary writer: ts-project-planner (/ts-discover commands)
│                               readers: ts-deliver-router (G1 linkage, advisory)
│                               ts-deliver-router has APPEND-ONLY access via
│                               /ts-discover idea --from-router (dedup-checked)
│
├── iteration.json            ← Current release scope + epic queue + progress
│                               primary writer: ts-project-planner (/ts-iteration commands)
│                               readers: ts-deliver-router (which epic is next)
│                               Note: ts-deliver-router updates epic status fields only
│
├── risks.md                  ← Risk register (Markdown — human-readable)
│                               primary writer: ts-project-planner (/ts-project plan)
│                               readers: ts-deliver-router (Review G1 gate)
│
├── decisions/                ← Architecture Decision Records
│   ├── ADR-001.md            ← any skill may create; none may delete
│   └── ...
│
├── ── PRIVATE ZONES ────────────────────────────────────────────────────
│
├── ts-deliver-router/         ← owned exclusively by ts-deliver-router
│   ├── state.json            ← current phase + exit contracts
│   ├── autonomy              ← DIAL level
│   ├── registry.json         ← active tool collection + gate thresholds
│   └── registry.log          ← refinement history
│
└── ts-project-planner/          ← owned exclusively by ts-project-planner
    ├── plan.json             ← full project backlog + release map
    └── retrospectives/       ← per-iteration Reflect summaries
        └── <release>-retro.md
```

---

## Shared Artifact Schemas

### `domain.json`
```json
{
  "project": "<name>",
  "generated_at": "<ISO>",
  "generator": "ts-event-storming-facilitator",
  "domain_events": ["OrderPlaced", "IssueKeyRejected"],
  "commands": ["PlaceOrder", "ValidateIssueKey"],
  "aggregates": ["Order", "IssueKey"],
  "bounded_contexts": [
    { "name": "<context>", "language_terms": [] }
  ],
  "problem_frame": "Commanded|Information|Workpiece|Transformation|Control",
  "acpl_pattern_group": "G2+G5",
  "ubiquitous_language": ["term1", "term2"]
}
```
ts-deliver-router reads `problem_frame` + `acpl_pattern_group` at Think exit.
ts-project-planner reads `bounded_contexts` for Epic boundaries during `/ts-discover explore`.

### `discovery.json`
```json
{
  "project": "<name>",
  "ideas": [
    {
      "id": "idea-001",
      "title": "General Ledger module",
      "status": "idea|exploring|validating|ready|reduce-scope|keep-learning|killed",
      "source_epic": null,
      "keep_learning_count": 0,
      "riskiest_assumptions": [
        { "assumption": "Multi-currency required from day 1", "risk": "H", "validated": false }
      ],
      "exploration_output": {
        "domain_events": [], "commands": [], "aggregates": [],
        "bounded_contexts": [], "acpl_pattern_group": "G2+G3"
      },
      "validation_output": {
        "feasibility": "feasible|risky|infeasible",
        "council_verdict": "<summary>",
        "decision_rationale": "<why>"
      },
      "decision": "build|kill|keep-learning|reduce-scope|null",
      "ready_epics": [],
      "synced_to_plan": false,
      "notes": ""
    }
  ]
}
```
Full state machine, WIP, stale, dedup: `references/discovery-kanban.md`.
ts-deliver-router APPEND-ONLY via `/ts-discover idea --from-router` (dedup-checked). MUST NOT modify: `status`, `decision`, `ready_epics`, `synced_to_plan`, `keep_learning_count`, `exploration_output`, `validation_output` on any existing entry.

### `iteration.json`
```json
{
  "project": "<name>",
  "release": "<name e.g. MVP>",
  "release_goal": "<one sentence>",
  "release_exit_criteria": ["criterion 1", "criterion 2"],
  "epics": [
    {
      "id": "<jira-key or local id>",
      "title": "<title>",
      "type": "epic|refactor|bugfix",
      "priority": 1,
      "status": "queued|active|done|deferred",
      "depends_on": ["<epic-id>"],
      "router_state": "<path to .agents/ts-deliver-router/state.json snapshot or null>",
      "branch": "<feat/name or null>",
      "mutation_score": null,
      "shipped_at": null
    }
  ],
  "active_epic": "<id or null>",
  "iteration_start": "<ISO>",
  "iteration_close": null,
  "writer_lock": "ts-project-planner|ts-deliver-router"
}
```
`writer_lock`: set before write, clear after. ts-deliver-router ONLY writes: `epics[].status`, `epics[].branch`, `epics[].mutation_score`, `epics[].shipped_at`, `active_epic`. ts-project-planner writes everything else.

### `risks.md`
```markdown
# Risk Register

| ID | Description | Likelihood | Impact | Mitigation | Status |
|----|-------------|------------|--------|------------|--------|
| R1 | ... | H/M/L | H/M/L | ... | open/mitigated |
```
ts-deliver-router reads at Review G1 — relevant risks surfaced in STRIDE checklist.

### `decisions/ADR-NNN.md`
```markdown
# ADR-NNN: <title>

Date: <ISO>
Status: proposed | accepted | deprecated | superseded
Created by: <skill-id or human>

## Context
<why this decision was needed>

## Decision
<what was decided>

## Consequences
<trade-offs, implications>
```

---

## Cross-Skill Read/Write Matrix

| Artifact | ts-project-planner | ts-deliver-router | ts-event-storming-facilitator | ts-acpl | human |
|---|---|---|---|---|---|
| `domain.json` | R | R | **W** | R | R |
| `discovery.json` | **W** (all fields) | W (append-only, new entries via --from-router, dedup-checked) | — | — | R |
| `iteration.json` | **W** (all fields) | W (status/branch/score) | — | — | R |
| `risks.md` | **W** | R (G1 gate) | — | — | R/W |
| `decisions/` | R/W | R/W | — | R | R/W |
| `ts-deliver-router/*` | R (iteration only) | **W** | — | — | R |
| `ts-project-planner/*` | **W** | — | — | — | R |

---

## Conflict Resolution

1. `writer_lock` in `iteration.json` — set before write, clear after. Lock set by another skill: wait 5s, retry once, then "write conflict — manual resolve."
2. ADRs append-only. Never delete or overwrite.
3. `domain.json` regenerated only by re-running Think with ts-event-storming-facilitator. Do not patch inline.
4. `risks.md` Markdown — merge-friendly. Append new rows; never delete existing.
5. `discovery.json` entries never deleted. ts-deliver-router append-only writes dedup-checked (Jaccard > 0.5 on title). Match appends to existing entry `notes` instead of creating new.
