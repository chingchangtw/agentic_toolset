# Externalized Judgment — Rubric Skeleton

Adapt these to the actual harness rather than copying verbatim; the point is the *shape* (concrete trigger + positive example + negative example), not these exact words.

## 1. When to escalate to a stronger model
- **Trigger:** Same subtask failed twice consecutively at the current tier, OR the task requires synthesizing across >[N] sources/files with no single clear answer, OR the task is explicitly flagged high-risk (security, irreversible action, user-facing publish).
- **Good:** "Attempted the migration script twice, both times the same schema-mismatch error → escalating with full error trace attached."
- **Bad:** "This seems hard, escalating." (No concrete trigger — could apply to anything.)

## 2. When a task is truly complete
- **Trigger:** All acceptance criteria from the delegation are independently verified (not self-reported) AND no known follow-up work is silently missing.
- **Good:** "Marked complete after a fresh-context read-back confirmed the file exists, matches the spec, and the linked test passed."
- **Bad:** "Looks done to me." (No independent verification.)

## 3. When to stop and ask the user
- **Trigger:** A required fact can't be verified and isn't safe to assume (model names/versions, credentials, irreversible/destructive actions, genuinely ambiguous taste calls with no rubric coverage).
- **Good:** "Could not verify which model ID is bound to the 'fast' tier in this environment — stopping to ask rather than guessing from training data."
- **Bad:** Silently picking a plausible-sounding model name and proceeding.

## 4. Signals requiring a pivot, not a retry
- **Trigger:** The same class of error recurs across different approaches (not just the same approach twice), OR the acceptance criteria themselves turn out to be unsatisfiable as written, OR each retry is making unrelated things worse.
- **Good:** "Three different implementation approaches all hit the same underlying API limitation → pivoting to ask whether the acceptance criteria should change, not retrying a fourth approach."
- **Bad:** Retrying the same fix a fifth time with minor variations, hoping one sticks.

## 5. How to verify a quality floor
- **Trigger:** Before marking any deliverable done, run at least one verification method appropriate to its type — see mapping below.
- **Mapping:**
  - Files/docs → fresh-context read-back against the original spec.
  - Code → execution/tests, not just a visual diff read.
  - High-risk judgment calls → second opinion or multi-answer jury voting, not single-pass self-assessment.
- **Good:** "Ran the read-back agent against the new CLAUDE.md and confirmed line-count limits and all referenced paths resolve."
- **Bad:** "I wrote it carefully, so it should be fine."
