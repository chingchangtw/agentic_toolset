function Use-Skill {
    param([string]$SkillName)
    $path = ".claude/skills/ondemand/$SkillName/SKILL.md"
    Write-Host "Run in Claude Code: /read $path"
    Set-Clipboard -Value "/read $path"
    Write-Host "Copied to clipboard."
}