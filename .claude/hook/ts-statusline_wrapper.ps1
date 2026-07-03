# One status line = caveman bar + ctx bridge bar.
# Bridge also writes session_guard_state.json (consumed by ts-session-guard.py).
# Cross-platform: works on Windows (pwsh), macOS (pwsh), Linux (pwsh).

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)  # UTF-8 without BOM — BOM breaks ConvertFrom-Json in child process

# $HOME works in PowerShell Core on all platforms; $env:USERPROFILE is Windows-only fallback
$userHome   = if ($HOME) { $HOME } elseif ($env:USERPROFILE) { $env:USERPROFILE } else { "~" }
$hooksDir   = Join-Path $userHome ".claude" "hooks"
$bridgeScript  = Join-Path $hooksDir "ts-statusline_bridge.ps1"
$cavemanScript = Join-Path $hooksDir "caveman-statusline.ps1"

$RAW = [Console]::In.ReadToEnd()

$CTX  = ($RAW | & pwsh -NoProfile -File "$bridgeScript" 2>$null) -join ""
$CAVE = ($RAW | & "$cavemanScript"                      2>$null) -join ""

[Console]::WriteLine("$CAVE | $CTX")