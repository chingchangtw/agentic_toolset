## Context

The `ts-statusline` hook pipeline has three components that must agree on file paths, encoding, and data shape:

- `ts-statusline_wrapper.sh` — bash entry point; pipes hook payload through a bridge script and writes the result to the statusline
- `ts-statusline_bridge.sh` / `ts-statusline_bridge.py` — bridge scripts that extract `ctx_pct` from the Claude Code hook JSON payload and write a state file
- `ts-statusline_bridge.ps1` — PowerShell equivalent of the Python bridge
- `ts-session-guard.py` — reads the state file via `json.loads()` to enforce session limits

Four bugs were identified in code review. All fixes are mechanical (prescribed exact replacements); no design alternatives exist.

## Goals / Non-Goals

**Goals:**

- `ts-statusline_wrapper.sh` resolves the correct bridge at runtime regardless of which script variants are installed
- The PS1 bridge writes a BOM-free UTF-8 state file parseable by `json.loads()`
- The Python bridge handles `null` and absent `used_percentage` without raising `TypeError`
- The Python bridge restores the `current_tokens / max_tokens` fallback that the PS1 bridge already has

**Non-Goals:**

- No changes to ANSI color dot rendering in `ts-statusline_bridge.ps1` (lines 27–36)
- No changes to `ts-session-guard.py` or `ts-statusline_wrapper.ps1`
- No new features, no spec-level behavior changes

## Decisions

### Shell bridge resolution uses existence check, not `||` chaining

`ts-statusline_wrapper.sh` must call the `.sh` bridge if it exists, falling back to `.py`. Using `cmd1 || cmd2` is unsafe: a non-zero exit from `cmd1` due to a parse error or runtime failure also triggers the fallback silently. An explicit `[ -f … ]` existence check is unambiguous and matches the stated intent.

### PS1 encoding fix reuses existing pattern

`ts-statusline_wrapper.ps1` already uses `[System.IO.File]::WriteAllText(…, UTF8Encoding::new($false))` to avoid BOM. The bridge PS1 must be made consistent. No new pattern is introduced.

### Python bridge null guard uses two-step extraction

`.get("used_percentage", 0)` returns `None` when the key is present with a JSON `null` value. The fix separates the `.get()` call from the `float()` conversion so the `None` case can branch to the token-count fallback before any arithmetic. The final `float(ctx_raw or 0)` safely converts `0` (int) or `0.0` (float) without error.

## Implementation Contract

**Behavior after fix:**

1. `ts-statusline_wrapper.sh` — when `ts-statusline_bridge.sh` is absent, the wrapper executes `ts-statusline_bridge.py` and produces non-empty output. When `ts-statusline_bridge.sh` is present, it is used instead.

2. `ts-statusline_bridge.ps1` — the state file (path held in `$stateFile`) contains valid UTF-8 JSON without BOM. `python3 -c "import json; json.loads(open('<state_file>').read())"` succeeds.

3. `ts-statusline_bridge.py` — when the hook payload's `context_window.used_percentage` is `null` or the key is absent, `ctx_pct` is computed from `current_tokens / max_tokens * 100` (or `0.0` when `max_tokens` is also absent). `TypeError` is never raised. The state file is always written on a valid payload.

**Failure modes:**

- If both `ts-statusline_bridge.sh` and `ts-statusline_bridge.py` are absent, the wrapper silently produces empty output (pre-existing behavior, out of scope).
- If `max_tokens` is `0` or absent in the Python bridge fallback, `ctx_pct` is `0.0` (safe division guard via `if mx else 0`).

**Acceptance criteria:**

- Smoke test `ts-statusline_wrapper.sh`: pass a minimal JSON payload; assert stdout is non-empty and `$?` is 0.
- Smoke test `ts-statusline_bridge.ps1`: run with a payload where `used_percentage` is a number; open the state file and confirm `json.loads()` succeeds.
- Unit test `ts-statusline_bridge.py`: call the extraction block with `{"context_window": {"used_percentage": null, "current_tokens": 500, "max_tokens": 1000}}`; assert `ctx_pct == 50.0`. Call with `{"context_window": {}}` ; assert `ctx_pct == 0.0`.

**Scope boundaries (in scope):**

- Three targeted edits: one block in each of `ts-statusline_wrapper.sh`, `ts-statusline_bridge.ps1`, `ts-statusline_bridge.py`.

**Scope boundaries (out of scope):**

- Any other logic in those files not identified in this change.

## Risks / Trade-offs

- [Risk] Existence check in wrapper adds a shell `[ -f ]` call per hook invocation → Mitigation: negligible overhead; hook scripts already perform file I/O.
- [Risk] `UTF8Encoding::new($false)` constructor requires .NET; unavailable on very old PowerShell environments → Mitigation: pattern already in use in `ts-statusline_wrapper.ps1` in the same repo, confirming it works in the target environment.
