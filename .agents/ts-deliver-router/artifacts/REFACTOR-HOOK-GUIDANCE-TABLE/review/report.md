# Review report — REFACTOR-HOOK-GUIDANCE-TABLE

Date: 2026-07-06 · commit 02d6e88

## Scope-proportionate review

Single-file, mechanical, behavior-preserving refactor. Already exhaustively
verified at Build (22 byte-diffed scenarios, 24 unedited tests, pilot PASS).
An 8-agent code-review pass would be disproportionate to the change surface —
did a focused manual audit instead, targeting the risk classes a structural
bash refactor actually introduces.

## Findings: none

Checked specifically for:
- **SC2155-class bugs** (`local x=$(cmd)` masking the command's exit status)
  — avoided everywhere; every function declares `local` on its own line,
  then assigns separately (design.md D-E).
- **`set -e`/`set -u` interaction** — every command substitution keeps its
  original `||` fallback (`|| true`, `|| exit 0`, `|| var="default"`);
  `local var` without an initializer is empty-but-set in bash, not unbound,
  so no `set -u` risk was introduced by extracting `focus` into a local.
- **`exit` inside functions** — confirmed bash semantics: `exit 0` inside
  `check_schema_version`/`check_dry_run`/`check_g2_gate` terminates the whole
  process, not just the function, matching the original inline blocks.
- **Compound case-key matching** (`"$1:$2"` against `reflect:spike` /
  `reflect:*`) — empty `epic_type` produces `"reflect:"`, which the `*` glob
  correctly matches; verified live for both branches at Build.
- **Quoting/injection surface** — unchanged from the original: `$id` in
  `next_for_discovery` is the same value the original script echoed, same
  quoting discipline, no new interpolation point.

## Gate

No Test phase in the refactor spine, no G2 (D6 — refactor requires G1 only).
Review gate: passed by this manual audit; nothing carried forward.
