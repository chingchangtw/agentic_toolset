## 1. Implementation

- [x] 1.1 In `src/hook/ts-statusline_bridge.ps1`, replace the three-branch `$icon` assignment (the block that currently assigns emoji literals 🔴/🟡/🟢) with ANSI color dot output: add `$ESC = [char]27` and `$dot = [char]0x25CF` immediately before the `$icon` block, then rewrite each branch to `"${ESC}[31m${dot}${ESC}[0m"` (≥85%), `"${ESC}[33m${dot}${ESC}[0m"` (≥70%), and `"${ESC}[32m${dot}${ESC}[0m"` (otherwise). Verify: `Select-String -Path src/hook/ts-statusline_bridge.ps1 -Pattern '[🔴🟡🟢]'` returns no matches (no emoji bytes remain in source).

## 2. Verification

- [x] 2.1 Confirm ANSI color dot output renders correctly: pipe `'{"context_window":{"used_percentage":45},"model":"test-model"}'` to the script and assert stdout matches `ESC[32m●ESC[0m 45.0% ctx | test-model` (green dot, low context). Repeat for 70 (yellow, `ESC[33m`) and 85 (red, `ESC[31m`).
- [x] 2.2 Confirm the surrounding output format is unchanged: the `[Console]::WriteLine` call still produces `$icon $ctxPct% ctx | $model` — only the `$icon` value differs. Verify by inspecting the unmodified `[Console]::WriteLine("$icon $ctxPct% ctx | $model")` line remains after the edit.
