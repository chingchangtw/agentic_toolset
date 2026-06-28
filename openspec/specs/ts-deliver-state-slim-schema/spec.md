# ts-deliver-state-slim-schema Specification

## Purpose

TBD - created by archiving change 'ts-deliver-state-slim'. Update Purpose after archive.

## Requirements

### Requirement: Slim state.json schema excludes history arrays

The router SHALL write `.ai/ts-deliver-router/state.json` containing only `schema_version`, `current_phase`, `phase_entered_at`, `artifacts`, and `gates` fields. The file SHALL NOT contain `phase_history` or `ingest_log` arrays.

#### Scenario: Phase exit writes slim state.json

- **WHEN** the router completes a phase exit (step 6)
- **THEN** the written `state.json` SHALL contain no `phase_history` key
- **THEN** the written `state.json` SHALL contain no `ingest_log` key
- **THEN** the written `state.json` SHALL contain `schema_version`, `current_phase`, `phase_entered_at`, `artifacts`, and `gates` keys

#### Scenario: Slim file size is bounded by phase count

- **WHEN** a project has completed N phases
- **THEN** the size of `state.json` SHALL NOT grow proportionally to N — it reflects only current state


<!-- @trace
source: ts-deliver-state-slim
updated: 2026-06-28
code:
  - src/skills/ts-deliver-router/SKILL.md
  - .agents/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-commit/SKILL.md
  - .ai/ts-deliver-router/autonomy
  - AGENTS.md
  - .agents/skills/spectra-ask/SKILL.md
  - .ai/ts-deliver-router/state.json
  - .agents/skills/spectra-debug/SKILL.md
  - .agents/skills/spectra-apply/SKILL.md
  - .agents/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-deliver-router/rawfiles/references/state.md
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .agents/skills/spectra-audit/SKILL.md
-->

---
### Requirement: history.jsonl captures phase transitions

The router SHALL append exactly one JSON event line to `.ai/ts-deliver-router/history.jsonl` on every phase exit. The event SHALL have `event`, `ts`, `from`, `to`, and `artifacts_at_exit` fields.

#### Scenario: Phase exit appends history event

- **WHEN** the router writes `state.json` during phase exit
- **THEN** one line SHALL be appended to `.ai/ts-deliver-router/history.jsonl`
- **THEN** the appended line SHALL be valid JSON with `"event": "phase_exit"`, ISO8601 `ts`, and `from`/`to` phase names

#### Scenario: history.jsonl failure does not block phase exit

- **WHEN** the append to `history.jsonl` fails (permission error, disk full)
- **THEN** the phase exit SHALL complete successfully using the already-written `state.json`
- **THEN** the router SHALL emit a warning message about the failed history append

#### Scenario: Multiple phase exits accumulate lines

- **GIVEN** a project has completed 3 phase exits
- **WHEN** `history.jsonl` is read
- **THEN** it SHALL contain exactly 3 lines, one per phase exit, in chronological order


<!-- @trace
source: ts-deliver-state-slim
updated: 2026-06-28
code:
  - src/skills/ts-deliver-router/SKILL.md
  - .agents/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-commit/SKILL.md
  - .ai/ts-deliver-router/autonomy
  - AGENTS.md
  - .agents/skills/spectra-ask/SKILL.md
  - .ai/ts-deliver-router/state.json
  - .agents/skills/spectra-debug/SKILL.md
  - .agents/skills/spectra-apply/SKILL.md
  - .agents/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-deliver-router/rawfiles/references/state.md
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .agents/skills/spectra-audit/SKILL.md
-->

---
### Requirement: Router step 2 reads only state.json

During every router invocation, the router SHALL read only `.ai/ts-deliver-router/state.json` to determine current phase and gate status. The router SHALL NOT read `history.jsonl` during step 2.

#### Scenario: Routine invocation skips history file

- **WHEN** the router is invoked for any command except `/ts-deliver:status --history`
- **THEN** `history.jsonl` SHALL NOT be read
- **THEN** routing decisions SHALL be made using only `state.json` content


<!-- @trace
source: ts-deliver-state-slim
updated: 2026-06-28
code:
  - src/skills/ts-deliver-router/SKILL.md
  - .agents/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-commit/SKILL.md
  - .ai/ts-deliver-router/autonomy
  - AGENTS.md
  - .agents/skills/spectra-ask/SKILL.md
  - .ai/ts-deliver-router/state.json
  - .agents/skills/spectra-debug/SKILL.md
  - .agents/skills/spectra-apply/SKILL.md
  - .agents/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-deliver-router/rawfiles/references/state.md
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .agents/skills/spectra-audit/SKILL.md
-->

---
### Requirement: ts-deliver:status --history reads history.jsonl

When invoked with the `--history` flag, `/ts-deliver:status` SHALL read `history.jsonl` and render a phase transition table showing each transition with timestamp, from-phase, to-phase, and a count of artifacts at exit.

#### Scenario: Status with history flag renders transition table

- **WHEN** the user invokes `/ts-deliver:status --history`
- **THEN** the output SHALL include a table of phase transitions read from `history.jsonl`
- **THEN** each row SHALL show: timestamp, from-phase, to-phase

#### Scenario: Status without history flag does not read history.jsonl

- **WHEN** the user invokes `/ts-deliver:status` without `--history`
- **THEN** `history.jsonl` SHALL NOT be read
- **THEN** output SHALL show only current phase status from `state.json`


<!-- @trace
source: ts-deliver-state-slim
updated: 2026-06-28
code:
  - src/skills/ts-deliver-router/SKILL.md
  - .agents/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-commit/SKILL.md
  - .ai/ts-deliver-router/autonomy
  - AGENTS.md
  - .agents/skills/spectra-ask/SKILL.md
  - .ai/ts-deliver-router/state.json
  - .agents/skills/spectra-debug/SKILL.md
  - .agents/skills/spectra-apply/SKILL.md
  - .agents/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-deliver-router/rawfiles/references/state.md
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .agents/skills/spectra-audit/SKILL.md
-->

---
### Requirement: DRY-RUN announces history.jsonl append without executing

When DRY-RUN mode is active, the router SHALL announce the history append as `[DRY-RUN] would append <path>` and SHALL NOT write to `history.jsonl`.

#### Scenario: DRY-RUN phase exit announces but does not write history

- **WHEN** DRY-RUN is active and the router simulates a phase exit
- **THEN** the router SHALL output `[DRY-RUN] would append .ai/ts-deliver-router/history.jsonl`
- **THEN** `history.jsonl` SHALL NOT be created or modified

<!-- @trace
source: ts-deliver-state-slim
updated: 2026-06-28
code:
  - src/skills/ts-deliver-router/SKILL.md
  - .agents/skills/spectra-discuss/SKILL.md
  - .agents/skills/spectra-archive/SKILL.md
  - .agents/skills/spectra-commit/SKILL.md
  - .ai/ts-deliver-router/autonomy
  - AGENTS.md
  - .agents/skills/spectra-ask/SKILL.md
  - .ai/ts-deliver-router/state.json
  - .agents/skills/spectra-debug/SKILL.md
  - .agents/skills/spectra-apply/SKILL.md
  - .agents/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-deliver-router/rawfiles/references/state.md
  - .agents/skills/spectra-propose/SKILL.md
  - .agents/skills/spectra-ingest/SKILL.md
  - .agents/skills/spectra-audit/SKILL.md
-->