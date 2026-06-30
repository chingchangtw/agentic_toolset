# /ts-orchestrate:next

Advance to the next phase in the current epic's phase spine.

## Behavior

1. Read current phase from `[WORKFLOW STATE]` hook output.
2. Determine next phase from epic type's phase spine.
3. Check gate requirements:
   - If current phase is Think and epic type requires G1: verify G1 is signed. If not, output [BLOCKED] and stop.
   - If current phase is Ship and epic type is "epic": verify G2 (sec-review) is signed. If not, output [BLOCKED] and stop.
4. If gates pass, advance `current_phase` in ts-deliver-router/state.json.
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
- For bugfix epics (lean path): no gates required, advance freely.
- For refactor epics: G1 required at Think→Plan boundary only.
- For epic-type epics: G1 required at Think→Plan, G2 required at Ship boundary.
