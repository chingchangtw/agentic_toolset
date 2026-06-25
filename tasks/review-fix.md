## Fix: Code Review Findings 1-4 (ts-* hooks)

Four targeted fixes across three files from code review of `src/hook/ts-*`.

---

### Finding 1 — `ts-statusline_wrapper.sh`: missing `.sh` bridge fallback

**File**: `src/hook/ts-statusline_wrapper.sh`

Replace the hard-coded `.sh` bridge call with an existence check that falls back to `.py`:

```bash
if [ -f "${HOOKS_DIR}/ts-statusline_bridge.sh" ]; then
    CTX=$(echo "$RAW" | sh "${HOOKS_DIR}/ts-statusline_bridge.sh" 2>/dev/null)
else
    CTX=$(echo "$RAW" | python3 "${HOOKS_DIR}/ts-statusline_bridge.py" 2>/dev/null)
fi
```

Rationale: `ts-statusline_bridge.sh` does not yet exist. `||` chaining is unsafe (non-zero exit on parse error also triggers fallback). Explicit existence check is unambiguous.

---

### Finding 2 — `ts-statusline_bridge.ps1:24`: UTF-8 BOM breaks Python `json.loads`

**File**: `src/hook/ts-statusline_bridge.ps1`, line 24

`Set-Content -Encoding UTF8` writes a BOM on Windows PowerShell 5.1. The state file is read by `ts-session-guard.py` via `json.loads()`, which rejects BOM-prefixed content.

Replace:
```powershell
Set-Content -Path $stateFile -Value (ConvertTo-Json @{ context_pct = $ctxPct }) -Encoding UTF8
```

With:
```powershell
[System.IO.File]::WriteAllText($stateFile, (ConvertTo-Json @{ context_pct = $ctxPct }), [System.Text.UTF8Encoding]::new($false))
```

Note: the ANSI colored dot change (lines 27-36) is intentional and unrelated — do not touch it.
Pattern already used in `ts-statusline_wrapper.ps1` for the same reason.

---

### Finding 3 — `ts-statusline_bridge.py:17`: `float(None)` TypeError on null `used_percentage`

**File**: `src/hook/ts-statusline_bridge.py`, line 17

`.get("used_percentage", 0)` returns `None` when the key is present with a null value (default only fires on key absence). `float(None)` raises `TypeError`, falls into except, state file not written.

Change:
```python
ctx_pct = round(float(data.get("context_window", {}).get("used_percentage", 0)), 1)
```

To (combined with Finding 4 fix below):
```python
ctx_window = data.get("context_window", {})
ctx_raw = ctx_window.get("used_percentage")
if ctx_raw is None:
    cur = ctx_window.get("current_tokens", 0)
    mx  = ctx_window.get("max_tokens", 0)
    ctx_raw = (cur / mx * 100) if mx else 0
ctx_pct = round(float(ctx_raw or 0), 1)
```

---

### Finding 4 — `ts-statusline_bridge.py:17`: no token-count fallback when `used_percentage` absent

**File**: `src/hook/ts-statusline_bridge.py`, line 17

The diff removed the `current_tokens / max_tokens` fallback. The `.ps1` bridge still has it. When Claude Code omits `used_percentage` but provides token counts, the `.py` bridge writes `ctx_pct = 0` and the session guard never fires.

Fix is merged with Finding 3 above — restoring the explicit fallback block handles both.
