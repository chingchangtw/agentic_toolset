# .ai/WORKSPACE.md — Shared Skill Workspace

This directory is the shared working space for all skills in this project.
Every skill that participates reads this file on first use to understand
the layout contract.

---

## Directory Convention

```
.ai/
│
├── WORKSPACE.md              ← this file — layout contract for all skills
│
├── ── SHARED ZONE ──────────────────────────────────────────────────────
│
├── discovery.json            ← Ready-for-Delivery buffer (idea → ready pipeline)
│                               primary writer: ts-project-planner (/ts-discover commands)
│                               ts-deliver-router: APPEND-ONLY via --from-router hook
│
├── domain.json               ← Event Storming output (project-level domain model)
│                               primary writer: ts-event-storming-facilitator (Think)
│                               readers: ts-project-planner, ts-deliver-router, ts-acpl
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
├── ts-deliver-router/        ← owned exclusively by ts-deliver-router
│   ├── state.json            ← current phase + exit contracts
│   ├── autonomy              ← DIAL level
│   ├── registry.json         ← active tool collection + gate thresholds
│   └── registry.log          ← refinement history
│
└── ts-project-planner/       ← owned exclusively by ts-project-planner
    ├── plan.json             ← full project backlog + release map
    └── retrospectives/       ← per-iteration Reflect summaries
        └── <release>-retro.md
```

---

## Shared Artifact Schemas

### `discovery.json`
```json
[
  {
    "id": "idea-001",
    "title": "<title>",
    "status": "idea|exploring|validating|ready|killed|reduce-scope",
    "source_epic": null,
    "keep_learning_count": 0,
    "riskiest_assumptions": [
      { "assumption": "<text>", "risk": "L|M|H" }
    ],
    "exploration_output": {
      "domain_events": [],
      "aggregates": [],
      "acpl_pattern_group": null
    },
    "validation_output": {
      "feasibility": null,
      "rationale": null
    },
    "decision": null,
    "ready_epics": [],
    "depends_on": [],
    "synced_to_plan": false,
    "notes": ""
  }
]
```
*ts-project-planner has full R/W. ts-deliver-router may only APPEND new entries via `--from-router` with `source_epic` set — cannot modify status, decision, or ready_epics on existing entries.*

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
*ts-deliver-router reads `problem_frame` and `acpl_pattern_group` at Think exit.*
*ts-project-planner reads `bounded_contexts` to suggest Epic boundaries.*

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
      "router_state": "<path to .ai/ts-deliver-router/state.json snapshot or null>",
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
*`writer_lock` prevents simultaneous writes. Each skill sets it before writing, clears after.*
*ts-deliver-router ONLY writes: `epics[].status`, `epics[].branch`, `epics[].mutation_score`, `epics[].shipped_at`, `active_epic`.*
*ts-project-planner writes everything else.*

### `risks.md`
```markdown
# Risk Register

| ID | Description | Likelihood | Impact | Mitigation | Status |
|----|-------------|------------|--------|------------|--------|
| R1 | ... | H/M/L | H/M/L | ... | open/mitigated |
```
*ts-deliver-router reads this during Review G1 gate — relevant risks surfaced in STRIDE checklist.*

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

| Artifact | ts-project-planner | ts-deliver-router | ts-event-storming | ts-acpl | human |
|---|---|---|---|---|---|
| `discovery.json` | **W** (full R/W) | W (append-only, --from-router) | — | — | R |
| `domain.json` | R | R | **W** | R | R |
| `iteration.json` | **W** (all fields) | W (status/branch/score) | — | — | R |
| `risks.md` | **W** | R (G1 gate) | — | — | R/W |
| `decisions/` | R/W | R/W | — | R | R/W |
| `ts-deliver-router/*` | R (iteration only) | **W** | — | — | R |
| `ts-project-planner/*` | **W** | — | — | — | R |

---

## Conflict Resolution

1. `writer_lock` in `iteration.json` — set before write, clear after. If lock is set by
   another skill, wait 5s and retry once, then surface "write conflict — manual resolve."
2. ADRs are append-only. Never delete or overwrite an ADR.
3. `domain.json` is regenerated only by re-running `/think` with ts-event-storming-facilitator.
   Do not patch it inline — re-run the session.
4. `risks.md` is Markdown — merge-friendly. Append new rows; never delete existing rows.
5. `discovery.json` — ts-deliver-router may only create new entries via `--from-router` with
   `source_epic` set. It cannot modify `status`, `decision`, or `ready_epics` on any existing
   entry. ts-project-planner is the single point of decision authority.
