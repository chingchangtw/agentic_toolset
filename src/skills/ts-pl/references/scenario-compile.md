# Scenario Compilation

Keep legacy `commands[]`, `domain_events[]`, and `aggregates[]` string arrays
unchanged. Add exact versioned relations:

```json
{
  "ownership_relations_v1": [
    { "command": "Start Loan", "aggregate": "Loan", "event": "Loan Started" }
  ]
}
```

Every command and event must occur in exactly one relation; every aggregate,
command, and event reference must exactly match its legacy array value.

Generate deterministic OpenSpec skeletons:

```text
node src/scripts/gen-scenarios.mjs --input <exploration.json>
```

Check completed OpenSpec `THEN` clauses separately:

```text
node src/scripts/gen-scenarios.mjs --input <exploration.json> --scenarios <spec.md> --format json
```

Generation does not claim completed event coverage. Coverage mode exits 1 and
names each legacy event absent from completed `THEN` clauses.

