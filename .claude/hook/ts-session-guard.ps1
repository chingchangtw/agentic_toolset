# UserPromptSubmit hook — warns when turn count or context usage exceeds thresholds.
# PowerShell port of ts-session-guard.py — no Python dependency.

$MSG_WARN   = 10   # warn after this many turns
$CTX_YELLOW = 70   # % advisory warning
$CTX_RED    = 85   # % critical warning

try {
    $payload = [Console]::In.ReadToEnd() | ConvertFrom-Json -ErrorAction Stop
} catch {
    exit 0
}

$transcriptPath = $payload.transcript_path

# Count real user turns from transcript JSONL.
# Transcript entries use type="user"/"assistant" (never "message"). A "user"
# entry can also be a tool_result echo (content is an array of blocks) or a
# synthetic isMeta entry (system reminders) — neither is a turn the human typed.
function Test-IsRealUserTurn($entry) {
    if ($entry.type -ne "user" -or $entry.isMeta) { return $false }
    # @() forces array coercion — ConvertFrom-Json can unwrap a single-element
    # JSON array (e.g. one tool_result block) into a bare scalar object.
    foreach ($c in @($entry.message.content)) {
        if ($c.type -eq "tool_result") { return $false }
    }
    return $true
}

$msgCount = 0
try {
    if ($transcriptPath -and (Test-Path $transcriptPath)) {
        foreach ($line in [System.IO.File]::ReadAllLines($transcriptPath)) {
            try {
                $entry = $line | ConvertFrom-Json -ErrorAction Stop
                if (Test-IsRealUserTurn $entry) { $msgCount++ }
            } catch { continue }
        }
    }
} catch {}

# Read context % from state file written by ts-statusline_bridge.ps1
$ctxPct = 0.0
$userHome  = if ($HOME) { $HOME } elseif ($env:USERPROFILE) { $env:USERPROFILE } else { "~" }
$stateFile = Join-Path $userHome ".claude" "session_guard_state.json"
try {
    if (Test-Path $stateFile) {
        $state  = Get-Content $stateFile -Raw -Encoding UTF8 | ConvertFrom-Json -ErrorAction Stop
        $ctxPct = [double]($state.context_pct ?? 0)
    }
} catch {}

# Build warnings
$warnings = @()

if ($msgCount -ge $MSG_WARN) {
    $warnings += "⚠️  TURNS: $msgCount messages in this session. Consider /compact or start a new session."
}

if ($ctxPct -ge $CTX_RED) {
    $warnings += "🚨 CONTEXT: $([math]::Round($ctxPct,0))% used — CRITICAL. Run /compact now."
} elseif ($ctxPct -ge $CTX_YELLOW) {
    $warnings += "⚠️  CONTEXT: $([math]::Round($ctxPct,0))% used. Plan to /compact soon."
}

if ($warnings.Count -gt 0) {
    $banner = $warnings -join "`n"
    $output = @{
        hookSpecificOutput = @{
            hookEventName     = "UserPromptSubmit"
            additionalContext = $banner
        }
    }
    [Console]::WriteLine(($output | ConvertTo-Json -Compress))
}

exit 0
