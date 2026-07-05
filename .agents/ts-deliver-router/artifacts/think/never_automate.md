# Think — Never-Automate List: EPIC-GOLDEN-TEMPLATES

Explicit, enumerated irreversible or destructive operations this epic MUST
NOT perform automatically, under any DIAL level.

1. **Overwriting an existing target file.** If any of the 5 golden
   filenames already exists in the target project, the advisor SHALL NOT
   write to it directly under any circumstance — not even with matching
   content. The only path is a MODIFY recommendation task, which a human
   approves through the advisor's existing task-execution flow.

2. **Auto-approving a MODIFY task.** Every MODIFY recommendation is a
   `PROJECT_INIT_PLAN.md` task subject to the plan's existing per-task
   approval gate. HIGH autonomy does not bypass this — golden-template
   MODIFY tasks are not exempted from the plan's approval requirement.

3. **Silently dropping content during gap analysis.** If the gap-analysis
   step cannot confidently distinguish intentional user customization from
   missing golden content (the top M-risk from Discovery), it MUST surface
   the ambiguity in the recommendation rather than guess and silently
   recommend a destructive replacement.

4. **Publishing a release with an unsynced or drifted golden set.** The
   parity gate failing the build is the enforcement mechanism — there is no
   override flag to bypass it and ship anyway.

## Blast-radius bounds

- Direct-create touches at most 5 specific, named files, only under the
  absent-file guard. No wildcard writes, no directory-wide operations.
- MODIFY recommendations are read-only analysis + task emission; the actual
  file write (if the human approves the task) happens through the advisor's
  existing, already-audited task-execution path — not new write code
  introduced by this epic.

## Recovery path

Every operation in this epic's scope is naturally recoverable:
- Direct-create only ever writes a **new** file — recovery is deleting it
  (git tracks it; nothing pre-existing is touched).
- MODIFY is a **recommendation only** in this epic's scope — no write
  happens without a separate, human-approved task action, so there is
  nothing for this epic's own code to need to recover from.

No operation in this epic's actual scope is irreversible in the traditional
sense (no deletion, no overwrite, no external side effect). This is a
direct consequence of the v2/v3 pivot away from automated merge.
