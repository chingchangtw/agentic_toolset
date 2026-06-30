# Scenario S6: REFACTOR + LOW autonomy

**Fixture:** `fixtures/iteration-state/refactor-low.json`

## Setup

Load iteration state from `fixtures/iteration-state/refactor-low.json`.
Epic type: refactor. Autonomy dial: LOW.
Phase spine: Think → Plan → Build → Review → Ship → Reflect (6-phase).

## Steps

1. Run hook with fixture loaded into CLAUDE_PROJECT_DIR.
2. Verify state reflects active Delivery phase with LOW dial.
3. Think phase — agent waits; G1 required before any advance.
4. User provides G1 sign-off. User explicitly says "proceed to Plan".
5. Plan — user explicitly advances each step.
6. Build, Review, Ship, Reflect — every phase requires explicit user command.

## Assertions

    assert: .active_phase == "Delivery"
    assert: .dial == "LOW"
    assert_hook_contains: "[WORKFLOW STATE] ts-deliver phase: think"
    assert_phase_not_in_history: "Test"

## Notes

- LOW autonomy: every phase requires explicit user command.
- G1 required and human-signed (same as MID/HIGH but with explicit user advances too).
