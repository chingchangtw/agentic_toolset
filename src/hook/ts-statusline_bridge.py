#!/usr/bin/env python3
"""
statusline_bridge.py  —  Claude Code StatusLine script
Reads the stdin JSON from Claude Code, extracts context %,
writes it to a state file for session_guard.py to consume.
Also prints a formatted status line to stdout.
"""

import json
import sys
from pathlib import Path

state_file = Path.home() / ".claude" / "session_guard_state.json"

try:
    data = json.load(sys.stdin)
    ctx_win = data.get("context_window") or {}
    ctx_raw = ctx_win.get("used_percentage")
    if ctx_raw is None:
        cur = ctx_win.get("current_tokens") or 0
        mx = ctx_win.get("max_tokens") or 0
        ctx_raw = cur / mx * 100 if mx else 0
    ctx_pct = round(float(ctx_raw), 1)
    model_field = data.get("model", "unknown")
    model = model_field.get("display_name", "unknown") if isinstance(model_field, dict) else model_field

    # Persist for hook
    state_file.write_text(
        json.dumps({"context_pct": ctx_pct}),
        encoding="utf-8"
    )

    # Format status bar emoji
    if ctx_pct >= 85:
        icon = "🔴"
    elif ctx_pct >= 70:
        icon = "🟡"
    else:
        icon = "🟢"

    print(f"{icon} {ctx_pct}% ctx | {model}", flush=True)

except Exception:
    print("[ status unavailable ]", flush=True)