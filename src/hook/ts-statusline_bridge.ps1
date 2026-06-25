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

    [System.IO.File]::WriteAllText($stateFile, (ConvertTo-Json @{ context_pct = $ctxPct }), [System.Text.UTF8Encoding]::new($false))

	# ANSI colored dot — works in MobaXterm, Windows Terminal, conhost
	$ESC = [char]27
	$dot = [char]0x25CF  # ● solid circle (BMP, not emoji)

	$icon = if ($ctxPct -ge 85) {
		"${ESC}[31m${dot}${ESC}[0m"   # red "🔴"
	} elseif ($ctxPct -ge 70) {
		"${ESC}[33m${dot}${ESC}[0m"   # yellow "🟡"
	} else {
		"${ESC}[32m${dot}${ESC}[0m"   # green "🟢"
	}

    [Console]::WriteLine("$icon $ctxPct% ctx | $model")
} catch {
    [Console]::WriteLine("[ status unavailable ]")
}
