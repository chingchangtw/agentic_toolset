# Scenario S3: BUGFIX + LOW autonomy

**Fixture:** `fixtures/iteration-state/bugfix-low.json`

## Setup

Load iteration state from `fixtures/iteration-state/bugfix-low.json`.
Epic type: bugfix. Autonomy dial: LOW.
Phase spine: Think → Build → Ship (lean 3-phase).

## Steps

1. Run hook with fixture loaded into CLAUDE_PROJECT_DIR.
2. Verify state reflects active Delivery phase with LOW dial.
3. Think phase — agent waits for explicit user instruction at every step.
4. User explicitly says "proceed to Build".
5. Build phase — agent waits again.
6. User explicitly says "proceed to Ship".
7. Ship — complete epic on explicit user command.

## Assertions

    assert: .active_phase == "Delivery"
    assert: .dial == "LOW"
    assert_hook_contains: "[WORKFLOW STATE] ts-deliver phase: think"
    assert_phase_not_in_history: "Plan"
    assert_phase_not_in_history: "Review"
    assert_phase_not_in_history: "Test"

## Notes

- LOW autonomy: every phase transition requires explicit user command.
- Still lean spine (bugfix type): skips Plan, Review, Test.
