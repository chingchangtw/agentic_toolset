#!/usr/bin/env bash
# One status line = caveman bar + ctx bridge bar.
# Bridge also writes session_guard_state.json (consumed by ts-session-guard.py).
HOOKS_DIR="${HOME}/.claude/hooks"
RAW=$(cat)
if [ -f "${HOOKS_DIR}/ts-statusline_bridge.sh" ]; then
    CTX=$(echo "$RAW" | sh "${HOOKS_DIR}/ts-statusline_bridge.sh" 2>/dev/null)
else
    CTX=$(echo "$RAW" | python3 "${HOOKS_DIR}/ts-statusline_bridge.py" 2>/dev/null)
fi
CAVE=$(echo "$RAW" | sh "${HOOKS_DIR}/caveman-statusline.sh" 2>/dev/null)
printf '%s | %s\n' "$CAVE" "$CTX"
