# Scenario S2: BUGFIX + MID autonomy

**Fixture:** `fixtures/iteration-state/bugfix-mid.json`

## Setup

Load iteration state from `fixtures/iteration-state/bugfix-mid.json`.
Epic type: bugfix. Autonomy dial: MID.
Phase spine: Think → Build → Ship (lean 3-phase).

## Steps

1. Run hook with fixture loaded into CLAUDE_PROJECT_DIR.
2. Verify state reflects active Delivery phase with MID dial.
3. Think phase — agent recommends next action, waits for user confirmation.
4. Build phase — agent prompts user before advancing (MID: recommend mode).
5. Ship phase — user explicitly advances to complete epic.

## Assertions

    assert: .active_phase == "Delivery"
    assert: .dial == "MID"
    assert_hook_contains: "[WORKFLOW STATE] ts-deliver phase: think"
    assert_phase_not_in_history: "Plan"
    assert_phase_not_in_history: "Review"
    assert_phase_not_in_history: "Test"

## Notes

- MID autonomy: agent recommends, user confirms each phase advance.
- Lean spine preserved: G1/G2 not required for bugfix.
