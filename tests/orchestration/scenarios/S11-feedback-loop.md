# Scenario S11: Epic Completion Feedback Loop

**Note: Human/LLM execution only — NOT in CI loop.**

## Setup

Start with an active epic in iteration.json that is about to be marked complete.
Ensure discovery.json exists and does not yet have a `source_epic` entry for this epic.

## Steps

1. Complete the epic (mark status = "done" in iteration.json).
2. Trigger `/ts-iteration:next` or `/ts-orchestrate:next` to advance.
3. Observe: system writes a feedback entry to discovery.json with `source_epic` field.
4. Verify discovery.json now contains the completed epic as a feedback source.

## Assertions

    assert: .epics[] | select(.id == "auth-epic-001") | .status == "done"

## Expected Behavior

After epic completion, the orchestration system should write a feedback entry to
discovery.json linking the completed epic so that future discovery sessions can
reference what was built.

## Notes

- This scenario requires multi-step state manipulation across two files.
- Covers the Layer 1 feedback loop: Delivery → Discovery.
- Cannot be automated in the bash runner (cross-file state mutation required).
