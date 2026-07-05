# Proposal — refactor-hook-guidance-table

## Why

User-reported readability problem (2026-07-05): `src/hook/inject-workflow-state.sh`'s
"algorithm is hard to read and if-else is complicated. It should be easy enough to
follow the table: 'Workflow Guidance'."

The script implements `ts-orchestrate/SKILL.md`'s 14-row Workflow Guidance table
(7 Discovery states + 7 Delivery phases), but the table is buried in control flow:
a 60-line `if/elif` wraps everything, three guard checks sit inline as anonymous
4-line blocks, the spike-reflect variant nests an `if/else` inside a case arm, and
the Discovery focus-idea jq chain is visually disconnected from the Discovery rows
it feeds. D9 accepts this file as a manual executable copy of the guidance table —
which makes legibility of the copy the whole ballgame, and today a reviewer cannot
diff the two by eye.

## What Changes

Structure-only rewrite of `src/hook/inject-workflow-state.sh`:

- Three inline guard blocks become named early-exit functions:
  `check_schema_version`, `check_dry_run`, `check_g2_gate`.
- Two flat lookup functions — `next_for_delivery` (case on `"$phase:$epic_type"`
  compound key; `reflect:spike` and `reflect:*` are sibling arms, no nesting) and
  `next_for_discovery` (case on focus status). One case arm per Workflow Guidance
  row, each arm tagged with an end-of-line comment naming its SKILL.md row.
- Discovery focus-idea selection extracted to a `focus_idea` helper.
- Track selection shrinks to a thin bottom-of-file dispatch — the only `if/elif`
  remaining.

## Non-Goals

- Any output change. Byte-identical stdout is the acceptance contract; the 24
  existing tests (hook-output 21 + gate-enforcement 3) must pass unedited.
- Runtime parsing of SKILL.md (D9 duplication stays; this makes it legible, not
  mechanical).
- The missing hook↔SKILL.md lockstep test (separate open item, Ideas.md §14).
- The `.ps1` hooks (no PowerShell counterpart of this hook exists).

## Impact

- `src/hook/inject-workflow-state.sh` — rewritten in place, single commit.
- No spec deltas: `openspec/specs/workflow-state-hook` and
  `openspec/specs/gate-enforcement-tests` describe observable behavior, which is
  unchanged; both remain accurate as written.
- Dogfood mirror + release zip pick the file up via regeneration (never hand-edited).
