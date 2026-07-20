# Task Delegation Prompt Templates

Each template bakes in the three required elements (Objective & Motivation, Acceptance Criteria, Report Format) so a delegating model can't accidentally omit one. Copy the relevant block, fill the blanks, and hand it to the assigned model/subagent at the model+effort level specified in the Model Orchestration Guidelines.

---

## Search

```
OBJECTIVE & MOTIVATION: Find [what specifically] within [scope: repo/dir/docs/web] because [why this is needed for the current deliverable].

ACCEPTANCE CRITERIA:
- Every match includes a file:line_number (or URL) reference — no unsourced claims.
- Report absence explicitly if nothing is found; do not infer or guess.
- Stop after [N] results / [time budget] if the search space is unbounded.

REPORT FORMAT: A list of findings as `path:line` or URL + one-sentence relevance note each. No full file contents. If findings exceed [N] lines, save to [scratch file path] and return only that path.
```

## Implementation

```
OBJECTIVE & MOTIVATION: Implement [specific change] in [file/module] so that [behavioral outcome], because [why].

ACCEPTANCE CRITERIA:
- [Concrete, testable condition 1, e.g. "function X returns Y for input Z"]
- [Concrete, testable condition 2, e.g. "existing tests in [test file] still pass"]
- No unrelated files modified.
- Back up [file] to [backup path] before editing, or write to a new file if the harness rule requires it.

REPORT FORMAT: Diff summary (not full diff unless <[N] lines) + which acceptance criteria passed/failed + path to any backup made.
```

## Refactoring

```
OBJECTIVE & MOTIVATION: Refactor [target] to [structural goal, e.g. "remove duplication between X and Y"] without changing external behavior, because [why].

ACCEPTANCE CRITERIA:
- Behavior is unchanged — verified by [test suite / manual check / read-back], not by the refactoring agent's own say-so.
- Before/after both saved (backup rule applies).
- No scope creep beyond the named target.

REPORT FORMAT: What changed structurally, what verification method confirmed behavior parity, and the backup file path.
```

## Research

```
OBJECTIVE & MOTIVATION: Investigate [question] to inform [decision this feeds into], because [why the decision needs it].

ACCEPTANCE CRITERIA:
- Findings are sourced (file:line, URL, or explicit "unconfirmed").
- Conflicting information is reported as conflicting, not silently resolved.
- Recommendation (if any) is clearly separated from raw findings.

REPORT FORMAT: 3-5 bullet findings with sources, one explicit "confidence: high/medium/low/unconfirmed" per bullet, optional 1-sentence recommendation.
```

## Review

```
OBJECTIVE & MOTIVATION: Review [artifact] for [specific concern: correctness / security / consistency / weak-model-readability], because [why it matters before shipping].

ACCEPTANCE CRITERIA:
- Every issue found includes location + why it's an issue + suggested fix.
- Explicitly state if no issues were found — silence is not an acceptable report.
- Do not fix issues found during review unless separately instructed — review and implementation are different delegations.

REPORT FORMAT: Numbered issue list (location, description, suggested fix) or explicit "no issues found — checked for [list of concerns]".
```
