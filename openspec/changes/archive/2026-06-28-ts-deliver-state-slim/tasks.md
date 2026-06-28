## 1. Update state.json Schema Definition

- [x] 1.1 Implement the "slim state.json schema — drop history arrays, keep checklist_results" decision: remove `phase_history` and `ingest_log` from the state.json schema in `src/skills/ts-deliver-router/rawfiles/references/state.md` so the slim schema section no longer documents those arrays. This satisfies the "Slim state.json schema excludes history arrays" requirement. Verify: the schema JSON block in state.md contains no `phase_history` or `ingest_log` keys.

- [x] 1.2 Implement the "history.jsonl — append-only, not read during routing" decision: add `history.jsonl` event schema to `src/skills/ts-deliver-router/rawfiles/references/state.md` documenting the three event shapes (`phase_exit`, `ingest`, `gate_result`) with all required fields. This satisfies the "history.jsonl captures phase transitions" requirement. Verify: the state.md file contains a `history.jsonl` section with each event shape and its fields defined.

- [x] 1.3 Implement the "append is non-atomic — acceptable for audit trail" decision and the "no migration of existing state.json files" decision: update the phase exit contract in `src/skills/ts-deliver-router/rawfiles/references/state.md` so step 4 appends to `history.jsonl` instead of writing `phase_history` and `ingest_log` inline. The contract SHALL state: atomic write to slim `state.json` first, then non-atomic append to `history.jsonl`; if the append fails, emit a warning and continue. Old state.json files with inline history remain readable without migration. Verify: the phase exit contract steps in state.md no longer reference `phase_history` or `ingest_log` as output fields; step appending to `history.jsonl` is present with the non-fatal failure note.

## 2. Update Router Algorithm References

- [x] 2.1 Update router algo step 2 description in `src/skills/ts-deliver-router/SKILL.md` to state that it reads only `state.json` and SHALL NOT read `history.jsonl`. This satisfies the "Router step 2 reads only state.json" requirement. Verify: step 2 in SKILL.md explicitly states only `state.json` is read and contains no reference to `phase_history`, `ingest_log`, or `history.jsonl`.

- [x] 2.2 Update router algo step 6 description in `src/skills/ts-deliver-router/SKILL.md` to state the two-step write: atomic `state.json` replace followed by `history.jsonl` append (non-fatal on failure). Verify: step 6 in SKILL.md describes both the `state.json` atomic write and the `history.jsonl` append with the non-fatal failure note.

- [x] 2.3 Mirror the same algo step 2 and step 6 changes in `.agents/skills/ts-deliver-router/SKILL.md` to keep the agents copy consistent. Verify: both SKILL.md files contain identical step 2 and step 6 descriptions.

## 3. Add --history Flag to Status Command

- [x] 3.1 Add `--history` flag documentation to the `/ts-deliver:status` command entry in `src/skills/ts-deliver-router/rawfiles/references/commands.md` to satisfy the "ts-deliver:status --history reads history.jsonl" requirement. The flag SHALL cause the command to read `history.jsonl` and render a phase transition table (columns: timestamp, from-phase, to-phase). Without the flag the command SHALL NOT read `history.jsonl`. Verify: commands.md contains a `--history` flag entry for `/ts-deliver:status` with the described rendering behavior.

## 4. DRY-RUN Behavior

- [x] 4.1 Add a DRY-RUN note to `src/skills/ts-deliver-router/rawfiles/references/state.md` DRY-RUN section stating that `history.jsonl` append is announced as `[DRY-RUN] would append .ai/ts-deliver-router/history.jsonl` and not executed. This satisfies the "DRY-RUN announces history.jsonl append without executing" requirement. Verify: the DRY-RUN section in state.md contains the announced-not-executed behavior for `history.jsonl`.

## 5. Staleness Rule Verification

- [x] 5.1 Confirm the staleness rule in `src/skills/ts-deliver-router/rawfiles/references/state.md` is unchanged: `artifact mtime > state.json mtime → STALE`. No edit needed if already correct; task is complete when a reviewer confirms the rule is unmodified. Verify: staleness rule in state.md reads `artifact mtime > state.json mtime → STALE` with no reference to `history.jsonl`.
