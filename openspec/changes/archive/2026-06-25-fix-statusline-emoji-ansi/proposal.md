## Why

Emoji codepoints (🔴 U+1F534, 🟡 U+1F7E1, 🟢 U+1F7E2) are supplementary-plane characters that render as blank squares or broken glyphs in conhost-based terminals (MobaXterm, older Windows Terminal builds, SSH sessions without emoji font fallback). The statusline indicator becomes unreadable in those environments.

## What Changes

- Replace the three emoji string literals in the `$icon` assignment inside `src/hook/ts-statusline_bridge.ps1` with ANSI SGR sequences wrapping U+25CF (SOLID CIRCLE, BMP) using `[char]27` for ESC and `[char]0x25CF` for the dot character.
- Color mapping preserved: red (31m) for ≥85%, yellow (33m) for ≥70%, green (32m) otherwise; reset (0m) after each dot.
- The `[Console]::WriteLine` output format (`$icon $ctxPct% ctx | $model`) is unchanged.

## Non-Goals

- No change to threshold logic (85% / 70% cutoffs).
- No change to the JSON state file written to `~/.claude/session_guard_state.json`.
- No change to model name extraction or context percentage calculation.
- No font or terminal configuration changes.

## Capabilities

### New Capabilities

- `ansi-status-indicator`: The statusline hook SHALL express context-usage severity using ANSI SGR color codes and a BMP Unicode character (U+25CF), removing the dependency on supplementary-plane emoji codepoints.

### Modified Capabilities

(none)

## Impact

- Affected code:
  - Modified: `src/hook/ts-statusline_bridge.ps1`
  - New: (none)
  - Removed: (none)
