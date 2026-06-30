# Scenario S8: EPIC + MID autonomy

**Fixture:** `fixtures/iteration-state/epic-mid.json`

## Setup

Load iteration state from `fixtures/iteration-state/epic-mid.json`.
Epic type: epic. Autonomy dial: MID.
Phase spine: Think → Plan → Build → Review → Test → Ship → Reflect (7-phase).

## Steps

1. Run hook with fixture loaded into CLAUDE_PROJECT_DIR.
2. Verify state reflects active Delivery phase with MID dial.
3. Think phase — G1 required and blocks; agent recommends, user confirms.
4. Human provides G1 sign-off. User advances to Plan.
5. Build, Review, Test — agent recommends each phase advance; user confirms.
6. Ship phase — G2 required and blocks; human sign-off required.
7. Human provides G2 sign-off. User advances to Reflect, closes epic.

## Assertions

    assert: .active_phase == "Delivery"
    assert: .dial == "MID"
    assert_hook_contains: "[WORKFLOW STATE] ts-deliver phase: think"

## Notes

- MID autonomy: G1 and G2 block at their respective gates; human must sign both.
- User confirms each phase transition in recommend mode.
