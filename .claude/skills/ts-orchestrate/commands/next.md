# /ts-orchestrate:next

Advance to the next phase in the current epic's phase spine.

## Behavior

1. Read current phase from `[WORKFLOW STATE]` hook output.
2. Determine next phase from the work type's phase spine (SKILL.md → Workflow
   Routing; canonical Gate Rules table also in SKILL.md).
3. Check gate requirements per SKILL.md's Gate Rules table:
   - If current phase is Think and the work type requires G1 (feature,
     refactor, epic): verify G1 is signed. If not, output [BLOCKED] and stop.
   - If current phase is Ship and the work type requires G2 (epic, ops,
     security-related patch): verify G2 is signed. If not, output [BLOCKED]
     and stop.
4. If gates pass, advance `current_phase` in ts-deliver-router/state.json.
   - Spike: final phase is Reflect, not Ship — write a learning entry to
     discovery.json first, then `/ts-iteration:next` (no gate).
   - Types without Reflect (feature, bugfix, hotfix, chore, patch, ops): after
     Ship, go straight to `/ts-iteration:next`.
5. Output updated `[WORKFLOW STATE]` with [NEXT] instructions.

## Gate Rules

**G1 and G2 CANNOT be auto-signed at ANY autonomy level (HIGH, MID, or LOW).**

Gate sign-off always requires explicit human confirmation. If a gate is pending, output:

```
[BLOCKED] <gate-name> gate not signed. Human sign-off required before advancing.
```

## Usage

```
/ts-orchestrate:next
```

## Notes

- Run `/ts-orchestrate:status` first to confirm current state.
- Spines and gates: see SKILL.md → Workflow Routing / Gate Rules (canonical).
