## Discovery State Machine

`.agents/discovery.json` holds the Discovery backlog — the data model that all
`/ts-discover` commands operate on.

### Schema

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

### State Transitions

```
                ┌──────────── keep-learning (count++) ────────────┐
                │                                                   │
idea ──explore──┴──> exploring ──validate──> validating ───────────┘
  ▲                       │                       │
  │                       │ (low-uncertainty:      ├──decide build──────────> ready
  │                       │  skip validate)        ├──decide kill───────────> killed (+ADR)
  │                       └────decide build────────┘
  │                                                 └──decide reduce-scope──> reduce-scope
  └─────────────────────────────────────────────────────(splits into 2 new
                                                            'idea' entries,
                                                            origin linked)
```

`source_epic` (non-null) marks entries created via `--from-router` — the
feedback path from ts-deliver-router.

### WIP Limit

Max **3** ideas concurrently with `status` in `{exploring, validating}`
combined. `/ts-discover explore <id>` is blocked if the limit is already
reached — finish or defer an in-flight idea first.

### Stale Rule

After **3** `keep-learning` decisions on the same idea
(`keep_learning_count >= 3`), `/ts-discover status` flags it `stale` and
surfaces it for a forced decision (`build` / `kill` / `reduce-scope`).

### Dedup (for `--from-router` entries)

Before creating a new entry from `/ts-discover idea --from-router`, normalize
the incoming `description` (lowercase, strip punctuation) and compare token
sets (Jaccard similarity) against the `title` of every existing entry
regardless of status. If similarity > 0.5 with an existing entry:
- Do NOT create a new entry.
- Append to that entry's `notes`:
  `"duplicate feedback received from <source_epic> on <date>"`.

---
