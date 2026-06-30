# Orchestration Test Harness

## Running Scenarios

Run a single scenario:

```bash
bash scripts/run-scenario.sh S1
```

Run all CI scenarios (S1-S9):

```bash
for id in S1 S2 S3 S4 S5 S6 S7 S8 S9; do
  bash scripts/run-scenario.sh $id
done
```

The runner outputs TAP version 14. Exit 0 = all assertions pass. Exit 1 = any failure.

## Fixture Schema Contract

Each `fixtures/iteration-state/<type>-<dial>.json` file must contain all required iteration fields:

```
REQUIRED_ITERATION_FIELDS = [
  "project",
  "release",
  "release_goal",
  "epics",
  "active_epic",
  "iteration_start",
  "writer_lock",
  "active_phase",
  "dial"
]
```

These fields are also validated by `src/tests/unit/state-schema.test.ts`. Any unplanned schema drift causes a test failure in CI.

## CI vs Human-Only Scenarios

| Scenario | Type | In CI |
|---|---|---|
| S1 — BUGFIX + HIGH | Automated | ✓ |
| S2 — BUGFIX + MID | Automated | ✓ |
| S3 — BUGFIX + LOW | Automated | ✓ |
| S4 — REFACTOR + HIGH | Automated | ✓ |
| S5 — REFACTOR + MID | Automated | ✓ |
| S6 — REFACTOR + LOW | Automated | ✓ |
| S7 — EPIC + HIGH | Automated | ✓ |
| S8 — EPIC + MID | Automated | ✓ |
| S9 — EPIC + LOW | Automated | ✓ |
| S10 — Resume incoherent state | Human/LLM only | ✗ |
| S11 — Feedback loop | Human/LLM only | ✗ |
| S12 — Gate bypass attempt | Human/LLM only | ✗ |

S10-S12 require multi-step state manipulation that the bash runner cannot perform in isolation. They are written as BDD specs for human or LLM-assisted execution.
