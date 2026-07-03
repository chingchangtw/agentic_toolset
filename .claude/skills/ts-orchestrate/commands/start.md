# /ts-orchestrate:start

Entry point for beginning a new delivery epic.

## Parameters

- `WORK_TYPE`: `EPIC | REFACTOR | BUGFIX` — the type of work to be done
- `AUTONOMY`: `HIGH | MID | LOW` — how autonomously the agent proceeds

## Behavior

1. Validate `WORK_TYPE` and `AUTONOMY` are provided.
2. Write `active_epic` to `iteration.json` (or prompt user to select/create one).
3. Write `dial` to `iteration.json` based on `AUTONOMY` parameter.
4. Route to correct phase spine based on `WORK_TYPE`:
   - `BUGFIX` → lean spine (Think → Build → Ship)
   - `REFACTOR` → 6-phase spine (Think → Plan → Build → Review → Ship → Reflect)
   - `EPIC` → 7-phase spine (Think → Plan → Build → Review → Test → Ship → Reflect)
5. Initialize ts-deliver-router/state.json with `current_phase: "think"`.
6. Output `[WORKFLOW STATE]` context for current phase.

## Usage

```
/ts-orchestrate:start WORK_TYPE=BUGFIX AUTONOMY=MID
```

## Notes

- If no epic exists in iteration.json, create one via `/ts-project:plan` first.
- Gate requirements are determined by WORK_TYPE (see SKILL.md routing table).
- G1 and G2 gates always require human sign-off regardless of AUTONOMY.
