# session-guard
 
A lightweight, cross-platform Claude Code hook that warns you **before** a session degrades — when message count exceeds 10 turns or context usage exceeds 70%.
 
Runs identically on **macOS** and **Windows 11** (Git Bash / WSL / PowerShell).
 
---
 
## Purpose
 
Claude Code sessions silently degrade as context fills up. By the time you notice — slower responses, forgotten context, hallucinations — it is often too late to recover cleanly.
 
`session-guard` gives you two early warnings, injected directly into Claude's context before each prompt:
 
| Trigger | Threshold | Signal |
|---|---|---|
| Message count | ≥ 10 turns | ⚠️ advisory |
| Context usage | 70–84% | ⚠️ advisory |
| Context usage | ≥ 85% | 🚨 critical |
 
Warnings are non-blocking — your session continues uninterrupted.
 
---
 
## Architecture & Components
 
```
~/.claude/
├── hooks/
│   ├── ts-session_guard.py        # UserPromptSubmit hook — fires before each prompt
│   └── ts-statusline_bridge.py    # StatusLine script — fires after each turn
├── session_guard_state.json    # Shared state file (auto-created at runtime)
└── settings.json               # Hook registration
```
 
### Data flow
 
```
Every turn:
  StatusLine ──► ts-statusline_bridge.py ──► writes context_pct to state file
                                       ──► prints 🟢/🟡/🔴 % in terminal status bar
 
Before each prompt:
  UserPromptSubmit ──► ts-session_guard.py ──► reads transcript for message count
                                        ──► reads state file for context %
                                        ──► injects warning into Claude's context
```
 
### Component details
 
#### `ts-session_guard.py` — UserPromptSubmit hook
 
- Reads the hook payload from `stdin` (JSON provided by Claude Code)
- Parses the session transcript JSONL to count message turns
- Reads `ts_session_guard_state.json` for the latest context percentage
- Outputs warnings as `additionalContext` injected into Claude's context window
- Always exits `0` — never blocks the session
#### `ts_statusline_bridge.py` — StatusLine script
 
- Receives the StatusLine JSON payload from Claude Code on `stdin` after every turn
- Extracts `num_tokens_in_context_window` and `max_tokens_in_context_window`
- Computes context percentage and writes it to the shared state file
- Prints a colour-coded status line to the terminal: `🟢/🟡/🔴 % ctx | model`
#### `ts_session_guard_state.json` — Shared state
 
- Auto-created by `ts_statusline_bridge.py` on first turn
- Read by `ts_session_guard.py` before each prompt
- Contains a single field: `{ "context_pct": 42.5 }`
#### `settings.json` — Registration
 
Wires both scripts into Claude Code's lifecycle via the `hooks` and `statusLine` keys.
 
---
 
## Installation
 
### Prerequisites
 
- Python 3.8 or later on PATH as `python3` (macOS / Linux / WSL) or `python` (Win11 native)
- Claude Code CLI installed and authenticated
### Step 1 — Create the hooks directory
 
**macOS / WSL / Git Bash:**
```bash
mkdir -p ~/.claude/hooks
```
 
**Win11 PowerShell:**
```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.claude\hooks"
```
 
### Step 2 install files 
- statusline_bridge.py
- session_guard.py
 

### Step 4 — Register in `settings.json`
 
Edit `~/.claude/settings.json` (create it if it does not exist):
 
**macOS / WSL / Git Bash:**
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.claude/hooks/ts-session_guard.py"
          }
        ]
      }
    ]
  },
  "statusLine": "python3 ~/.claude/hooks/ts-statusline_bridge.py"
}
```
 
**Win11 native (non-WSL):** replace `python3` with `python` if that is your PATH alias:
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python ~/.claude\\hooks\\ts-session_guard.py"
          }
        ]
      }
    ]
  },
  "statusLine": "python ~/.claude\\hooks\\ts-statusline_bridge.py"
}
```
 
### Step 5 — Verify
 
Start a new Claude Code session and run:
```
/hooks
```
 
You should see `UserPromptSubmit` listed with your hook. The status bar at the bottom of the terminal shows `🟢 X.X% ctx | model-name` after each turn.
 
---
 
## Customising Thresholds
 
Edit the constants at the top of `ts-session_guard.py`:
 
```python
MSG_WARN   = 10   # message count threshold
CTX_YELLOW = 70   # advisory context % 
CTX_RED    = 85   # critical context %
```
 
No restart needed — changes apply from the next prompt.
 
---
 
## Troubleshooting
 
| Symptom | Fix |
|---|---|
| Hook not showing in `/hooks` | Check `settings.json` syntax with a JSON validator |
| `python3: command not found` on Win11 | Use `python` instead of `python3` in `settings.json` |
| Context % always shows 0 | Confirm `statusLine` key is set in `settings.json` and `ts_statusline_bridge.py` exists |
| State file not created | Check write permission on `~/.claude/` directory |
| Warnings not appearing | Run `/hooks` to confirm hook is loaded; check transcript path in payload |
 
---
 
## Limitations
 
- Context % is sourced from the StatusLine payload, which is only available after the **first completed turn**. The first prompt of a session shows 0%.
- Message count is derived from the transcript JSONL. Counts may differ slightly from Claude Code's internal turn counter depending on tool call entries.
- A native context-threshold hook event does not yet exist in Claude Code. This solution uses StatusLine as the data bridge, which is the current best available approach.

## issue with caveman statusline script
settings.json statusLine already have caveman-statusline.ps1 script. It cannot have two statusLine entries; only one is allowed.

### Solution
Wrapper script (if you prefer not to touch the existing script)
Create a new statusline_wrapper.ps1 that calls both scripts, replace the statusLine entry to point to the wrapper:
powershell# ~/.claude/hooks/statusline_wrapper.ps1

### Read stdin once
$raw = [Console]::In.ReadToEnd()

# Write state for session_guard.py
try {
    $data   = $raw | ConvertFrom-Json
    $used   = [double]($data.num_tokens_in_context_window)
    $window = [double]($data.max_tokens_in_context_window)
    $pct    = if ($window -gt 0) { [math]::Round(($used / $window) * 100, 1) } else { 0 }
    $stateFile = "$env:USERPROFILE\.claude\session_guard_state.json"
    '{"context_pct":' + $pct + '}' | Set-Content -Path $stateFile -Encoding UTF8
}
catch {}

### Pass stdin to existing caveman script via temp file (stdin already consumed)
$tmp = [System.IO.Path]::GetTempFileName()
$raw | Set-Content -Path $tmp -Encoding UTF8
$display = Get-Content $tmp | pwsh -NoProfile -ExecutionPolicy Bypass `
    -File "C:\Users\tlchang\.claude\hooks\caveman-statusline.ps1"
Remove-Item $tmp -ErrorAction SilentlyContinue

Write-Output $display
Then update settings.json:
json"statusLine": {
  "type": "command",
  "command": "pwsh -NoProfile -ExecutionPolicy Bypass -File \"C:\\Users\\tlchang\\.claude\\hooks\\statusline_wrapper.ps1\""
}