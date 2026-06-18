## Why

The ts-deliver-router has no explicit mechanism to jump to a specific phase. After a context break or mid-project reset, users must re-invoke the router and wait for state detection — there is no direct "go to Build" command. A dedicated `/ts-deliver:jump <phase>` command solves this with a safe, gate-validated phase transition.

## What Changes

- New slash command `/ts-deliver:jump <phase>` added to ts-deliver-router
- Forward jumps replay all gates sequentially from current phase to target; any blocked gate halts the jump with a report
- Backward jumps are allowed without gate replay (rework/pivot scenario) with a warning
- G1 and G2 remain non-bypassable regardless of jump direction or autonomy level
- New stub file `.claude/commands/ts-deliver/jump.md` registers the command in Claude Code
- `references/commands.md` gains a `/ts-deliver jump` section with full contract
- `SKILL.md` quick reference and LOAD INDEX updated to include the jump command

## Non-Goals

- Jump does NOT skip G1/G2 security gates under any circumstance
- Jump does NOT validate artifact content quality — only gate check status
- Jump does NOT add phase-specific entry-point logic beyond what the router already does at each phase
- No new phase logic is introduced; jump only changes `current_phase` in state.json

## Capabilities

### New Capabilities

- `ts-deliver-router-jump`: Phase-targeted jump command with sequential gate replay for the ts-deliver-router skill

### Modified Capabilities

(none)

## Impact

- Affected specs: ts-deliver-router-jump (new)
- Affected code:
  - New: `.claude/commands/ts-deliver/jump.md`
  - Modified: `src/skills/ts-deliver-router/references/commands.md`
  - Modified: `src/skills/ts-deliver-router/SKILL.md`
