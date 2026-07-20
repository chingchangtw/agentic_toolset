# sub-agent
[DONE — dual-track-orchestration] ## ts-event-storming, ts-ddd-tactial-validator are optional discover:explore but always in dicsover:validate

# move think spine from ts-deliver to ts-prorject-planner

# have G1 threat-model in ts-deliver plan as well if no ts-deliver ever

# learn ts- registry design in ts-project-planner as well 

# harnessPRD
[ DONE ]

# DESIGN-src-edit-guard.md

# PRD — Multi-CLI Portability: Codex CLI + Copilot CLI Targets

# Problem: grep or bash on .json/.jsonl in .agents/
It is text match, no structure. Breaks on nested/multi-line JSON, can't extract by key, false-positives on substrings.

Better tools, ranked:
1. jq — right tool for both .json and .jsonl.
  - .json: jq '.current_phase' .agents/ts-deliver-router/state.json
  - .jsonl: jq -c 'select(.event=="phase_exit")' .agents/ts-deliver-router/history.jsonl (jq streams line-by-line NDJSON natively with
-c/--slurp)
  - Structural, key-aware, no false positives, no manual line-splitting.
2. For "does X exist / grep speed on huge jsonl": jq is fine at repo scale (state files are KB, not GB). No need for anything heavier.
3. grep still useful for: coarse pre-filter before piping to jq (grep -l "G1" *.jsonl | xargs jq ...), or when you just need "does this
string appear anywhere" with no structure.
4. code-review-graph MCP (per this project's CLAUDE.md) — for code lookups, not state files. Doesn't apply to .agents/*.json*.

Two ways to actually "force" this — pick based on how hard you want the block:

Option A — PreToolUse hook (real enforcement, blocks the call)
A PreToolUse hook matching Bash that inspects the command; if it's grep/cat/head/sed/awk targeting a .json/.jsonl path, exit non-zero with a message telling the agent to use jq instead. This actually stops the tool call — matches your CLAUDE.md line "Deterministic enforcement → .claude/hooks/, not prose."

Option B — CLAUDE.md rule (nudge only, no enforcement)
Add a line next to the existing "Tool preferences" section:
For *.json / *.jsonl content (values, filtering, structure) — use `jq`, never grep/cat/sed.
Grep tool is for filename/text search only, not structured JSON extraction.
Same pattern as your existing "Never use Bash find/grep..." rule. Cheap, but the agent can still ignore it under pressure — no hard stop.

Option B is conducted.
