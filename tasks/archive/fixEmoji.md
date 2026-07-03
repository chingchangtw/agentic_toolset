# ANSI colored dot — works in MobaXterm, Windows Terminal, conhost
$ESC = [char]27
$dot = [char]0x25CF  # ● solid circle (BMP, not emoji)

$icon = if ($ctxPct -ge 85) {
    "${ESC}[31m${dot}${ESC}[0m"   # red
} elseif ($ctxPct -ge 70) {
    "${ESC}[33m${dot}${ESC}[0m"   # yellow
} else {
    "${ESC}[32m${dot}${ESC}[0m"   # green
}