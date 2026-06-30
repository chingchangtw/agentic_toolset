# Scenario S1: BUGFIX + HIGH autonomy

**Fixture:** `fixtures/iteration-state/bugfix-high.json`

## Setup

Load iteration state from `fixtures/iteration-state/bugfix-high.json`.
Epic type: bugfix. Autonomy dial: HIGH.
Phase spine: Think → Build → Ship (lean 3-phase).

## Steps

1. Run hook with fixture loaded into CLAUDE_PROJECT_DIR.
2. Verify state reflects active Delivery phase.
3. Advance through Think phase — agent proceeds without prompting user (HIGH autonomy).
4. Advance to Build phase — agent proceeds automatically.
5. Advance to Ship phase — complete and close epic.

## Assertions

    assert: .active_phase == "Delivery"
    assert: .dial == "HIGH"
    assert_hook_contains: "[WORKFLOW STATE] ts-deliver phase: think"
    assert_phase_not_in_history: "Plan"
    assert_phase_not_in_history: "Review"
    assert_phase_not_in_history: "Test"

## Notes

- HIGH autonomy: agent auto-advances between phases without user prompts.
- Lean spine: Plan, Review, Test are NOT in phase history for bugfix type.
- G1 and G2 gates NOT required for bugfix lean path.
