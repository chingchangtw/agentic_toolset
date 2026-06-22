---
name: ts-project-init-advisor
description: "Generates PROJECT_INIT_PLAN.md"
---
<!--
"Analyzes a project and generates PROJECT_INIT_PLAN.md — an executable, approval-gated Claude Code setup plan (MCPs, skills, hooks, CLAUDE.md). Activate when user asks to set up, initialize, or configure Claude Code for a project. Works in claude.ai (GitHub URL) and Claude Code (local scan)."
-->

# Project Init Advisor

Analyzes a project and produces a single executable artifact: **`PROJECT_INIT_PLAN.md`** — a structured, approval-gated task plan that initializes Claude Code with the right MCPs, skills, sub-agents, hooks, and CLAUDE.md.

---

## Token Governance

1. **Catalog-first**: Read `references/catalog.md` (MUST-HAVE section) before any web call — zero token waste.
2. **Web search optional**: Only search if catalog has no coverage for a detected stack or service.
3. **5-search quota**: Announce counter before each search: `🔍 Search X/5: [reason]`. Hard stop at 5/5.
4. **Approval gate**: At 5/5, ask user to resume (+5) or stop — wait for reply.
5. **User STOP**: "stop searching" → halt immediately, proceed with gathered data.


---

| Need | Source / Module |
|------|-----------------|
| Tool catalog (MUST-HAVE section) | `references/catalog.md` |
| CLAUDE.md scoring rubric | `references/claudemd-patterns.md` |
| Problem → recommendation mapping | Internal Phase 3 logic (keep inline) |
| Init plan template format | `references/init-plan-template.md` |

---

## Phase 1: Context Gathering — Claude Code Mode

**Step 1** — Read catalog immediately:
```
Read: references/catalog.md  →  MUST-HAVE section into working memory
```

**Step 2** — Scan local project (shell commands):
```bash
# Stack detection
ls package.json pyproject.toml Cargo.toml go.mod pom.xml 2>/dev/null
cat package.json 2>/dev/null | head -40
cat pyproject.toml 2>/dev/null | head -40

# Existing Claude config
ls .claude/ 2>/dev/null
cat .claude/CLAUDE.md 2>/dev/null
cat .claude/mcp.json 2>/dev/null
cat .claude/settings.json 2>/dev/null

# Project signals
cat README.md 2>/dev/null | head -30
cat .env.example 2>/dev/null
ls .github/workflows/ 2>/dev/null
ls src/ app/ lib/ tests/ 2>/dev/null
ls Dockerfile docker-compose.yml 2>/dev/null
```

**Step 3** — Run user interview for gaps only (same questions as 1A, skip answered ones).

**Step 4** — Optional live fetch (quota-governed).

---

## Phase 2: CLAUDE.md Analysis (if one found)

Score the existing CLAUDE.md using `references/claudemd-patterns.md` rubric:

| Dimension | Check | Score 0–2 |
|---|---|---|
| Project context | Purpose, stack, phase stated? | |
| Behavior rules | Always/never/style explicit? | |
| Tool permissions | Allow/deny calibrated? | |
| Memory anchors | Key decisions + "never do X"? | |
| MCP references | MCPs listed with usage guidance? | |
| Sub-agent contracts | Role + trigger + handoff? | |
| Compaction strategy | /compact instructions present? | |
| Token hygiene | Under 200 lines with clear value? | |

**Total: X/16**
- 0–6 → generate new CLAUDE.md from scratch in the plan
- 7–11 → targeted patches in the plan
- 12–16 → minor additions only

---

## Phase 3: Build Recommendation Set

Apply mapping logic (see Recommendation Mapping Logic section).
Produce three lists:
- **Tier 1** — install first, highest impact
- **Tier 2** — add when ready
- **Tier 3** — situational, mention only

For each Tier 1 + 2 item, resolve:
- Exact install command
- Exact settings.json permission snippet
- Hook file content (if hook)
- Sub-agent file content (if sub-agent)

This data feeds directly into Phase 4 task generation.

---

## Phase 4: Generate PROJECT_INIT_PLAN.md

Generate the full plan file using the template → `references/init-plan-template.md`.  Output path: `tasks/PROJECT_INIT_PLAN.md` (Claude Code).

---

### After writing the file

**Claude Code mode** — announce:
```
✅ PROJECT_INIT_PLAN.md written to: tasks/PROJECT_INIT_PLAN.md

To execute:
  "Run tasks/PROJECT_INIT_PLAN.md task by task, ask for my approval before each task"

Tasks: {N} total  |  Tier 1: {n}  |  Tier 2: {n}  |  Hooks: {n}  |  Agents: {n}
```

---

## Recommendation Mapping Logic

### Tier 1 (always include on match)
| Signal | Recommend |
|---|---|
| Any project | `ponytail` plugin (Claude Code) |
| Any project | `Graphify` MCP (code graph) |
| Any project | `caveman` skill + system installer |
| Any project | `spectra` app (open project in Spectra) |
| Any project | `code-review-graph` MCP |
| Any project | `Superpowers` plugin (Claude Code) |
| Any project | `mattpocock/skills` (global) |
| GitHub / GitLab detected | `github` MCP + `git-operations` skill |
| Jira / Confluence / Atlassian | `atlassian` MCP + `atlassian-rest-api` skill |
| Google Workspace | `google-drive` MCP + `gmail` MCP |
| Slack | `slack` MCP |
| PostgreSQL / MySQL / Mongo | database MCP + `schema-reviewer` sub-agent |
| AI / LLM project | `web-search` tool + `prompt-optimization` skill |
| Python project | `filesystem` MCP + `python-test-runner` skill |
| Team ≥ 2 | `code-reviewer` sub-agent |
| API / backend | `api-tester` sub-agent |
| Enterprise + Atlassian | full Rovo agent suite |
| Any project | `block-env-edit` hook + `session-summary` hook (MUST-HAVE) |

### Tier 2 (include if stack matches)
| Signal | Recommend |
|---|---|
| Any project | `ratacat/claude-skills@clean-code` |
| Any project | `ratacat/claude-skills@design-patterns` |
| Any project | `VoltAgent/awesome-agent-skills` (browse collection, pick relevant) |
| Any project | `Impeccable` (frontend design skill) |
| Any project | `Design Council` ⚠️ unverified install |
| Any project | `Anthropic Cybersecurity Skills` ⚠️ unverified install |
| Any web project | `UI UX Pro Max` ⚠️ unverified install |
| Any web project | `Awesome Claude Design` ⚠️ unverified install |
| Any web project | `researcher` sub-agent |
| Prettier / Black / gofmt detected | `format-on-edit` hook |
| ESLint / Ruff detected | `lint-on-edit` hook |
| TypeScript | `typecheck-on-edit` hook |
| Tests directory exists | `run-related-tests` hook |
| Security paths (auth/, payments/) | `confirm-sensitive-edit` hook |
| CI/CD present | `log-analyzer` sub-agent |
| Team ≥ 3 | `council-advisor` skill |
| Complex architecture | `planner` sub-agent |

### Tier 3 (mention at bottom of plan, no task block)
- Mobile → platform-specific MCPs
- Infra/DevOps → cloud-provider MCPs
- Niche stack → domain-specific skills

---

## Quality Standards

- Never generate a task for an MCP already in `.claude/mcp.json` — add to SKIPPED section instead
- Never add permissions broader than the project requires
- All install commands must be exact — never invent package names
- All hook scripts must be complete and runnable — no pseudocode
- All sub-agent definitions must include role, trigger, input, output, handoff
- CLAUDE.md in the plan must have zero unfilled placeholders
- Every task must have an exact verify command
- Unverified live-fetched MCPs: flag ⚠️ UNVERIFIED, move to Tier 3

---

## Reference Files

- `references/catalog.md` — Static registry: MCPs, skills, hooks, sub-agents, permissions
- `references/claudemd-patterns.md` — CLAUDE.md templates, anti-patterns, scoring rubric
