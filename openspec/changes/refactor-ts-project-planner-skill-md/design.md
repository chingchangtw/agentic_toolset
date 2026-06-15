## Context

`src/skills/ts-project-planner/SKILL.md` is 641 lines / 25 KB. Claude Code loads this entire file into context on every skill invocation, regardless of which command (`/ts-discover`, `/ts-project`, `/ts-iteration`) is active. The `ts-deliver-router` skill solves the same problem at 109 lines by keeping a compact core and lazy-loading reference files per-command.

Four reference files were previously drafted and live in `tasks/ts-project-planner/references/` — they are ready to copy. The `src/skills/ts-project-planner/references/` directory exists but is empty.

## Goals / Non-Goals

**Goals:**
- Reduce SKILL.md from 641 lines to ~100 lines
- Extract all detail sections into 8 `references/*.md` files
- Maintain `raw/` as canonical verbose originals (caveman-compressed `references/` are derived)
- Caveman-compress all 8 `references/` files (40-60% line reduction)
- Update SKILL_caveman.md to mirror new compact core shape

**Non-Goals:**
- No behavior changes to command logic, state machine rules, or integration contracts
- No new commands or capabilities
- `raw/` files SHALL NOT be compressed
- No changes to `ts-deliver-router` or any other skill
- No removal of `tasks/ts-project-planner/references/` source files (copy only)

## Decisions

### Flat extraction pattern (Approach A)

Mirror `ts-deliver-router` exactly: one compact SKILL.md with LOAD INDEX table, multiple lazy-loaded reference files. Considered hierarchical grouping (e.g., by command family) but flat is simpler and matches the existing router pattern.

### raw/ directory as canonical source

`references/` files are caveman-compressed and therefore lossy for human editing. `raw/` stores the verbose originals so maintainers edit there and re-compress. Alternative (edit compressed directly) would cause drift and semantic loss.

### Caveman-full compression for references only

SKILL.md core stays readable prose — it is the routing entrypoint and must be human-legible. Only `references/*.md` get compressed. Compression rule: drop articles/filler/hedging, keep ALL technical content (field names, state transitions, command syntax, table rows, code blocks unchanged).

### LOAD INDEX placement

LOAD INDEX table goes at the bottom of the compact SKILL.md, after workspace paths and architecture diagram. Agents read top-down — routing logic first, then load only what the current step needs.

## Implementation Contract

**Behavior after change:**
- Claude Code loads SKILL.md on skill invocation — context cost drops from ~25 KB to ~4 KB
- Agents running `/ts-discover`, `/ts-project`, or `/ts-iteration` commands MUST load `references/commands.md` first (LOAD INDEX rule)
- All command logic, state machine transitions, workspace contracts, and integration rules are preserved verbatim in `raw/references/`; compressed equivalents in `references/` reduce tokens 40-60%
- `raw/` is the edit target — `references/` is always re-derived from `raw/`

**File structure contract (relative to project root):**
- `src/skills/ts-project-planner/SKILL.md` — ~100 lines, contains LOAD INDEX table
- `src/skills/ts-project-planner/SKILL_caveman.md` — terse mirror of new compact core + LOAD INDEX
- `src/skills/ts-project-planner/references/` — 8 caveman-compressed files
- `src/skills/ts-project-planner/raw/SKILL.md` — verbose core before compression
- `src/skills/ts-project-planner/raw/references/` — 8 verbose originals

**Acceptance criteria:**
- `wc -l src/skills/ts-project-planner/SKILL.md` reports < 120
- `grep "LOAD INDEX" src/skills/ts-project-planner/SKILL.md` matches
- All 8 files present in both `references/` and `raw/references/`
- `grep "ts-discover explore" src/skills/ts-project-planner/references/commands.md` matches (command preserved through compression)
- `grep "exploring\|validating\|ready\|killed" src/skills/ts-project-planner/references/discovery-state.md` — all states present
- Compressed `references/commands.md` line count < 65% of `raw/references/commands.md`

**Scope boundaries:**
- In scope: files under `src/skills/ts-project-planner/` only
- Out of scope: `tasks/ts-project-planner/references/` (read-only source), any other skill directory, test files, `src/index.ts`

## Risks / Trade-offs

- [Two-source maintenance] `raw/` and `references/` can drift if maintainers forget the authority rule → Mitigation: authority rule documented in SKILL.md and README; `raw/` is canonical and clearly labeled
- [Compression semantic loss] Caveman-full compression could drop a technical detail that looks like prose filler → Mitigation: spot-check 3 technical facts per file against raw/ before finalizing; fail if any fact missing
- [Compression ratio check] If compressed file > 65% of raw line count, compression may be insufficient → Mitigation: verify ratio per file; flag and re-compress if needed
