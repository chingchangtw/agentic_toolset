# One status line = caveman bar + ctx bridge bar.
# Bridge also writes session_guard_state.json (consumed by ts-session-guard.py).
# Cross-platform: works on Windows (pwsh), macOS (pwsh), Linux (pwsh).

# $HOME works in PowerShell Core on all platforms; $env:USERPROFILE is Windows-only fallback
$userHome   = if ($HOME) { $HOME } elseif ($env:USERPROFILE) { $env:USERPROFILE } else { "~" }
$hooksDir   = Join-Path $userHome ".claude" "hooks"
$bridgeScript  = Join-Path $hooksDir "ts-statusline_bridge.py"
$cavemanScript = Join-Path $hooksDir "caveman-statusline.ps1"

$RAW = [Console]::In.ReadToEnd()

# Detect python binary (python3 on Linux/macOS, python on Windows)
$python = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }

$CTX  = ($RAW | & $python "$bridgeScript"  2>$null) -join "`n"
$CAVE = ($RAW | & "$cavemanScript"         2>$null) -join "`n"

[Console]::WriteLine("$CAVE`n$CTX")