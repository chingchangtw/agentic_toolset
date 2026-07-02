# reference: router commands

## `/ts-deliver init`

Initializes project router state and project registry.

Writes:
- `.ai/ts-deliver-router/registry.json`
- `.ai/ts-deliver-router/state.json`
- `.ai/ts-deliver-router/autonomy` (if missing)

Required outputs:
- selected lifecycle stage
- active/optional/pending-setup tools
- gate thresholds

Interview question — muscle agents:
Ask: "Muscle agents? (copilot / codex / antigravity / none)"
- Named agent(s) → set `"extensions": { "agent_scaffold": true }` in `registry.json`; load `references/agent-scaffold.md`; generate initial `.agent/` scaffold.
- "none" → set `"extensions": { "agent_scaffold": false }`; skip scaffold generation.

## `/ts-deliver refine`

Refines project registry based on phase history and gate outcomes.

Writes:
- updated `.ai/ts-deliver-router/registry.json`
- append entry to `.ai/ts-deliver-router/registry.log`

Required prompts:
- promote/demote tool tier
- adjust thresholds
- lifecycle stage update

Agent scaffold detection:
If `collection[]` contains any `type="agent"` entry without a corresponding `.agent/<id>/` directory AND `extensions.agent_scaffold` is currently `false`, prompt: "Enable agent scaffold? Y/N".
- Y → set `extensions.agent_scaffold: true`; load `references/agent-scaffold.md`; generate missing `.agent/<id>/` directories.
- N → leave `agent_scaffold: false`; skip scaffold generation.

## `/ts-deliver status`

Read-only summary, no phase transition.

Must show:
- current phase
- autonomy
- active checks
- pending setup gaps
- next gate

## `/ts-deliver jump`

Jump to a target phase, replaying gate checks as required.

Syntax: `/ts-deliver jump <phase>`
Valid phases: `Think | Plan | Build | Review | Test | Ship | Reflect` (case-insensitive)

Validation:
- Invalid phase name → list valid phases, STOP.
- Same phase as current → no-op, show phase status.

Forward jump (target ahead of current):
- Replay every gate between current phase and target in sequential order.
- Any gate not passed → report which gate blocked and what is missing, STOP. Do not partial-advance state.json.
- G1 and G2 still require 100% checklist + human sign-off even in HIGH autonomy.

Backward jump (target behind current):
- Allowed without gate replay — re-entering an earlier phase is valid (rework, pivot).
- Warn: "Jumping back to <phase>. Advancing forward again will require gate re-checks."

Writes (on success):
- `.ai/ts-deliver-router/state.json` — updates `current_phase` to target

Required output:
- Gate replay summary (each gate checked: ✓ pass / ✗ blocked)
- Confirmation: "Jumped to <phase>." + active checks for that phase

Dry-run: describes gate replay and state.json write without executing either. Prefixes output `[DRY-RUN]`.

## `/ts-deliver dry-run [on|off]`

Toggles simulation mode.

In dry-run:
- commands and side effects are described, not executed
- state writes refused
- sign-off refused
