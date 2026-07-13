# /ts-orchestrate:status

Cross-layer status view showing both Discovery and Delivery state.

## Behavior

1. Read `[WORKFLOW STATE]` block from hook output (injected per-turn).
2. Read `discovery.json` for Discovery layer state.
3. Output unified status view.

## Output Format

```
## Orchestration Status

### Discovery
WIP: <count> ideas in progress
Next: <oldest unvalidated idea or "none">

### Delivery
Active epic: <active_epic id or "none">
Current phase: <current_phase from [WORKFLOW STATE]>
Dial: <autonomy level>
Pending gates: <G1 / G2 / none>
```

## Usage

```
/ts-orchestrate:status
```

## Notes

- Discovery WIP count comes from discovery.json (ideas with status != "done" and != "rejected").
- Delivery state comes from the `[WORKFLOW STATE]` hook injection — do NOT read state files directly.
- If no active epic: show "Active epic: none" and suggest `/ts-orchestrate:start`.
