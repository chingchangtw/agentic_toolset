# Scenario S5: REFACTOR + MID autonomy

**Fixture:** `fixtures/iteration-state/refactor-mid.json`

## Setup

Load iteration state from `fixtures/iteration-state/refactor-mid.json`.
Epic type: refactor. Autonomy dial: MID.
Phase spine: Think → Plan → Build → Review → Ship → Reflect (6-phase).

## Steps

1. Run hook with fixture loaded into CLAUDE_PROJECT_DIR.
2. Verify state reflects active Delivery phase with MID dial.
3. Think phase — agent recommends actions, G1 blocks advancement until human signs.
4. User provides G1 sign-off.
5. Plan, Build, Review — agent recommends at each phase, user confirms advances.
6. Ship, Reflect — user confirms each step.

## Assertions

    assert: .active_phase == "Delivery"
    assert: .dial == "MID"
    assert_hook_contains: "[WORKFLOW STATE] ts-deliver phase: think"
    assert_phase_not_in_history: "Test"

## Notes

- MID autonomy: G1 gate blocks at Think→Plan boundary; human must sign.
- Agent recommends but does not auto-advance between phases.
