# Iteration Schema Reference

## `.ai/iteration.json` — Full Field Reference

### Top-level fields

| Field | Owner | Description |
|---|---|---|
| `project` | ts-project-planner | Project name |
| `release` | ts-project-planner | Release name (e.g. "MVP") |
| `release_goal` | ts-project-planner | One-sentence goal |
| `release_exit_criteria` | ts-project-planner | List of conditions that define release complete |
| `epics` | both | Array of epic entries (see below) |
| `active_epic` | ts-deliver-router | ID of currently active epic, null if none |
| `iteration_start` | ts-project-planner | ISO datetime when /ts-iteration start ran |
| `iteration_close` | ts-project-planner | ISO datetime when /ts-iteration close ran, null if open |
| `writer_lock` | both | "ts-project-planner" or "ts-deliver-router" — set before write, clear after |

### `epics[]` entry fields

| Field | Owner | Description |
|---|---|---|
| `id` | ts-project-planner | Jira key or local ID |
| `title` | ts-project-planner | Epic title |
| `type` | ts-project-planner | `epic` / `refactor` / `bugfix` |
| `priority` | ts-project-planner | Integer — 1 is highest |
| `depends_on` | ts-project-planner | Array of epic IDs that must be done first |
| `status` | ts-deliver-router | `queued` / `active` / `done` / `deferred` |
| `router_state` | ts-project-planner | Path to ts-deliver-router state snapshot, null until active |
| `branch` | ts-deliver-router | Git branch name, null until active |
| `mutation_score` | ts-deliver-router | Final mutation % from G2 gate, null until done |
| `shipped_at` | ts-deliver-router | ISO datetime when Ship phase completed, null until done |
| `jira_key` | ts-project-planner | Jira Epic key if synced via Rovo MCP |
| `notes` | ts-project-planner | Free text |

---

## Complete Example: Atlassian Admin Tool MVP

```json
{
  "project": "atlassian-admin-tool",
  "release": "MVP",
  "release_goal": "Bulk REST API executor with CSV/JSON input and per-item Result reporting",
  "release_exit_criteria": [
    "Bulk executor handles ≥100 Jira REST operations per run",
    "Per-item ValidationError + ApiError typed correctly",
    "All Spectra scenarios archived and mutation score ≥ 75%",
    "G1 + G2 signed off"
  ],
  "epics": [
    {
      "id": "AAT-001",
      "title": "Bulk REST Executor — Core",
      "type": "epic",
      "priority": 1,
      "depends_on": [],
      "status": "done",
      "branch": "feat/bulk-rest-executor",
      "mutation_score": 82,
      "shipped_at": "2026-06-14T10:00:00Z",
      "jira_key": "AAT-1",
      "notes": "Foundation for all other epics"
    },
    {
      "id": "AAT-002",
      "title": "CSV/JSON Input Parser",
      "type": "epic",
      "priority": 2,
      "depends_on": ["AAT-001"],
      "status": "active",
      "branch": "feat/csv-json-parser",
      "mutation_score": null,
      "shipped_at": null,
      "jira_key": "AAT-2",
      "notes": ""
    },
    {
      "id": "AAT-003",
      "title": "Browser Activity Recorder",
      "type": "epic",
      "priority": 3,
      "depends_on": ["AAT-001"],
      "status": "queued",
      "branch": null,
      "mutation_score": null,
      "shipped_at": null,
      "jira_key": "AAT-3",
      "notes": ""
    },
    {
      "id": "AAT-R01",
      "title": "Refactor IssueKey Value Object — strengthen validation",
      "type": "refactor",
      "priority": 2,
      "depends_on": ["AAT-001"],
      "status": "queued",
      "branch": null,
      "mutation_score": null,
      "shipped_at": null,
      "jira_key": null,
      "notes": "Discovered during AAT-001 mutation analysis"
    }
  ],
  "active_epic": "AAT-002",
  "iteration_start": "2026-06-13T08:00:00Z",
  "iteration_close": null,
  "writer_lock": "ts-deliver-router"
}
```

---

## Phase Activation by Work Unit Type

Defines which ts-deliver-router phases are active for each epic type.
ts-deliver-router reads this when `/ts-iteration next` calls `/ts-deliver init`.

```json
{
  "epic": {
    "phases": ["think", "plan", "build", "review", "test", "ship", "reflect"],
    "gates": ["G1", "G2"],
    "mutation_target_by_stage": {
      "early": 60, "active": 75, "stabilizing": 85, "maintenance": 90
    },
    "branch_prefix": "feat/"
  },
  "refactor": {
    "phases": ["think", "build", "review", "test", "reflect"],
    "gates": ["G1"],
    "mutation_target": 90,
    "branch_prefix": "refactor/",
    "notes": "No Plan (no new scenarios) and no Ship (merged at Review sign-off)"
  },
  "bugfix": {
    "phases": ["plan", "build", "test", "ship"],
    "gates": ["G2"],
    "mutation_target": 80,
    "branch_prefix": "fix/",
    "notes": "No Think (problem already known) and no Reflect (lightweight cycle)"
  }
}
```
