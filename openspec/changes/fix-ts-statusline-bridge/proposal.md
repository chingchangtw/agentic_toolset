## Problem

Four bugs in the `ts-statusline` hook bridge files cause silent failures: incorrect shell fallback logic in the wrapper, UTF-8 BOM corruption in the PS1 state file, `TypeError` on null `used_percentage` in the Python bridge, and a missing token-count fallback that the PS1 bridge retains but the Python bridge lost.

## Root Cause

1. `ts-statusline_wrapper.sh` calls `ts-statusline_bridge.sh` unconditionally; that file does not exist, so every invocation fails silently.
2. `ts-statusline_bridge.ps1` uses `Set-Content -Encoding UTF8` which emits a BOM on Windows PowerShell 5.1; `json.loads()` in `ts-session-guard.py` rejects BOM-prefixed JSON.
3. `ts-statusline_bridge.py` calls `.get("used_percentage", 0)` which returns `None` when the key is present with a null value; `float(None)` raises `TypeError` and the state file is never written.
4. The Python bridge lost the `current_tokens / max_tokens` fallback path that the PS1 bridge still has; Claude Code sometimes omits `used_percentage` and provides token counts instead.

## Proposed Solution

- **Finding 1**: Replace the hard-coded `.sh` call in `ts-statusline_wrapper.sh` with an existence check that falls back to the `.py` bridge.
- **Finding 2**: Replace `Set-Content -Encoding UTF8` with `[System.IO.File]::WriteAllText(…, UTF8Encoding::new($false))` in `ts-statusline_bridge.ps1` — the same pattern already used in `ts-statusline_wrapper.ps1`.
- **Findings 3+4**: Rewrite the `used_percentage` extraction block in `ts-statusline_bridge.py` to guard against `None` and restore the `current_tokens / max_tokens` fallback when the percentage field is absent.

## Non-Goals

- No changes to ANSI color dot rendering (lines 27–36 of `ts-statusline_bridge.ps1`).
- No functional changes to `ts-session-guard.py` or `ts-statusline_wrapper.ps1`.
- No new capabilities or spec-level behavior changes.

## Success Criteria

- `ts-statusline_wrapper.sh` invokes the `.py` bridge when `ts-statusline_bridge.sh` is absent and produces non-empty output.
- The state file written by `ts-statusline_bridge.ps1` is valid UTF-8 without BOM and parses cleanly with `json.loads()`.
- `ts-statusline_bridge.py` writes a valid `ctx_pct` value (not `0.0` or error) when `used_percentage` is `null` or absent but token counts are present.
- All three files pass a basic smoke-test invocation without exception.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- Affected code:
  - Modified: src/hook/ts-statusline_wrapper.sh
  - Modified: src/hook/ts-statusline_bridge.ps1
  - Modified: src/hook/ts-statusline_bridge.py
