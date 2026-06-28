## Summary

Split `state.json` into a slim current-state file and an append-only `history.jsonl` to reduce token cost on every router invocation.

## Motivation

The router reads `.ai/ts-deliver-router/state.json` on every invocation (algo step 2). As a project progresses, `state.json` grows — `phase_history` accumulates one entry per phase transition, `ingest_log` accumulates one entry per ingest, and `gates` accumulates full checklist results. Every router invocation reads the full file into agent context, burning tokens proportional to project age.

Splitting removes unbounded-growth arrays from the hot read path. Routine invocations read only the slim current-state file. History remains fully queryable via `history.jsonl` when needed.

## Proposed Solution

**Slim `state.json`** — retain only fields needed for routing decisions:
- `schema_version`
- `current_phase`
- `phase_entered_at`
- `artifacts` (current phase artifact pointers and completion flags)
- `gates` (current gate statuses — status field only, drop `checklist_results`)

**New `history.jsonl`** — append-only event log at `.ai/ts-deliver-router/history.jsonl`:
- One JSON line per event: phase transitions, gate results, ingest triggers
- Schema: `{"event": "phase_exit|gate_result|ingest", "ts": "<ISO8601>", ...event-specific fields}`
- Never read during routine routing; read only by `/ts-deliver:status --history` and ingest resolution

**Phase exit contract update:**
- Atomic write to slim `state.json` (write-tmp → rename, unchanged behavior)
- Append one event line to `history.jsonl` (non-atomic append is acceptable — history is audit trail, not truth)

**Router algo step 2 update:**
- Read only slim `state.json`
- Staleness rule unchanged: `artifact mtime > state.json mtime → STALE`

## Non-Goals

- No change to gate sign-off logic or security gates
- No change to DRY-RUN behavior
- No migration of existing `state.json` files (old format remains readable; new writes use slim format)
- `/ts-deliver:status` without `--history` flag does NOT read `history.jsonl`

## Alternatives Considered

**Trim on write (cap history arrays)**: simpler but loses full audit trail. Rejected — history has no bounded size in a long-running project.

**Keep single file**: status quo. Rejected — token cost grows unboundedly with project age.

## Impact

- Affected specs: ts-deliver-router-secondary-backfill (state schema), ts-deliver-router-jump (state write contract)
- Affected code:
  - Modified: `src/skills/ts-deliver-router/rawfiles/references/state.md`
  - Modified: `src/skills/ts-deliver-router/rawfiles/references/commands.md`
  - Modified: `src/skills/ts-deliver-router/SKILL.md`
  - Modified: `.agents/skills/ts-deliver-router/SKILL.md`
