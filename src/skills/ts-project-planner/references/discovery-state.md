## Discovery State Machine
`.agents/discovery.json` — Discovery backlog. All `/ts-discover` commands operate on this.
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
`source_epic` non-null → entry from `--from-router` (ts-deliver-router feedback path).
**WIP Limit:** Max 3 in `{exploring, validating}`. `/ts-discover explore` blocked at limit.
**Stale:** `keep_learning_count >= 3` → flagged in `/ts-discover status`, forced decision required.
**Dedup (`--from-router`):** Jaccard similarity > 0.5 vs existing titles → no new entry; append duplicate note to matched entry instead.
