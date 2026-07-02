# reference: router commands

## `/ts-deliver init`

Initializes project router state and project registry.

Writes:
- `.agents/ts-deliver-router/registry.json`
- `.agents/ts-deliver-router/state.json`
- `.agents/ts-deliver-router/autonomy` (if missing)

Required outputs:
- selected lifecycle stage
- active/optional/pending-setup tools
- gate thresholds

## `/ts-deliver refine`

Refines project registry based on phase history and gate outcomes.

Writes:
- updated `.agents/ts-deliver-router/registry.json`
- append entry to `.agents/ts-deliver-router/registry.log`

Required prompts:
- promote/demote tool tier
- adjust thresholds
- lifecycle stage update

## `/ts-deliver status`

Read-only summary, no phase transition.

Must show:
- current phase
- autonomy
- active checks
- pending setup gaps
- next gate

Does NOT read `history.jsonl`.

### `/ts-deliver status --history`

Reads `.agents/ts-deliver-router/history.jsonl` and renders a phase transition table.

Must show:
- All rows from `history.jsonl` with event type `phase_exit`
- Columns: timestamp, from-phase, to-phase
- If `history.jsonl` does not exist, show: "No phase history recorded yet."

Does NOT show the current-phase summary (use `/ts-deliver status` without the flag for that).

## `/ts-deliver dry-run [on|off]`

Toggles simulation mode.

In dry-run:
- commands and side effects are described, not executed
- state writes refused
- sign-off refused
