# module: edge-tests (min-schema + must-pass edge cases)

Loaded when: verifying artifact min-schema (algo step 3) or debugging a mis-route.

## Minimum-schema per artifact
- `think.framing` — file exists, non-empty.
- `think.never_automate` — file exists, non-empty list.
- `plan.spec` — required sections: problem, capabilities, design, risks.
- `plan.scenarios` — every scenario block has Given AND When AND Then.
- `build` — tasks_total > 0 AND tasks_done == tasks_total for complete=true.
- `review.report` — file exists, non-empty.
- `test.acceptance` ∈ {pass,na}; `test.integration` ∈ {pass,na} for complete=true.
- `ship.merged = true` for complete=true.

## Edge cases (all must pass)
1. **Half-written spec** — current_phase=`plan`, scenarios.md 3/5 missing Then.
   → `"phase unclear, manual review: scenarios.md missing Then in <ids>"`. MUST NOT advance to Build.
2. **Stale state** — current_phase=`build`, spec.md mtime > state.json mtime.
   → `"phase unclear, manual review: spec.md changed after last state write"`.
3. **Unsigned security gate** — current_phase=`ship`, gates.sec-review.status=`pending`.
   → `"Ship blocked: sec-review gate not signed"`.
4. **HIGH auto-sign attempt** — HIGH at G2, checklist 100%. → still pauses for human. HIGH never auto-signs.
5. **Ingest mid-Build** — spec change triggers ingest. → append `state.ingest_log[]`, active ingest flag,
   Build resumes after delta + scope-recheck.
6. **Schema version mismatch** — schema_version ≠ "1".
   → `"phase unclear, manual review: state schema version mismatch"`.
7. **Dry-run sign-off attempt** — sign G2 while dry-run on.
   → `"[DRY-RUN] cannot sign security gate in dry-run mode"`. No write to state.gates.
