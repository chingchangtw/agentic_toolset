## Why

The three statusline/session-guard hooks (`ts-statusline_bridge`, `ts-statusline_wrapper`, `ts-session-guard`) exist only as PowerShell scripts, requiring `pwsh` to be installed on macOS and Linux. macOS and Linux users who have not installed PowerShell Core cannot use these hooks.

## What Changes

- Add `src/hook/ts-statusline_bridge.sh` — POSIX shell equivalent of `ts-statusline_bridge.ps1`
- Add `src/hook/ts-statusline_wrapper.sh` — POSIX shell equivalent of `ts-statusline_wrapper.ps1`
- Add `src/hook/ts-session-guard.sh` — POSIX shell equivalent of `ts-session-guard.ps1`
- All three shell scripts replicate the same logic: read Claude Code JSON from stdin, compute context %, write `~/.claude/session_guard_state.json`, and emit the status line or `additionalContext` JSON
- `install.sh` deploys `.sh` variants to `~/.claude/hooks/` on macOS/Linux; `install.ps1` continues to deploy `.ps1` variants on Windows

## Non-Goals

- No changes to the `.ps1` scripts themselves
- No support for Windows Git Bash or WSL (those environments should install pwsh)
- No attempt to auto-detect OS at runtime inside a single script — platform selection happens at install time

## Capabilities

### New Capabilities

- `posix-hook-scripts`: POSIX shell implementations of the three Claude Code hooks (statusline bridge, statusline wrapper, session guard) that run on macOS and Linux without requiring PowerShell

### Modified Capabilities

- (none)

## Impact

- Affected specs: posix-hook-scripts (new)
- Affected code:
  - New: `src/hook/ts-statusline_bridge.sh`, `src/hook/ts-statusline_wrapper.sh`, `src/hook/ts-session-guard.sh`
  - Modified: `install.sh`, `install.ps1`
