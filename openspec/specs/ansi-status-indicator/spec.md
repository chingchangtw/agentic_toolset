# ansi-status-indicator Specification

## Purpose

TBD - created by archiving change 'fix-statusline-emoji-ansi'. Update Purpose after archive.

## Requirements

### Requirement: ANSI color dot output

The statusline hook (`src/hook/ts-statusline_bridge.ps1`) SHALL output a colored solid circle (U+25CF, ●) using ANSI SGR escape sequences to represent context-usage severity, instead of emoji codepoints.

Color mapping:
- context_pct ≥ 85 → ESC[31m (red) + ● + ESC[0m
- context_pct ≥ 70 → ESC[33m (yellow) + ● + ESC[0m
- context_pct < 70 → ESC[32m (green) + ● + ESC[0m

The ESC character SHALL be produced via `[char]27` and the circle via `[char]0x25CF`; no literal emoji character SHALL appear in the source file.

#### Scenario: low context renders green dot

- **WHEN** context_pct is below 70
- **THEN** stdout contains the ANSI sequence `ESC[32m●ESC[0m` followed by the percentage and model string

##### Example: normal usage

| context_pct | Expected prefix  | Color meaning |
| ----------- | ---------------- | ------------- |
| 45          | ESC[32m●ESC[0m  | green         |
| 69          | ESC[32m●ESC[0m  | green         |

#### Scenario: moderate context renders yellow dot

- **WHEN** context_pct is 70 or above but below 85
- **THEN** stdout contains the ANSI sequence `ESC[33m●ESC[0m`

##### Example: moderate usage

| context_pct | Expected prefix  | Color meaning |
| ----------- | ---------------- | ------------- |
| 70          | ESC[33m●ESC[0m  | yellow        |
| 84          | ESC[33m●ESC[0m  | yellow        |

#### Scenario: high context renders red dot

- **WHEN** context_pct is 85 or above
- **THEN** stdout contains the ANSI sequence `ESC[31m●ESC[0m`

##### Example: high usage

| context_pct | Expected prefix  | Color meaning |
| ----------- | ---------------- | ------------- |
| 85          | ESC[31m●ESC[0m  | red           |
| 100         | ESC[31m●ESC[0m  | red           |

#### Scenario: no emoji characters in source

- **WHEN** the script file `src/hook/ts-statusline_bridge.ps1` is read as UTF-8 bytes
- **THEN** no byte sequences corresponding to U+1F534, U+1F7E1, or U+1F7E2 SHALL be present

<!-- @trace
source: fix-statusline-emoji-ansi
updated: 2026-06-25
code:
  - install.ps1
  - src/scripts/helpers.ps1
  - tasks/fixEmoji.md
  - src/hook/ts-statusline_bridge.ps1
  - install.sh
  - src/commands/load-skill.md
-->