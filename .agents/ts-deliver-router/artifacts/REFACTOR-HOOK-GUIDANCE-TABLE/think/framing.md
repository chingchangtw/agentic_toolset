# Think — REFACTOR-HOOK-GUIDANCE-TABLE

Date: 2026-07-05 · WORK_TYPE: refactor · Spine: Think → Plan[G1] → Build → Review → Ship → Reflect

## Goal (one sentence)

Restructure `src/hook/inject-workflow-state.sh` so a reader can hold it next to
`ts-orchestrate/SKILL.md`'s Workflow Guidance table and see a 1:1 mapping —
without changing a single byte of output.

## Problem (user-reported, 2026-07-05)

"Algorithm hard to read and if-else is complicated. It should be easy enough
to follow the table: 'Workflow Guidance'."

Concretely, the current 74-line script interleaves four concerns inside one
`if/elif` and buries the guidance table inside control flow:

1. **Track selection** (`if state.json exists / elif iteration.json exists`)
   wraps everything — 60 lines live inside its branches.
2. **Guard checks** (schema version, dry-run, G2 gate) sit inline between the
   phase read and the output, each a 4-line `if` block with its own jq call.
3. **Delivery `[NEXT]` dispatch** is a case block, but the spike-reflect
   branch nests another `if/else` inside a case arm — 2 levels deep.
4. **Discovery focus-idea selection** is a 7-line jq priority chain + bash
   tab-splitting + a second case block, visually disconnected from the
   Discovery rows of the guidance table it implements.

The Workflow Guidance table has 14 rows (7 Discovery states + 7 Delivery
phases). A reader should find 14 recognizable rows in the script. Today they
find control flow.

## Target shape (design direction — detailed spec is Plan-phase work)

```bash
# ── guards (each a named function, early-exit) ──────────────────────────
check_schema_version   # [BLOCKED] on mismatch
check_dry_run          # [DRY-RUN] refusal at ship
check_g2_gate          # [BLOCKED] unsigned G2 at ship

# ── guidance tables (one flat case per track; rows mirror SKILL.md) ─────
next_for_delivery()    # case: think|plan|build|review|test|ship|reflect
                       #   (reflect takes epic_type arg — spike branch is a
                       #    case pattern "reflect:spike", not a nested if)
next_for_discovery()   # case: idea|exploring|validating|ready|*

# ── track dispatch (the ONLY if/elif, at the bottom, 3 lines per branch) ─
if   delivery state → guards; emit state line; next_for_delivery
elif iteration only → emit state line; focus_idea; next_for_discovery
```

Key moves:
- Guards become named functions with the block reason in the name — the
  reader skims 3 function names instead of parsing 12 lines of inline jq.
- The spike-reflect nesting dissolves by dispatching on a compound key
  (`"$PHASE:$EPIC_TYPE"` style or a dedicated `reflect` helper) so every
  guidance row is exactly one case arm.
- Each case arm gets an end-of-line comment naming its SKILL.md table row,
  making the D9 manual-lockstep duplication *visible* at the point of copy.
- Track dispatch shrinks to a thin bottom-of-file `main`-style block.

## Invariants (non-negotiable)

- **Byte-identical stdout for every input.** The 24 existing tests
  (hook-output 21 + gate-enforcement 3) are the regression harness and must
  pass **unedited**. If a test needs changing, the refactor is wrong.
- `set -euo pipefail` survives; every new construct stays `||`-guarded or is
  a parameter expansion (same discipline as today — hook must never crash a
  session).
- Silent-on-error contract unchanged: missing files/jq/malformed JSON → empty
  or degraded output, exit 0.
- Prompt-injection stance unchanged: no free-text fields echoed, enum values
  and IDs only.
- No new dependencies, no external config file, no sourcing of other files —
  the hook stays a single self-contained bash script (install surface
  unchanged).

## Explicitly out of scope

- Making the hook *read* SKILL.md at runtime (bash can't parse the table
  robustly; D9 already accepted executable-copy duplication).
- The missing hook↔SKILL.md lockstep *test* (tracked as idea-002 follow-up /
  Ideas.md §14 open item — separate change, this refactor only makes the
  duplication legible).
- Any output wording changes, however tempting.
- The `.ps1` hooks (no PowerShell counterpart exists for this hook).

## G1 threat-model (refactor scope)

- **Data flows:** unchanged — reads the same 3 JSON files
  (`state.json`, `iteration.json`, `discovery.json`), writes stdout only.
  STRIDE: no new Spoofing/Tampering/Repudiation/Info-disclosure/DoS/EoP
  surface; Tampering posture identical (same jq parsing, same `||` guards).
- **Privacy:** no PII read or emitted, before or after. Free-text
  suppression rule preserved by the byte-identical invariant.
- **Auth:** N/A — local hook, no boundary.
- **Never-automate:** the two output classes that pause humans —
  `[BLOCKED]` (schema, G2) and `[DRY-RUN]` refusal — must survive verbatim;
  they are the hook's contribution to gate enforcement. Enumerated: (1) G2
  pending at ship → BLOCKED; (2) schema mismatch → BLOCKED; (3) dry-run at
  ship → refusal. All three covered by gate-enforcement tests.
- **Blast radius:** one file, `src/hook/inject-workflow-state.sh`; propagates
  only via dogfood mirror and release zip, both regenerated (never
  hand-edited).
- **Recovery:** `git revert` of a single commit; `npm run dogfood:rollback`
  restores the mirror snapshot; last-known-good zip path exists
  (`dogfood:restore-lkg`).
