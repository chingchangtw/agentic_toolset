# Project Init Advisor — Static Catalog

Last reviewed: 2025-06. Catalog-first: exhaust this before any web search.

---

## TABLE OF CONTENTS
0. [MUST-HAVE — Universal Baseline](#must-have)
1. [MCPs — Official Anthropic / First-Party](#mcps-official)
2. [MCPs — Ecosystem / Third-Party](#mcps-ecosystem)
3. [Claude Code Skills (npx)](#skills)
4. [Sub-agent Archetypes](#sub-agents)
5. [Hooks — Lifecycle Automations](#hooks)
6. [Settings.json Permission Blocks](#permissions)

---

## 0. MUST-HAVE — Universal Baseline {#must-have}

These apply to **every project regardless of stack or size**. Always include in Tier 1 without needing a trigger match.

### filesystem (built-in)
- **Why always**: Claude Code needs explicit read/write scope to operate safely on project files
- **settings.json minimum**:
  ```json
  {
    "permissions": {
      "allow": ["Read(*)", "Write(src/**)", "Edit(*)"],
      "deny": ["Write(.env*)", "Bash(rm -rf:*)", "Bash(sudo:*)"]
    }
  }
  ```

### git-operations skill
- **Why always**: Every code project needs commit, branch, diff, and log workflows
- **Install**: `npx @anthropic-ai/claude-code skills add git-operations`
- **Minimum CLAUDE.md entry**:
  ```
  Git: always branch before feature work; never push to main directly
  ```

### code-reviewer sub-agent
- **Why always**: Catches regressions, style drift, and security issues before commit
- **Template**: see Sub-agent Archetypes → code-reviewer

### researcher sub-agent
- **Why always**: Offloads doc lookup and external context from main agent, saving tokens
- **Template**: see Sub-agent Archetypes → researcher

### CLAUDE.md baseline sections (non-negotiable)
Every generated CLAUDE.md must contain at minimum:
1. Project Overview (type, stack, phase)
2. Behavior Rules (always / never / style)
3. Tool Permissions (allow / deny lists)
4. Architecture Notes (key decisions, don't-touch zones)
5. Compaction Strategy (what to preserve on /compact)

### Must-have hooks (non-negotiable)
These two hooks apply to every project regardless of stack:
- `block-env-edit.sh` — PreToolUse guard on `.env*` files (see Section 5)
- `session-summary.sh` — PreCompact session log writer (see Section 5)

> **Token note**: The MUST-HAVE section is the only part of this catalog that must be read in full for every run.
> Sections 1–5 below: read only the subsections relevant to the detected stack and services.

---

---

## 1. MCPs — Official Anthropic / First-Party {#mcps-official}

### filesystem
- **Purpose**: Read/write local files; required for any project that touches the filesystem beyond Claude Code's default scope
- **Tags**: universal, file-ops
- **Install**:
  ```bash
  # Built-in to Claude Code — enable in settings.json
  ```
- **settings.json**:
  ```json
  {
    "permissions": {
      "allow": ["Read(*)", "Write(*)", "Edit(*)"]
    }
  }
  ```
- **Use-case tags**: all projects

### web-search
- **Purpose**: Live web search during sessions — fetch docs, check APIs, research errors
- **Tags**: research, universal
- **Install**: Built-in tool, enable via:
  ```json
  { "tools": { "web_search": true } }
  ```
- **Use-case tags**: AI/LLM, research-heavy, any

### web-fetch
- **Purpose**: Fetch specific URLs — documentation pages, API specs, changelogs
- **Tags**: research, docs
- **Install**: Built-in tool
- **Use-case tags**: API projects, documentation work

---

## 2. MCPs — Ecosystem / Third-Party {#mcps-ecosystem}

### github
- **Purpose**: Read/write GitHub issues, PRs, repos, actions, releases
- **Tags**: version-control, CI/CD, team
- **Install**:
  ```bash
  claude mcp add github -- npx -y @modelcontextprotocol/server-github
  ```
- **Env required**: `GITHUB_TOKEN`
- **Permissions**:
  ```json
  { "permissions": { "allow": ["mcp__github__*"] } }
  ```
- **Use-case tags**: any project on GitHub, team workflows, PR review agents

### atlassian (Rovo)
- **Purpose**: Jira issues, Confluence pages, JSM requests, Rovo search — full Atlassian Cloud suite
- **Tags**: project-management, enterprise, knowledge-base
- **Install**: Connect via claude.ai MCP settings → Atlassian Rovo
- **MCP URL**: `https://mcp.atlassian.com/v1/mcp`
- **Permissions**:
  ```json
  { "permissions": { "allow": ["mcp__atlassian__*"] } }
  ```
- **Use-case tags**: enterprise teams, Jira users, Confluence documentation, ASIC/NPI workflows

### google-drive
- **Purpose**: Read/write Google Drive files, Docs, Sheets, Slides
- **Tags**: google-workspace, documents
- **Install**: Connect via claude.ai MCP settings → Google Drive
- **MCP URL**: `https://drivemcp.googleapis.com/mcp/v1`
- **Use-case tags**: teams using Google Workspace, document automation

### gmail
- **Purpose**: Search threads, create drafts, manage labels
- **Tags**: google-workspace, email
- **Install**: Connect via claude.ai MCP settings → Gmail
- **MCP URL**: `https://gmailmcp.googleapis.com/mcp/v1`
- **Use-case tags**: teams using Gmail, email automation, communication workflows

### postgres
- **Purpose**: Query PostgreSQL databases directly in context
- **Tags**: database, backend
- **Install**:
  ```bash
  claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres $DATABASE_URL
  ```
- **Env required**: `DATABASE_URL`
- **Use-case tags**: backend services, data pipelines, API projects with DB

### sqlite
- **Purpose**: Read/write SQLite databases
- **Tags**: database, local
- **Install**:
  ```bash
  claude mcp add sqlite -- npx -y @modelcontextprotocol/server-sqlite --db-path ./data.db
  ```
- **Use-case tags**: CLI tools, local-first apps, prototypes

### slack
- **Purpose**: Read channels, post messages, search Slack workspace
- **Tags**: team-communication, notifications
- **Install**:
  ```bash
  claude mcp add slack -- npx -y @modelcontextprotocol/server-slack
  ```
- **Env required**: `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID`
- **Use-case tags**: team projects, notification automation, standups

### linear
- **Purpose**: Create/update Linear issues, projects, and cycles
- **Tags**: project-management, startup
- **Install**:
  ```bash
  claude mcp add linear -- npx -y @linear/mcp-server
  ```
- **Env required**: `LINEAR_API_KEY`
- **Use-case tags**: startups using Linear, agile teams

### notion
- **Purpose**: Read/write Notion pages, databases, and blocks
- **Tags**: knowledge-base, documents
- **Install**:
  ```bash
  claude mcp add notion -- npx -y @notionhq/mcp-server
  ```
- **Env required**: `NOTION_TOKEN`
- **Use-case tags**: teams using Notion for docs or project tracking

### aws-kb-retrieval
- **Purpose**: Query AWS Bedrock Knowledge Bases
- **Tags**: cloud, AI, enterprise
- **Install**:
  ```bash
  claude mcp add aws-kb -- npx -y @modelcontextprotocol/server-aws-kb-retrieval
  ```
- **Use-case tags**: AWS-based AI applications, enterprise RAG systems

### puppeteer
- **Purpose**: Browser automation — scraping, E2E testing, screenshot capture
- **Tags**: testing, browser, scraping
- **Install**:
  ```bash
  claude mcp add puppeteer -- npx -y @modelcontextprotocol/server-puppeteer
  ```
- **Use-case tags**: web apps needing E2E tests, scraping projects

### memory
- **Purpose**: Persistent key-value memory across Claude Code sessions
- **Tags**: state, context-management
- **Install**:
  ```bash
  claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
  ```
- **Use-case tags**: long-running projects, AI agents, stateful workflows

### brave-search
- **Purpose**: Web search via Brave API (alternative to built-in search)
- **Tags**: research, search
- **Install**:
  ```bash
  claude mcp add brave-search -- npx -y @modelcontextprotocol/server-brave-search
  ```
- **Env required**: `BRAVE_API_KEY`
- **Use-case tags**: research-heavy projects, when built-in search is insufficient

---

## 3. Claude Code Skills (npx) {#skills}

### core-skills (always recommended)
```bash
npx @anthropic-ai/claude-code skills add git-operations
npx @anthropic-ai/claude-code skills add code-reviewer
npx @anthropic-ai/claude-code skills add researcher
```

### by project type

| Project Type | Recommended Skills |
|---|---|
| Web App | `frontend-design`, `accessibility-checker`, `api-contract` |
| API / Backend | `openapi-spec`, `api-contract`, `database-migrations` |
| AI / LLM App | `prompt-optimization`, `eval-runner`, `token-optimizer` |
| Data Pipeline | `data-validator`, `schema-checker`, `pipeline-debugger` |
| CLI Tool | `cli-ux-checker`, `help-text-generator` |
| Enterprise/Atlassian | `atlassian-rest-api` (via Tony's skill library) |
| Any Team | `vibe-coding-scaffold`, `six-thinking-hats-coach` |

### user skill library (Tony's installed skills — always available)
These are pre-installed and available without npx:
- `adaptive-communication-architect` — message rewriting, stakeholder comms
- `atlassian-rest-api` — Jira/Confluence/JSM API reference
- `business-english-enhancer` — professional writing polish
- `council-advisor` — strategic decision pressure-testing
- `critical-thinker` — structured reasoning frameworks
- `first-principles-agent` — assumption stripping, first-principles analysis
- `mastery-tutor` — learning architecture for any topic
- `six-thinking-hats-coach` — decision coaching via de Bono method
- `the-master-prompt-optimization-architect` — prompt engineering (4-D method)
- `tows-strategy-analyst` — TOWS strategic analysis
- `url-safety-validator` — URL and command safety verification

---

## 4. Sub-agent Archetypes {#sub-agents}

These are sub-agent definitions to generate in `.claude/agents/`. Each includes a name, role, trigger condition, and handoff protocol.

### code-reviewer
```markdown
Role: Review code changes for correctness, security, and style alignment
Trigger: After any significant code write; before git commit
Input: Diff or file paths
Output: Structured review with PASS/FAIL/SUGGEST per concern
Handoff: Return findings to main agent; block commit on FAIL
```

### researcher
```markdown
Role: Fetch and synthesize external information (docs, RFCs, changelogs)
Trigger: When main agent needs external context not in project files
Input: Research question + URL hints
Output: Structured findings with source citations
Handoff: Return summary + sources; main agent cites in CLAUDE.md memory
```

### log-analyzer
```markdown
Role: Parse and diagnose build logs, test output, and error traces
Trigger: On test failure, build error, or CI/CD pipeline failure
Input: Raw log text or file path
Output: Root cause hypothesis + suggested fix
Handoff: Return diagnosis to main agent; suggest next bash command
```

### api-tester
```markdown
Role: Generate and execute API test cases against a running service
Trigger: After API endpoint implementation
Input: OpenAPI spec or endpoint description
Output: Test matrix with pass/fail results and curl examples
Handoff: Return test results; flag regressions
```

### schema-reviewer
```markdown
Role: Review database schema changes for consistency, naming, and migration safety
Trigger: Before applying migrations
Input: Migration files or schema diff
Output: Review with GO/NO-GO verdict and explanation
Handoff: Block migration on NO-GO; pass to main agent
```

### security-auditor
```markdown
Role: Scan code for security anti-patterns, hardcoded secrets, and injection risks
Trigger: Before any PR or release; when handling user input or auth code
Input: File paths or diff
Output: Findings with severity (CRITICAL/HIGH/MEDIUM/LOW) and remediation
Handoff: Block on CRITICAL; flag HIGH for human review
```

### docs-writer
```markdown
Role: Generate or update documentation from code and comments
Trigger: After feature completion; when README or API docs are stale
Input: Source files + doc style guide
Output: Updated markdown docs
Handoff: Return doc files; main agent commits to docs/ directory
```

### planner
```markdown
Role: Break down features or tasks into scoped, sequenced implementation steps
Trigger: At session start; when tackling a feature > 2 files
Input: Feature description + existing codebase context
Output: Ordered task list with file-level scope per step
Handoff: Return plan; main agent executes step-by-step
```

---

## 5. Hooks — Lifecycle Automations {#hooks}

Hooks are shell scripts that fire automatically on Claude Code tool events. Stored in `.claude/hooks/`. Registered in `settings.json` under `"hooks"`.

### Hook Types

| Type | Fires | Typical Use |
|---|---|---|
| `PreToolUse` | Before a tool runs | Block dangerous ops, require confirmation |
| `PostToolUse` | After a tool completes | Auto-format, lint, run tests |
| `PreCompact` | Before context compaction | Save session summary |
| `SessionStart` | When a new session opens | Print project context reminder |

### settings.json Hook Registration Format
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit(*)",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/format-on-edit.sh $CLAUDE_TOOL_INPUT_PATH" }]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Edit(.env*)",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/block-env-edit.sh" }]
      }
    ]
  }
}
```

---

### MUST-HAVE Hooks (Tier 1 — universal)

#### block-env-edit.sh
- **Trigger**: PreToolUse on `Edit(.env*)` and `Write(.env*)`
- **Why**: Prevents accidental credential leaks — most common Claude Code footgun
- **File**: `.claude/hooks/block-env-edit.sh`
```bash
#!/bin/bash
echo "🚫 BLOCKED: Direct edits to .env files are not allowed."
echo "   Edit .env.example instead, or confirm this is intentional."
exit 1
```
- **settings.json entry**:
```json
{ "matcher": "Edit(.env*)", "hooks": [{ "type": "command", "command": "bash .claude/hooks/block-env-edit.sh" }] }
```

#### block-lockfile-edit.sh
- **Trigger**: PreToolUse on `Edit(package-lock.json)`, `Edit(yarn.lock)`, `Edit(*.lock)`
- **Why**: Lock files should never be hand-edited; always regenerated by package manager
- **File**: `.claude/hooks/block-lockfile-edit.sh`
```bash
#!/bin/bash
echo "🚫 BLOCKED: Do not edit lock files directly."
echo "   Run 'npm install' or 'yarn' to regenerate."
exit 1
```

#### session-summary.sh (PreCompact)
- **Trigger**: PreCompact
- **Why**: Preserves a plain-text session log before context is compacted — recoverable audit trail
- **File**: `.claude/hooks/session-summary.sh`
```bash
#!/bin/bash
LOGFILE="tasks/session-log.md"
mkdir -p tasks
echo -e "\n---\n## Session: $(date '+%Y-%m-%d %H:%M')" >> "$LOGFILE"
echo "Context compacted. Review $LOGFILE for history." 
```

---

### Stack-Conditional Hooks (Tier 2)

#### format-on-edit.sh (PostToolUse)
- **Trigger**: PostToolUse on `Edit(*)`
- **Variants** — generate the right one based on detected formatter:

| Formatter detected | Script content |
|---|---|
| Prettier (`.prettierrc` exists) | `npx prettier --write "$1" 2>/dev/null` |
| Black (`pyproject.toml` with black) | `black "$1" 2>/dev/null` |
| gofmt (`.go` files) | `gofmt -w "$1" 2>/dev/null` |
| rustfmt (`Cargo.toml` exists) | `rustfmt "$1" 2>/dev/null` |

```bash
#!/bin/bash
# format-on-edit.sh — replace body with variant above
FILE="$1"
[[ -z "$FILE" ]] && exit 0
npx prettier --write "$FILE" 2>/dev/null || true
```

#### lint-on-edit.sh (PostToolUse)
- **Trigger**: PostToolUse on `Edit(src/**)` or `Edit(*.ts)` etc.
- **Variants**:

| Linter | Script content |
|---|---|
| ESLint | `npx eslint "$1" --fix 2>/dev/null` |
| Ruff (Python) | `ruff check "$1" --fix 2>/dev/null` |
| golangci-lint | `golangci-lint run "$1" 2>/dev/null` |

#### typecheck-on-edit.sh (PostToolUse — TypeScript)
- **Trigger**: PostToolUse on `Edit(*.ts)`, `Edit(*.tsx)`
```bash
#!/bin/bash
npx tsc --noEmit 2>&1 | tail -20
```

#### run-related-tests.sh (PostToolUse)
- **Trigger**: PostToolUse on `Edit(src/**)`
- **Variants**:

| Test runner | Script content |
|---|---|
| Jest / Vitest | `npx vitest related "$1" --run 2>&1 | tail -30` |
| pytest | `python -m pytest --tb=short -q 2>&1 | tail -30` |
| Go test | `go test ./... 2>&1 | tail -20` |

---

### Security Hooks (Tier 1 for auth/payments code)

#### confirm-sensitive-edit.sh (PreToolUse)
- **Trigger**: PreToolUse on `Edit(auth/**)`, `Edit(payments/**)`, `Edit(**/security/**)`
```bash
#!/bin/bash
echo "⚠️  SENSITIVE PATH: You're about to edit security-critical code."
echo "   Path: $1"
echo "   Proceed? (Claude will require explicit confirmation)"
read -p "Type 'yes' to continue: " confirm
[[ "$confirm" == "yes" ]] || exit 1
```

---

### Utility Hooks (Tier 3)

#### session-start-reminder.sh (SessionStart)
- **Trigger**: SessionStart
- **Why**: Prints key project rules at session open so Claude doesn't forget them
```bash
#!/bin/bash
echo "📋 PROJECT CONTEXT REMINDER"
echo "================================"
grep -A 20 "## Behavior Rules" .claude/CLAUDE.md 2>/dev/null | head -25 || true
echo "================================"
```

---

## 6. Settings.json Permission Blocks {#permissions}

### Minimal (read-only, safe default)
```json
{
  "permissions": {
    "allow": ["Read(*)"],
    "deny": ["Write(*)", "Bash(rm:*)", "Bash(curl:*)"]
  }
}
```

### Standard Development
```json
{
  "permissions": {
    "allow": [
      "Read(*)",
      "Write(src/**)",
      "Write(tests/**)",
      "Write(docs/**)",
      "Edit(*)",
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(git:*)",
      "Bash(python:*)",
      "Bash(pytest:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(sudo:*)",
      "Write(.env*)"
    ]
  }
}
```

### Full Development (trusted project, team env)
```json
{
  "permissions": {
    "allow": ["Read(*)", "Write(*)", "Edit(*)", "Bash(*)"],
    "deny": [
      "Bash(rm -rf /)",
      "Bash(sudo rm:*)",
      "Write(.env)",
      "Write(.env.production)"
    ]
  }
}
```

### Enterprise / Atlassian Project
```json
{
  "permissions": {
    "allow": [
      "Read(*)",
      "Write(src/**)", "Write(docs/**)", "Write(tests/**)",
      "Edit(*)",
      "Bash(git:*)", "Bash(npm:*)", "Bash(npx:*)",
      "mcp__atlassian__*",
      "mcp__github__*"
    ],
    "deny": [
      "Bash(rm -rf:*)",
      "Bash(sudo:*)",
      "Write(.env*)",
      "Write(secrets/**)"
    ]
  }
}
```
