#!/usr/bin/env python3
"""
session_guard.py  —  Claude Code UserPromptSubmit hook
Warns when: message count > 10  OR  context usage > 70%
Cross-platform: macOS + Win11 (Git Bash / WSL / PowerShell via python3)
"""

import json
import sys
import os
from pathlib import Path

# ── Thresholds (edit freely) ──────────────────────────────────────────────
MSG_WARN     = 10   # warn after this many turns
CTX_YELLOW   = 70   # % — advisory warning
CTX_RED      = 85   # % — strong warning

# ── Read hook payload from stdin ──────────────────────────────────────────
try:
    payload = json.load(sys.stdin)
except Exception:
    sys.exit(0)   # never break the session

transcript_path = payload.get("transcript_path", "")

# ── Count messages from transcript JSONL ─────────────────────────────────
msg_count = 0
try:
    p = Path(transcript_path)
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            try:
                entry = json.loads(line)
                if entry.get("type") == "message":
                    msg_count += 1
            except Exception:
                continue
except Exception:
    pass

# ── Read context % from StatusLine state file (written by statusline script)
# Falls back to 0 if not available — hook still works for message count.
ctx_pct = 0
state_file = Path.home() / ".claude" / "session_guard_state.json"
try:
    if state_file.exists():
        state = json.loads(state_file.read_text(encoding="utf-8"))
        ctx_pct = float(state.get("context_pct", 0))
except Exception:
    pass

# ── Build warnings ────────────────────────────────────────────────────────
warnings = []

if msg_count >= MSG_WARN:
    warnings.append(
        f"⚠️  TURNS: {msg_count} messages in this session. "
        f"Consider /compact or start a new session."
    )

if ctx_pct >= CTX_RED:
    warnings.append(
        f"🚨 CONTEXT: {ctx_pct:.0f}% used — CRITICAL. Run /compact now."
    )
elif ctx_pct >= CTX_YELLOW:
    warnings.append(
        f"⚠️  CONTEXT: {ctx_pct:.0f}% used. Plan to /compact soon."
    )

# ── Output via additionalContext (injected into Claude's context) ─────────
if warnings:
    banner = "\n".join(warnings)
    output = {
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": banner
        }
    }
    print(json.dumps(output))

sys.exit(0)