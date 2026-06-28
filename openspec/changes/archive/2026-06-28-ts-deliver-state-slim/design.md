## Context

The ts-deliver-router uses `.ai/ts-deliver-router/state.json` as the single source of truth for phase tracking. The router reads this file on every invocation. As a project progresses, two arrays in the file grow without bound: `phase_history` (one entry per phase transition) and `ingest_log` (one entry per ingest trigger). The `gates` object also accumulates full `checklist_results` per gate check.

Every router invocation loads the full file into agent context. For a project that has completed 5 phases with 3 ingests, the file may already carry hundreds of tokens of history that the router never consults for routing decisions — `current_phase` and `gates.status` are the only fields used in the hot path.

## Goals / Non-Goals

**Goals:**
- Reduce token cost of routine router invocations by removing history arrays from `state.json`
- Preserve full audit trail via `history.jsonl`
- Keep atomic write semantics for `state.json`
- Keep staleness detection (mtime comparison) working unchanged

**Non-Goals:**
- No change to gate sign-off logic, security gates, or DRY-RUN mode
- No automatic migration of existing `state.json` files
- No change to how `/ts-deliver:status` renders current phase (only `--history` reads the new file)
- No change to SKILL.md algo beyond step 2 (read) and step 6 (write)

## Decisions

### Slim state.json schema — drop history arrays, keep checklist_results

`phase_history` and `ingest_log` move to `history.jsonl`. `checklist_results` stays in `state.json` because gate enforcement (step 5, security gates) reads individual checklist items to verify completion — removing it would require a second file read.

**Rejected alternative**: move `checklist_results` to `history.jsonl` too. Would require the router to read `history.jsonl` on every gate check, defeating the purpose.

### history.jsonl — append-only, not read during routing

One JSON object per line. The router appends on phase exit; never reads during step 2. `/ts-deliver:status --history` reads it on demand.

**Rejected alternative**: separate per-phase history files. Adds file management complexity with no token benefit (the router never reads them anyway).

### Append is non-atomic — acceptable for audit trail

`history.jsonl` is observability data, not truth. A crash between `state.json` rename and `history.jsonl` append produces a missing history entry but leaves routing state consistent. The staleness rule (artifact mtime > state.json mtime) continues to use `state.json` as the reference.

**Rejected alternative**: atomic replace for `history.jsonl` too. Overkill for non-truth data; adds write complexity.

### No migration of existing state.json files

Old format files (with `phase_history`/`ingest_log` inline) remain readable. The router writes slim format on next phase exit. The schema_version field stays at "1" — no version bump needed because the slim format is a strict subset of the current schema (arrays absent = treated as empty).

**Rejected alternative**: bump schema_version and add a migration step. Unnecessary complexity for a backward-compatible subset.

## Implementation Contract

**Slim state.json shape** (post-change):
```json
{
  "schema_version": "1",
  "current_phase": "<phase>",
  "phase_entered_at": "<ISO8601>",
  "artifacts": { "<phase>": { "<key>": "<value>", "complete": false } },
  "gates": {
    "<gate_id>": {
      "status": "pending|passed|signed_off|failed",
      "checklist_results": { "<item>": false },
      "signed_by": "<name>",
      "signed_at": "<ISO8601>"
    }
  }
}
```
Fields `phase_history` and `ingest_log` are absent. No other fields change.

**history.jsonl event shapes**:
- Phase exit: `{"event":"phase_exit","ts":"<ISO8601>","from":"<phase>","to":"<phase>","artifacts_at_exit":{}}`
- Ingest trigger: `{"event":"ingest","ts":"<ISO8601>","triggered_from":"<phase>","delta_path":"<path>","resumed_to":"<phase>"}`
- Gate result: `{"event":"gate_result","ts":"<ISO8601>","gate_id":"<id>","status":"passed|signed_off|failed","signed_by":"<name>"}`

**Router behavior changes**:
- Step 2 (read): reads only `state.json`. Does NOT read `history.jsonl`. Behavior otherwise identical.
- Step 6 (write): atomically writes slim `state.json` (write-tmp → rename), then appends one `phase_exit` event to `history.jsonl`. If `history.jsonl` write fails, log a warning but do NOT fail the phase exit.
- `/ts-deliver:status --history`: reads `history.jsonl` and renders a phase transition table. Without `--history` flag: unchanged behavior (no `history.jsonl` read).

**Acceptance criteria**:
- `state.json` written by step 6 contains no `phase_history` or `ingest_log` keys
- `history.jsonl` gains exactly one new line per phase exit
- A router invocation on a project with 10 completed phases reads a `state.json` no larger than one with 1 completed phase
- Staleness detection (`artifact mtime > state.json mtime → STALE`) continues to work correctly
- DRY-RUN: `state.json` read-only (unchanged); `history.jsonl` append announced as `would append <path>`, not executed

**Scope boundaries**:
- In scope: `state.md` schema section, phase exit contract section, staleness rule (verify unchanged), router algo steps 2 and 6, `commands.md` `/ts-deliver:status --history` flag
- Out of scope: gate enforcement logic, sign-off flow, security gates, SKILL.md sections other than algo steps 2 and 6

## Risks / Trade-offs

- [History entry missing on crash between state write and history append] → Acceptable. History is audit trail only; routing continues correctly from `state.json`.
- [Old state.json files with inline history] → Non-issue. Router reads `current_phase` and `gates` — both present in old format. Next phase exit overwrites with slim format.
- [history.jsonl grows without bound over a very long project] → Out of scope for this change. History file is read only on demand, not on every invocation. Future trim policy can be added independently.
