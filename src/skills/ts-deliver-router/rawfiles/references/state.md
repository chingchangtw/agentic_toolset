# module: state (truth, not inference)

Loaded when: reading/verifying/writing `.ai/ts-deliver-router/state.json` (algo steps 0,2,6).

`.ai/ts-deliver-router/state.json` is written by each phase on exit, read by the router every invoke.
The router NEVER infers phase from artifacts on disk.

## Schema (v1)
```json
{
  "schema_version": "1",
  "current_phase": "think|plan|build|review|test|ship|reflect",
  "phase_entered_at": "ISO8601",
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
  }
}
```

`phase_history` and `ingest_log` are NOT stored in `state.json`. They are appended to `history.jsonl` (see below). Old files containing these arrays remain readable; the router ignores them and writes slim format on next phase exit.

## history.jsonl

`.ai/ts-deliver-router/history.jsonl` is an append-only audit log. One JSON object per line. Never read during routine routing (algo step 2). Read only by `/ts-deliver:status --history` and ingest resolution.

Event shapes:
```json
{"event":"phase_exit","ts":"<ISO8601>","from":"<phase>","to":"<phase>","artifacts_at_exit":{}}
{"event":"ingest","ts":"<ISO8601>","triggered_from":"<phase>","delta_path":"<path>","resumed_to":"<phase>"}
{"event":"gate_result","ts":"<ISO8601>","gate_id":"<id>","status":"passed|signed_off|failed","signed_by":"<name>"}
```

## Phase exit contract
Every phase on exit MUST:
1. Write artifacts to documented paths.
2. Set `artifacts.<phase>.complete = true` ONLY after min-schema passes (edge-tests.md).
3. Update `gates.<id>.status` + `checklist_results` for every gate in that phase.
4. Set `current_phase = <next>`, set `phase_entered_at`.
5. Atomically replace `.ai/ts-deliver-router/state.json` (write tmp → rename). The written file MUST NOT contain `phase_history` or `ingest_log` keys.
6. Append one `phase_exit` event to `.ai/ts-deliver-router/history.jsonl` (non-atomic). If the append fails, emit a warning and continue — history failure does NOT abort the phase exit.
No exit if any phase-gate is not `passed` or `signed_off`.

Old `state.json` files containing `phase_history` or `ingest_log` inline remain readable. No migration required; the router ignores those arrays and overwrites with slim format on next phase exit.

Expanded examples aligned to this schema: `references/phase-exit-contracts.md`.

## Staleness rule
STALE if any declared artifact mtime > state.json mtime →
`"phase unclear, manual review: <artifact> changed after last state write"`. STOP.

## Schema mismatch
`schema_version` ≠ "1" → `"phase unclear, manual review: state schema version mismatch"`.

## DRY-RUN disk behavior
state.json = READ-ONLY. Phase transitions simulated in memory, never written.
history.jsonl append announced as `[DRY-RUN] would append .ai/ts-deliver-router/history.jsonl`; not executed.
File writes announced `would write <path>`; no actual write.
Network calls announced; not made. DRY-RUN REPORT → chat only, never disk. Not persisted.
