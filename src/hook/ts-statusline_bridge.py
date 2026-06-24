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
    used   = data.get("num_tokens_in_context_window", 0)
    window = data.get("max_tokens_in_context_window", 1)
    ctx_pct = round((used / window) * 100, 1) if window else 0
    model  = data.get("model", "unknown")

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