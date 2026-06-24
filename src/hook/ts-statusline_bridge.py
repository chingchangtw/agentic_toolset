#!/usr/bin/env python3
"""
statusline_bridge.py  —  Claude Code StatusLine script
Reads the stdin JSON from Claude Code, extracts context %,
writes it to a state file for session_guard.py to consume.
Also prints a formatted status line to stdout.
"""

import json
import os
import sys
from pathlib import Path

# USERPROFILE = Windows, HOME = Linux/macOS; avoid Path.home() which breaks on domain/OneDrive setups
_home = os.environ.get("USERPROFILE") or os.environ.get("HOME")
state_file = (Path(_home) if _home else Path.home()) / ".claude" / "session_guard_state.json"

try:
    data = json.load(sys.stdin)
    ctx_raw = data.get("context_window", {}).get("used_percentage", 0)
    ctx_pct = round(float(ctx_raw or 0), 1)
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