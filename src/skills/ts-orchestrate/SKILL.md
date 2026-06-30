# ts-orchestrate

Passive orchestration skill. Reads `[WORKFLOW STATE]` context injected by the Epic 1 hook (`inject-workflow-state.sh`). Does not read raw state files directly.

## Entry Gate

If hook output shows `active epic: none`, the system has no active epic.

**Action:** Direct user to `/ts-project:plan --new`. Refuse `/ts-deliver:init`.

```
[BLOCKED] No active epic in iteration.json.active_epic.
Run /ts-project:plan --new to create one.
```

## Routing by Epic Type

Read `epic.type` from iteration.json. Route to the correct phase spine:

| Epic Type | Phase Spine | Gates Required |
|---|---|---|
| `bugfix` | Think → Build → Ship | None (lean path) |
| `refactor` | Think → Plan → Build → Review → Ship → Reflect | G1 (Think→Plan) |
| `epic` | Think → Plan → Build → Review → Test → Ship → Reflect | G1 (Think→Plan) + G2 (Ship) |

## Gate Rules

- G1 (threat-model sign-off): Required for `refactor` and `epic`. Blocks Think→Plan transition. **NEVER auto-signed at any autonomy level.**
- G2 (sec-review sign-off): Required for `epic` only. Blocks at Ship phase. **NEVER auto-signed at any autonomy level.**

## Feedback Loop

After epic completion (Reflect phase), write feedback to `discovery.json`:

1. Mark epic status `"done"` in iteration.json.
2. Add entry to discovery.json with `source_epic` field referencing the completed epic id.
3. Run `/ts-iteration:next` (or `/ts-iteration:close` if last epic in release).
4. Discovery resumes with the completed epic as context.

## Commands

- `/ts-orchestrate:start` — entry point; sets active_epic + dial, routes to phase spine
- `/ts-orchestrate:status` — cross-layer view (Discovery + Delivery)
- `/ts-orchestrate:next` — enforced phase advancement with gate checks

## Autonomy Levels

| Level | Behavior |
|---|---|
| HIGH | Auto-advance after gate sign-off; never auto-sign gates |
| MID | Recommend next action; user confirms phase advances |
| LOW | Wait for explicit user command at every step |
