# Scenario S9: EPIC + LOW autonomy

**Fixture:** `fixtures/iteration-state/epic-low.json`

## Setup

Load iteration state from `fixtures/iteration-state/epic-low.json`.
Epic type: epic. Autonomy dial: LOW.
Phase spine: Think → Plan → Build → Review → Test → Ship → Reflect (7-phase).

## Steps

1. Run hook with fixture loaded into CLAUDE_PROJECT_DIR.
2. Verify state reflects active Delivery phase with LOW dial.
3. Think phase — agent waits for user command; G1 required.
4. User provides G1 sign-off. User explicitly says "proceed to Plan".
5. Plan — user explicitly advances.
6. Build, Review, Test — every phase requires explicit user command.
7. Ship — G2 required; user provides sign-off then explicitly advances.
8. Reflect — user explicitly closes epic.

## Assertions

    assert: .active_phase == "Delivery"
    assert: .dial == "LOW"
    assert_hook_contains: "[WORKFLOW STATE] ts-deliver phase: think"

## Notes

- LOW autonomy: full human control at every step.
- G1 and G2 both required, both human-signed.
- All 7 phases present in history (full epic spine).
