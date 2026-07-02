# install.ps1 — agenticToolset installer (Windows 11 / PowerShell 5.1+)
# Usage:
#   irm https://github.com/OWNER/REPO/releases/latest/download/install.ps1 | iex
#   $env:GITHUB_TOKEN = "ghp_xxx"; irm ... | iex   # for private repos

$ErrorActionPreference = "Stop"

$Repo       = "chingchangtw/agentic_toolset"
$ReleaseUrl = "https://github.com/$Repo/releases/latest/download/release.zip"
$ClaudeDir  = "$env:USERPROFILE\.claude"
$ProjectDir = (Get-Location).Path
$ProjectClaudeDir = "$ProjectDir\.claude"
$HooksDir   = "$ClaudeDir\hooks"
$SkillsDir  = "$ProjectClaudeDir\skills"
$Settings   = "$ClaudeDir\settings.json"
$TmpDir     = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.IO.Path]::GetRandomFileName())
New-Item -ItemType Directory -Path $TmpDir -Force | Out-Null

# ── download ──────────────────────────────────────────────────────────────────

Write-Host "→ Downloading release..."
$Headers = @{}
if ($env:GITHUB_TOKEN) { $Headers["Authorization"] = "Bearer $env:GITHUB_TOKEN" }
Invoke-WebRequest -Uri $ReleaseUrl -OutFile "$TmpDir\release.zip" -Headers $Headers
Expand-Archive -Path "$TmpDir\release.zip" -DestinationPath $TmpDir -Force

# ── skills & hooks (manifest-driven, or legacy fallback for old zips) ─────────

$ManifestPath = "$TmpDir\manifest.json"
if (Test-Path $ManifestPath) {

    # ── skills (manifest-driven) ─────────────────────────────────────────────────

    Write-Host "→ Installing skills → $SkillsDir\"
    New-Item -ItemType Directory -Path $SkillsDir -Force | Out-Null
    $manifest = Get-Content $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($entry in $manifest.skills) {
        $installSubpath = $entry.dest.Substring("skills/".Length).Replace("/", "\")
        $src = Join-Path $TmpDir $entry.dest.Replace("/", "\")
        $dst = Join-Path $SkillsDir $installSubpath
        New-Item -ItemType Directory -Path (Split-Path $dst -Parent) -Force | Out-Null
        Copy-Item -Path $src -Destination $dst -Recurse -Force
        Write-Host "   ✓ skill: $($entry.dest.Substring('skills/'.Length))"
    }

    # ── hooks (manifest-driven, routed by scope) ──────────────────────────────────

    Write-Host "→ Installing hooks..."
    New-Item -ItemType Directory -Path $HooksDir -Force | Out-Null
    $ProjectHooksDir = "$ProjectClaudeDir\hooks"
    New-Item -ItemType Directory -Path $ProjectHooksDir -Force | Out-Null
    foreach ($entry in $manifest.hooks) {
        $src = Join-Path $TmpDir $entry.dest.Replace("/", "\")
        if ($entry.scope -eq "project") {
            $dst = Join-Path $ProjectHooksDir $entry.name
        } else {
            $dst = Join-Path $HooksDir $entry.name
        }
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "   ✓ hook ($($entry.scope)): $($entry.name)"
    }

} else {

    # ── legacy fallback: old zip without manifest.json ────────────────────────────

    Write-Host "→ Installing skills → $SkillsDir\"
    New-Item -ItemType Directory -Path $SkillsDir -Force | Out-Null
    $SkillsSrc = "$TmpDir\skills"
    if (Test-Path $SkillsSrc) {
        foreach ($skillDir in Get-ChildItem -Path $SkillsSrc -Directory) {
            if ($skillDir.Name -eq "ondemand") {
                $ondemandDest = Join-Path $SkillsDir "ondemand"
                New-Item -ItemType Directory -Path $ondemandDest -Force | Out-Null
                foreach ($odDir in Get-ChildItem -Path $skillDir.FullName -Directory) {
                    $dest = Join-Path $ondemandDest $odDir.Name
                    Copy-Item -Path $odDir.FullName -Destination $dest -Recurse -Force
                    Write-Host "   ✓ skill (ondemand): $($odDir.Name)"
                }
                continue
            }
            $dest = Join-Path $SkillsDir $skillDir.Name
            Copy-Item -Path $skillDir.FullName -Destination $dest -Recurse -Force
            Write-Host "   ✓ skill: $($skillDir.Name)"
        }
    }

    Write-Host "→ Installing hooks → $HooksDir\"
    New-Item -ItemType Directory -Path $HooksDir -Force | Out-Null
    $HookSrc = "$TmpDir\hook"
    if (Test-Path $HookSrc) {
        Copy-Item "$HookSrc\ts-session-guard.ps1"     "$HooksDir\ts-session-guard.ps1"  -Force
        Copy-Item "$HookSrc\ts-statusline_bridge.ps1" "$HooksDir\ts-statusline_bridge.ps1" -Force
        Write-Host "   ✓ ts-session-guard.ps1"
        Write-Host "   ✓ ts-statusline_bridge.ps1"
    }

}

# ── settings.json ─────────────────────────────────────────────────────────────

Write-Host "→ Patching $Settings"
New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null

$HookCmd  = "pwsh -NoProfile -File `"$HooksDir\ts-session-guard.ps1`""
$BridgeCmd = "pwsh -NoProfile -File `"$HooksDir\ts-statusline_bridge.ps1`""

$settings = @{}
if (Test-Path $Settings) {
    try { $settings = Get-Content $Settings -Raw -Encoding UTF8 | ConvertFrom-Json -AsHashtable }
    catch { $settings = @{} }
}

# UserPromptSubmit hook (idempotent)
if (-not $settings.ContainsKey("hooks")) { $settings["hooks"] = @{} }
if (-not $settings["hooks"].ContainsKey("UserPromptSubmit")) {
    $settings["hooks"]["UserPromptSubmit"] = @()
}
$ups = $settings["hooks"]["UserPromptSubmit"]
$alreadyReg = $ups | ForEach-Object {
    if ($_.hooks) { $_.hooks | Where-Object { $_.command -eq $HookCmd } }
} | Select-Object -First 1
if (-not $alreadyReg) {
    $settings["hooks"]["UserPromptSubmit"] += @{
        hooks = @(@{ type = "command"; command = $HookCmd })
    }
}

# statusLine
# Schema: statusLine must be an object {"type","command"}, not a bare string —
# Claude Code rejects the whole settings file otherwise.
$existingSl = $settings["statusLine"]
$existingCmd = $null
if ($existingSl -is [string] -and $existingSl) {
    $existingCmd = $existingSl
} elseif ($existingSl -is [hashtable] -or $existingSl -is [System.Collections.IDictionary]) {
    $existingCmd = $existingSl["command"]
}

$wrapperPath = "$HooksDir\statusline_wrapper.ps1"
$alreadyWrapped = $existingCmd -and ($existingCmd -match "ts-statusline_bridge" -or $existingCmd -match [regex]::Escape($wrapperPath))

if (-not $existingCmd) {
    $settings["statusLine"] = @{ type = "command"; command = $BridgeCmd }
} elseif ($existingCmd -eq $BridgeCmd -or $alreadyWrapped) {
    # already set (possibly via our own wrapper on a prior run)
} else {
    # Conflict: write a wrapper ps1 that calls both
    $wrapperContent = @"
# Auto-generated by agenticToolset installer
`$raw = [Console]::In.ReadToEnd()
try { `$raw | pwsh -NoProfile -File "$HooksDir\ts-statusline_bridge.ps1" 2>`$null } catch {}
`$raw | $existingCmd
"@
    Set-Content -Path $wrapperPath -Value $wrapperContent -Encoding UTF8
    $settings["statusLine"] = @{ type = "command"; command = "pwsh -NoProfile -File `"$wrapperPath`"" }
    Write-Host "   ⚠  Existing statusLine detected — wrapper written to $wrapperPath"
}

$settings | ConvertTo-Json -Depth 10 | Set-Content -Path $Settings -Encoding UTF8
Write-Host "   ✓ settings.json patched"

# ── scaffold ──────────────────────────────────────────────────────────────────

$ScaffoldSrc = "$TmpDir\scaffold"
if (Test-Path $ScaffoldSrc) {
    if ($env:SCAFFOLD -eq "y") {
        Write-Host "→ Scaffolding project root (SCAFFOLD=y): $PWD"
        foreach ($item in Get-ChildItem -Path $ScaffoldSrc) {
            $dest = Join-Path $PWD $item.Name
            if ((Test-Path $dest) -and ($env:SCAFFOLD_OVERWRITE -ne "y")) {
                Write-Host "   skip $($item.Name) (already exists — set SCAFFOLD_OVERWRITE=y to replace)"
                continue
            }
            Copy-Item -Path $item.FullName -Destination $dest -Recurse -Force
            Write-Host "   ✓ $($item.Name)"
        }
    } else {
        Write-Host "→ Scaffold templates available but skipped (non-interactive install)."
        Write-Host "   Re-run with `$env:SCAFFOLD='y' to copy them into $PWD"
    }
}

# ── cleanup ───────────────────────────────────────────────────────────────────

Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✓ Done. Reload Claude Code to activate hooks."
Write-Host ""
Write-Host "  Next: install third-party skills:"
Write-Host "    npx skills add caveman-commit@latest"
Write-Host "    npx skills add spectra@latest"
