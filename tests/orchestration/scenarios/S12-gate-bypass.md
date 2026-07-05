# Scenario S12: Gate Bypass Attempt (EPIC type)

**Note: Human/LLM execution only — NOT in CI loop.**

## Setup

Load `fixtures/iteration-state/epic-high.json` (or any epic-type fixture).
Set ts-deliver-router/state.json with:
- `current_phase`: "ship"
- `gates`: `{"G2": {"status": "pending"}}`

## Steps

1. Set up CLAUDE_PROJECT_DIR with the epic fixture and state.json configured as above.
2. Run hook directly: `CLAUDE_PROJECT_DIR="$TEST_WORKSPACE" bash src/hook/inject-workflow-state.sh`
3. Observe: hook detects unsigned G2 gate at Ship phase and outputs [BLOCKED].
4. Verify Ship is blocked and user is prompted to complete G2 sign-off.

## Assertions

    assert_hook_contains: "[BLOCKED] Ship blocked: G2 (sec-review) gate not signed"

## Expected Behavior

The hook MUST output `[BLOCKED] Ship blocked: G2 (sec-review) gate not signed` when:
- current_phase is "ship"
- gates["G2"]["status"] is "pending"

This is the primary guard against bypassing G2 for epic-type work.

## Notes

- This is the most critical gate enforcement scenario.
- The automated version of this test is in `src/tests/unit/gate-enforcement.test.ts` (edge case 3).
- This BDD spec covers the full end-to-end context including the human workflow around the block.
