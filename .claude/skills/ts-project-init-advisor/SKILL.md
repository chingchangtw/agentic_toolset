---
name: ts-project-init-advisor
description: "Analyzes a project and generates a PROJECT_INIT_PLAN.md — an executable, approval-gated task plan for initializing Claude Code with the right MCPs, skills, sub-agents, hooks, and CLAUDE.md. Activate whenever a user wants to set up or initialize a Claude Code project, asks \"what should I install?\", \"help me configure Claude Code\", \"initialize my project\", \"what MCPs or skills do I need?\", \"review my CLAUDE.md\", or pastes a GitHub URL and wants setup guidance. Also trigger on: \"run project init\", \"scaffold my Claude setup\", \"I'm starting a new project\", \"my Claude Code setup is bare\", or any request to configure Claude Code tooling. Works in both claude.ai (GitHub URL mode) and Claude Code CLI (local scan mode) — detect environment and behave accordingly."
---

# Project Init Advisor

Analyzes a project and produces a single executable artifact: **`PROJECT_INIT_PLAN.md`** — a structured, approval-gated task plan that initializes Claude Code with the right MCPs, skills, sub-agents, hooks, and CLAUDE.md.

Two runtime modes depending on environment:
- **claude.ai** → ask for GitHub repo URL → fetch via GitHub MCP or web → generate downloadable `project_init_plan.md`
- **Claude Code / CLI** → scan local project directory → write `tasks/PROJECT_INIT_PLAN.md` → executable task-by-task with approval gates

---

## Token Governance

1. **Catalog-first**: Read `references/catalog.md` (MUST-HAVE section) before any web call — zero token waste.
2. **Web search optional**: Only search if catalog has no coverage for a detected stack or service.
3. **5-search quota**: Announce counter before each search: `🔍 Search X/5: [reason]`. Hard stop at 5/5.
4. **Approval gate**: At 5/5, ask user to resume (+5) or stop — wait for reply.
5. **User STOP**: "stop searching" → halt immediately, proceed with gathered data.

---

## Phase 0: Detect Runtime Environment

**Before anything else**, determine which mode to run:

```
IF .claude/ directory exists OR local files are readable via filesystem tools
  → MODE: Claude Code (local scan)
  → Skip GitHub URL question
  → Proceed to Phase 1B

ELSE IF running in claude.ai (no filesystem access)
  → MODE: claude.ai (GitHub URL mode)
  → Ask for GitHub repo URL first
  → Proceed to Phase 1A
```

Announce mode at start:
- Claude Code: `"🖥️  Claude Code mode — scanning local project..."`
- claude.ai: `"🌐 claude.ai mode — I'll need your GitHub repo URL to analyze the project."`

---

## Phase 1A: Context Gathering — claude.ai Mode

**Step 1** — Ask for GitHub repo URL (if not already provided):
```
"Please provide your GitHub repository URL so I can analyze the project structure."
```

**Step 2** — Fetch project files via GitHub MCP (if connected) or web_fetch:

Priority fetch order (stop when context is sufficient — conserve tokens):
```
1. README.md or README.rst          → project purpose, stack overview
2. package.json OR pyproject.toml
   OR Cargo.toml OR go.mod          → definitive stack detection
3. .claude/CLAUDE.md                → existing config to analyze
4. .claude/mcp.json                 → already-installed MCPs (dedup)
5. .claude/settings.json            → existing permissions
6. .env.example                     → external services in use
7. .github/workflows/*.yml          → CI/CD tools (first file only)
8. Dockerfile OR docker-compose.yml → infra signals
```

Use GitHub MCP tools if available: `get_file_contents`, `get_repository`
Fallback: `web_fetch https://raw.githubusercontent.com/{owner}/{repo}/main/{path}`

**Step 3** — Run abbreviated user interview (fill gaps not covered by fetched files):

Ask only questions the fetched files didn't answer:
```
[If stack not detected]   Q: Primary tech stack?
[If services unclear]     Q: External services/platforms used? (multi-select)
[If team size unknown]    Q: Team context? Solo | Small (2-5) | Larger (6+) | Enterprise
```

**Step 4** — Read catalog: `references/catalog.md` MUST-HAVE section + relevant stack sections.

**Step 5** — Optional live fetch (quota-governed, only if catalog insufficient).

---

## Phase 1B: Context Gathering — Claude Code Mode

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

**This is the primary deliverable.** Generate the full plan file now.

### Output path
- **claude.ai mode**: present as downloadable file named `project_init_plan.md`
- **Claude Code mode**: write to `tasks/PROJECT_INIT_PLAN.md`

### File format — follow exactly

```markdown
# PROJECT INIT PLAN
Generated: {date}
Project: {name inferred from repo/directory}
Mode: claude.ai (GitHub: {url}) | Claude Code (local)
Source: catalog v{date} [+ live fetch: X/5 searches used]

---

## PROJECT PROFILE
- Type:     {inferred}
- Stack:    {inferred}
- Services: {inferred}
- Team:     {inferred}
- Repo:     {url or local path}

## CLAUDE.md STATUS
- Score: X/16
- Action: {new | patch | minor additions | no change}

---

## HOW TO EXECUTE THIS PLAN

### claude.ai users
1. Download this file
2. Open Claude Code in your project directory
3. Say: "Execute PROJECT_INIT_PLAN.md task by task, ask for my approval before each task"

### Claude Code users (this file is already in tasks/)
Say: "Execute tasks/PROJECT_INIT_PLAN.md task by task, ask for my approval before each task"

Each task will show:
  ▶ TASK N: [name]
  Action: [what will happen]
  Files affected: [list]
  Approve? (yes / skip / stop)

---

## TASKS

### TASK 1: Create .claude directory structure
**Type**: Setup
**Approval required**: yes
**Files**: .claude/, .claude/hooks/, .claude/agents/, tasks/
**Action**:
```bash
mkdir -p .claude/hooks .claude/agents .claude/skills tasks
```
**Verify**: `ls -la .claude/`

---

### TASK 2: Install MCP — {name}
**Type**: MCP Install
**Tier**: 1
**Approval required**: yes
**Why**: {1-sentence rationale tied to this project}
**Action**:
```bash
{exact install command}
```
**Env vars needed**: {list or "none"}
**Verify**: `claude mcp list`

---

[... one TASK block per Tier 1 MCP ...]

---

### TASK N: Install MCP — {name}  [TIER 2]
**Type**: MCP Install
**Tier**: 2
**Approval required**: yes
**Why**: {rationale}
**Action**:
```bash
{exact install command}
```

---

### TASK N: Create hook — {hook-name}.sh
**Type**: Hook
**Tier**: {1|2}
**Approval required**: yes
**Trigger**: {PreToolUse | PostToolUse | PreCompact | SessionStart}
**Matches**: {pattern}
**Why**: {rationale}
**Action**: Create file `.claude/hooks/{hook-name}.sh`:
```bash
{complete hook script content}
```
Then register in `.claude/settings.json`:
```json
{exact hook registration JSON snippet}
```
**Verify**: `cat .claude/hooks/{hook-name}.sh`

---

### TASK N: Create sub-agent — {agent-name}.md
**Type**: Sub-agent
**Tier**: {1|2}
**Approval required**: yes
**Why**: {rationale}
**Action**: Create file `.claude/agents/{agent-name}.md`:
```markdown
{complete agent definition}
```
**Verify**: `cat .claude/agents/{agent-name}.md`

---

### TASK N: Apply settings.json
**Type**: Config
**Approval required**: yes
**Why**: Consolidates all permissions and hook registrations from this plan
**Action**: Write `.claude/settings.json`:
```json
{complete merged settings.json — permissions + all hook registrations}
```
**Verify**: `cat .claude/settings.json`

---

### TASK N: Generate CLAUDE.md
**Type**: Config
**Approval required**: yes
**Why**: {new | replaces weak score X/16 | patches gaps in existing}
**Action**: Write `.claude/CLAUDE.md`:
```markdown
{complete project-specific CLAUDE.md content}
{derived from Phase 1 context — no unfilled placeholders}
{all sections from claudemd-patterns.md}
{references every Tier 1 MCP with usage guidance}
{sub-agent contracts for all Tier 1 agents}
{compaction strategy}
{100-180 lines}
```
**Verify**: `wc -l .claude/CLAUDE.md && head -20 .claude/CLAUDE.md`

---

### TASK N: Install skills
**Type**: Skills
**Approval required**: yes
**Action**:
```bash
{one npx install command per recommended skill}
```
**Verify**: `ls .claude/skills/`

---

### TASK FINAL: Verify full init
**Type**: Verification
**Approval required**: yes
**Action**:
```bash
claude /init
claude mcp list
ls -la .claude/
ls -la .claude/hooks/
ls -la .claude/agents/
```
**Expected**: All installed MCPs listed, all hook files present, CLAUDE.md readable.

---

## TIER 3 — CONSIDER LATER
{name} — {one-line rationale}
{name} — {one-line rationale}

## SKIPPED (already installed)
{list any MCPs/skills found in existing mcp.json that overlap with recommendations}
```

---

### After writing the file

**Claude Code mode** — announce:
```
✅ PROJECT_INIT_PLAN.md written to: tasks/PROJECT_INIT_PLAN.md

To execute:
  "Run tasks/PROJECT_INIT_PLAN.md task by task, ask for my approval before each task"

Tasks: {N} total  |  Tier 1: {n}  |  Tier 2: {n}  |  Hooks: {n}  |  Agents: {n}
```

**claude.ai mode** — present file for download, then announce:
```
✅ project_init_plan.md ready to download.

1. Save it to your project root
2. Open Claude Code in that directory
3. Say: "Execute project_init_plan.md task by task, ask for my approval before each task"
```

Then offer follow-ups (buttons if ask_user_input_v0 available):
```
A. Walk me through a specific task in detail
B. Re-generate plan with different tier selections
C. Show me what the CLAUDE.md will contain
D. Done
```

---

## Recommendation Mapping Logic

### Tier 1 (always include on match)
| Signal | Recommend |
|---|---|
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
