# Scenario S7: EPIC + HIGH autonomy

**Fixture:** `fixtures/iteration-state/epic-high.json`

## Setup

Load iteration state from `fixtures/iteration-state/epic-high.json`.
Epic type: epic. Autonomy dial: HIGH.
Phase spine: Think → Plan → Build → Review → Test → Ship → Reflect (7-phase).

## Steps

1. Run hook with fixture loaded into CLAUDE_PROJECT_DIR.
2. Verify state reflects active Delivery phase with HIGH dial.
3. Think phase — G1 required; agent cannot auto-sign even at HIGH autonomy.
4. Human provides G1 sign-off. Agent advances to Plan automatically after sign.
5. Build, Review, Test — agent auto-advances.
6. Ship phase — G2 (sec-review) required; agent cannot auto-sign.
7. Human provides G2 sign-off. Reflect phase completes epic.

## Assertions

    assert: .active_phase == "Delivery"
    assert: .dial == "HIGH"
    assert_hook_contains: "[WORKFLOW STATE] ts-deliver phase: think"

## Notes

- HIGH autonomy: G1 AND G2 are NEVER auto-signed at any autonomy level for epic type.
- Full 7-phase spine: all phases present in history.
- Gate bypass attempt at Ship → [BLOCKED] (see S12).
