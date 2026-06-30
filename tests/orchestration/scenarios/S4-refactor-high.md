# Scenario S4: REFACTOR + HIGH autonomy

**Fixture:** `fixtures/iteration-state/refactor-high.json`

## Setup

Load iteration state from `fixtures/iteration-state/refactor-high.json`.
Epic type: refactor. Autonomy dial: HIGH.
Phase spine: Think → Plan → Build → Review → Ship → Reflect (6-phase).

## Steps

1. Run hook with fixture loaded into CLAUDE_PROJECT_DIR.
2. Verify state reflects active Delivery phase with HIGH dial.
3. Think phase — G1 threat-model sign-off required before advancing (human must sign, even at HIGH).
4. Plan phase — auto-advances after G1 signed.
5. Build phase — agent proceeds automatically.
6. Review phase — auto-advances after review complete.
7. Ship phase — auto-advances after ship tasks done.
8. Reflect phase — closes epic with retrospective.

## Assertions

    assert: .active_phase == "Delivery"
    assert: .dial == "HIGH"
    assert_hook_contains: "[WORKFLOW STATE] ts-deliver phase: think"
    assert_phase_not_in_history: "Test"

## Notes

- HIGH autonomy: auto-advances after G1 sign-off is obtained.
- G1 IS required for refactor (unlike bugfix lean path).
- Test phase NOT in refactor spine — excluded.
