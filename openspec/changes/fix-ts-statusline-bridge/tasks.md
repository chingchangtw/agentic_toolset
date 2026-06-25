## 1. Shell Wrapper Bridge Resolution

- [x] 1.1 In `src/hook/ts-statusline_wrapper.sh`, replace the unconditional `ts-statusline_bridge.sh` call with an explicit `[ -f ]` existence check that falls back to `ts-statusline_bridge.py` — implements "Shell wrapper resolves bridge script at runtime" and "Shell bridge resolution uses existence check, not `||` chaining". Verification: pipe a minimal JSON payload through the wrapper with `ts-statusline_bridge.sh` absent; assert stdout is non-empty and exit code is 0.

## 2. PS1 Bridge UTF-8 Encoding Fix

- [x] 2.1 In `src/hook/ts-statusline_bridge.ps1`, replace `Set-Content -Path $stateFile -Value (ConvertTo-Json @{ context_pct = $ctxPct }) -Encoding UTF8` with `[System.IO.File]::WriteAllText($stateFile, (ConvertTo-Json @{ context_pct = $ctxPct }), [System.Text.UTF8Encoding]::new($false))` — implements "PS1 bridge writes BOM-free UTF-8 state file" and "PS1 encoding fix reuses existing pattern". Do not touch lines 27–36 (ANSI color dot logic). Verification: after the script runs, confirm `json.loads(open(state_file, encoding="utf-8").read())` succeeds without error.

## 3. Python Bridge Null Guard and Token Fallback

- [x] 3.1 In `src/hook/ts-statusline_bridge.py`, replace the single-line `ctx_pct = round(float(data.get("context_window", {}).get("used_percentage", 0)), 1)` with a two-step extraction block that guards against `None` and falls back to `current_tokens / max_tokens * 100` — implements "Python bridge handles null and absent used_percentage" and "Python bridge null guard uses two-step extraction". Exact replacement:

## 4. Post-Fix Smoke Test

- [x] 4.1 Run a manual end-to-end smoke test: invoke `ts-statusline_wrapper.sh` with a realistic Claude Code hook JSON payload (containing `context_window` with `used_percentage: null` and token counts), confirm non-empty statusline output, and confirm the state file is valid JSON parseable by `json.loads()`. Verification: all three assertions pass with exit code 0.
