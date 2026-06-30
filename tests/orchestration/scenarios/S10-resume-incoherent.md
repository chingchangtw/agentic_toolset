# Scenario S10: Resume with Incoherent State

**Note: Human/LLM execution only — NOT in CI loop.**

## Setup

Manually create an iteration state where:
- `active_phase` = "Delivery"
- `active_epic` = null (no active epic assigned)

This is an incoherent state: the system is in Delivery mode but has no epic to deliver.

## Steps

1. Set up CLAUDE_PROJECT_DIR with iteration.json where `active_epic` is null and a ts-deliver-router/state.json exists.
2. Run `/ts-orchestrate:resume` (or trigger hook directly).
3. Observe: hook detects the incoherent gap (active_phase=Delivery but active_epic=none).
4. Surface guided repair: hook outputs [NEXT] directing user to assign an active epic.

## Assertions

    assert_hook_contains: "[NEXT]"

## Expected Behavior

The hook should surface a [NEXT] instruction directing the user to repair the state
by either assigning an active epic or resetting to Discovery phase.

## Notes

- This scenario cannot be run automatically because it requires manual state manipulation.
- Covers edge case: operator error leaving system in Delivery mode without an epic.
