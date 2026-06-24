<!--
Each task description states the behavior delivered and the verification target.
File paths are locator context only.
-->

## 1. Section 1 — Required/Optional Section Classifications

- [x] 1.1 Update Required Sections table in `src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md` so that "Required section checklist matches canonical template": rename "Behavior Rules" row to "Hard Rules" (purpose: "Project-specific prohibitions and conventions (≤15 rules)"); remove the "Tool Permissions" row; add a "Commands" row with purpose "Dev/build/test/lint commands" and missing impact "Agent uses wrong commands". Verify: the Required Sections table has exactly the rows Project Overview, Tech Stack, Commands, Hard Rules, Architecture Notes, and no Tool Permissions row.

- [x] 1.2 Update the optional section list so that "Optional section list excludes golden-file content": remove Sub-agent Contracts, Compaction Strategy, and Memory Anchors; keep MCP / Tool References as the sole optional entry. Add a parenthetical scoping note: "(project-specific MCPs only — do NOT duplicate `.claude/CLAUDE.md` behavior)". Verify: the optional list contains only "MCP / Tool References" with the scoping note; Sub-agent Contracts, Compaction Strategy, and Memory Anchors no longer appear.

## 2. Section 2 — Templates

- [x] 2.1 Add a Commands section template so that "Commands section template present": insert the template after the Tech Stack template block, containing `<FILL IN>` placeholders for Dev, Build, Test file, Test all, Lint, and Types commands (matching the format in `src/project_root_structure/CLAUDE.md`). Verify: searching claudemd-patterns.md for "### Commands" yields a fenced code block with all six `<FILL IN>` placeholder lines.

- [x] 2.2 Replace the Behavior Rules template with a Hard Rules template so that "Hard Rules template contains only project-specific examples": rename the `## Behavior Rules` heading to `## Hard Rules`; replace the Always/Never/Code Style block with a numbered list of three project-specific example rules (e.g., "1. Run `npm run type-check` after every code change.", "2. No cross-skill imports — each skill is fully self-contained.", "3. Path aliases (`@skills/*`, `@utils/*`) only — no `../../` cross-boundary relative paths."); add the canonical format note "Format: numbered, ≤15 rules, one line each." Verify: the template section named `### Hard Rules` contains a numbered list and zero occurrences of "### Always" or "### Never" headings.

- [x] 2.3 Remove the Tool Permissions template block from Section 2. Replace the entire `### Tool Permissions` fenced code block with a single redirect line: "Tool permissions → `.claude/settings.json`. Project prohibitions → Hard Rules." Verify: searching claudemd-patterns.md for "### Tool Permissions" in Section 2 templates returns zero fenced code blocks; the redirect line is present.

- [x] 2.4 Remove the Sub-agent Contracts template block from Section 2. Replace the entire `### Sub-agent Contracts` fenced code block with a single redirect line: "Agents registry → `.claude/goverance_CLAUDE.md`." Verify: searching claudemd-patterns.md for "### Sub-agent Contracts" in Section 2 templates returns zero fenced code blocks; the redirect line is present.

- [x] 2.5 Remove the Compaction Strategy template block from Section 2. Delete the entire `### Compaction Strategy` section including its fenced code block with no replacement. Verify: searching claudemd-patterns.md for "### Compaction Strategy" in Section 2 templates returns zero results.

## 3. Section 4 — Scoring Rubric

- [x] 3.1 Update the Scoring Rubric table so that "Scoring rubric uses 12-point scale aligned to required sections": remove the "Tool permissions" row and "Sub-agent contracts" row; rename "Behavior rules" row to "Hard rules" with score-2 criteria "≤15 project-specific rules with rationale". Final table SHALL have exactly 6 rows (Project context, Tech stack, Hard rules, Architecture notes, MCP references, Token hygiene) × 2 points each = 12 maximum. Verify: the rubric table has exactly 6 data rows; no "Tool permissions" or "Sub-agent contracts" rows; "Hard rules" row is present.

- [x] 3.2 Update the score interpretation thresholds to the 12-point scale: replace existing thresholds with "0–3: Major gaps — generate new CLAUDE.md from scratch", "4–7: Moderate gaps — targeted additions", "8–10: Good — minor refinements only", "11–12: Excellent — no action needed". Verify: the four threshold lines appear verbatim; the old 15–16 and 12–14 bands no longer appear.

## 4. Section 5 — Good Example

- [x] 4.1 Remove Sub-agents and Compaction blocks from the Good Example so that "Good Example section contains no golden-file-only blocks": delete the `## Sub-agents` block (the two `### code-reviewer` and `### log-analyzer` lines) and the `## Compaction` block (the Preserve line). Verify: searching the Good Example fenced block for "## Sub-agents" or "## Compaction" returns zero matches.

- [x] 4.2 Rename "Behavior Rules" heading to "Hard Rules" in the Good Example so that "Good Example uses Hard Rules heading": change `## Behavior Rules` to `## Hard Rules` inside the example fenced block. Verify: the Good Example contains exactly one occurrence of "## Hard Rules" and zero occurrences of "## Behavior Rules".

## 5. Acceptance Verification

- [x] 5.1 Confirm file length reduced: `src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md` line count is ≤240 (down from 322). Verify: `wc -l` or equivalent reports ≤240 lines.

- [x] 5.2 Confirm no golden-rule duplication: search the file for the strings "### Always", "### Never", "Sub-agent", "Compaction Strategy", "Memory Anchors", "Tool Permissions" (as template headings, not anti-pattern examples); all must return zero results in Sections 1–2 and Section 4–5. Verify: grep for each string in the file; only occurrences in Section 3 (Anti-Patterns) are acceptable.
