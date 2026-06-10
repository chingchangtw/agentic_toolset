# module: state (truth, not inference)

Loaded when: reading/verifying/writing `.router/state.json` (algo steps 0,2,6).

`.router/state.json` is written by each phase on exit, read by the router every invoke.
The router NEVER infers phase from artifacts on disk.

## Schema (v1)
```json
{
  "schema_version": "1",
  "current_phase": "think|plan|build|review|test|ship|reflect",
  "phase_entered_at": "ISO8601",
  "phase_history": [
    {"phase":"<p>","entered_at":"<t>","exited_at":"<t>","artifacts_at_exit":{}}
  ],
  "artifacts": {
    "think":   {"framing":"<path>","capabilities":"<path>","never_automate":"<path>","complete":false},
    "plan":    {"spec":"<path>","scenarios":"<path>","complete":false},
    "build":   {"tasks_done":0,"tasks_total":0,"complete":false},
    "review":  {"report":"<path>","complete":false},
    "test":    {"acceptance":"pass|fail|na","integration":"pass|fail|na","complete":false},
    "ship":    {"release_notes":"<path>","merged":false},
    "reflect": {"retro":"<path>","complete":false}
  },
  "gates": {
    "<gate_id>": {
      "status":"pending|passed|signed_off|failed",
      "checklist_results":{"<item>":false},
      "signed_by":"<name>",
      "signed_at":"ISO8601"
    }
  },
  "ingest_log": [
    {"triggered_at":"<t>","triggered_from":"<phase>","delta_path":"<path>","resumed_to":"<phase>"}
  ]
}
```

## Phase exit contract
Every phase on exit MUST:
1. Write artifacts to documented paths.
2. Set `artifacts.<phase>.complete = true` ONLY after min-schema passes (edge-tests.md).
3. Update `gates.<id>.status` + `checklist_results` for every gate in that phase.
4. Set `current_phase = <next>`, append `phase_history`, set `phase_entered_at`.
5. Atomically replace `.router/state.json` (write tmp → rename).
No exit if any phase-gate is not `passed` or `signed_off`.

## Staleness rule
STALE if any declared artifact mtime > state.json mtime →
`"phase unclear, manual review: <artifact> changed after last state write"`. STOP.

## Schema mismatch
`schema_version` ≠ "1" → `"phase unclear, manual review: state schema version mismatch"`.

## DRY-RUN disk behavior
state.json = READ-ONLY. Phase transitions simulated in memory, never written.
ingest_log not appended. File writes announced `would write <path>`; no actual write.
Network calls announced; not made. DRY-RUN REPORT → chat only, never disk. Not persisted.
