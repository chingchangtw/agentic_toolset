# /ts-orchestrate:start

Entry point for beginning work of any type, on either track.

## Parameters

- `WORK_TYPE`: `FEATURE | BUGFIX | HOTFIX | REFACTOR | CHORE | PATCH | SPIKE | POC | OPS`
- `AUTONOMY`: `HIGH | MID | LOW` — how autonomously the agent proceeds

## Behavior

1. Validate `WORK_TYPE` and `AUTONOMY` are provided.
2. Write `dial` to `iteration.json` based on `AUTONOMY` (all work types, both tracks).
3. **Discovery entry** — if `WORK_TYPE=POC`, or `WORK_TYPE=FEATURE` with no
   validated idea in discovery.json: do NOT write `active_epic`, do NOT create
   ts-deliver-router/state.json. Route to `/ts-discover` (idea → explore → …,
   per SKILL.md Workflow Routing) and stop here.
4. **Delivery entry** — all other cases: write `active_epic` to `iteration.json`
   (or prompt user to select/create one via `/ts-project:plan`).
5. Route to the phase spine for the work type (see SKILL.md → Workflow Routing;
   spines are defined in `src/utils/phase-routing.ts`).
6. Initialize ts-deliver-router/state.json with the spine's first phase
   (lower-cased, e.g. `"think"`; chore/patch start at `"build"`).
7. Output `[WORKFLOW STATE]` context for the current phase.

## Usage

```
/ts-orchestrate:start WORK_TYPE=BUGFIX AUTONOMY=MID
/ts-orchestrate:start WORK_TYPE=POC AUTONOMY=LOW
```

## Notes

- Routing and gate tables live in SKILL.md (single source — do not duplicate here).
- G1/G2 always require human sign-off regardless of AUTONOMY.
- If no epic exists in iteration.json for a Delivery work type, create one via
  `/ts-project:plan` first (Entry Gate, SKILL.md).
