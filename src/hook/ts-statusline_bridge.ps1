# StatusLine bridge — reads Claude Code stdin JSON, writes state file, prints status line.
# PowerShell port of ts-statusline_bridge.py — no Python dependency.

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$userHome  = if ($HOME) { $HOME } elseif ($env:USERPROFILE) { $env:USERPROFILE } else { "~" }
$stateFile = Join-Path $userHome ".claude" "session_guard_state.json"

try {
    $raw  = [Console]::In.ReadToEnd()
    $data = $raw | ConvertFrom-Json -ErrorAction Stop

    $ctxWindow = $data.context_window
    $ctxRaw    = $ctxWindow.used_percentage
    if ($null -eq $ctxRaw) {
        $cur    = [double]($ctxWindow.current_tokens ?? 0)
        $mx     = [double]($ctxWindow.max_tokens    ?? 0)
        $ctxRaw = if ($mx -gt 0) { $cur / $mx * 100 } else { 0 }
    }
    $ctxPct = [math]::Round([double]$ctxRaw, 1)
    $modelRaw = $data.model
    $model = if ($modelRaw.display_name) { $modelRaw.display_name } elseif ($modelRaw.id) { $modelRaw.id } elseif ($modelRaw) { "$modelRaw" } else { "unknown" }

    Set-Content -Path $stateFile -Value (ConvertTo-Json @{ context_pct = $ctxPct }) -Encoding UTF8

    $icon = if ($ctxPct -ge 85) { "🔴" } elseif ($ctxPct -ge 70) { "🟡" } else { "🟢" }
    [Console]::WriteLine("$icon $ctxPct% ctx | $model")
} catch {
    [Console]::WriteLine("[ status unavailable ]")
}
