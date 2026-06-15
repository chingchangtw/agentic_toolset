# CLAUDE.md Patterns Library

Reference for Phase 2 CLAUDE.md analysis. Use these to evaluate user files and generate suggestions.

---

## TABLE OF CONTENTS
1. [Required Sections](#required)
2. [Section Templates](#templates)
3. [Anti-Patterns](#anti-patterns)
4. [Scoring Rubric](#rubric)
5. [Complete Good Example](#example)

---

## 1. Required Sections {#required}

Every CLAUDE.md should contain at minimum:

| Section | Purpose | Missing Impact |
|---|---|---|
| **Project Overview** | What this project is and does | Claude lacks context; generic behavior |
| **Tech Stack** | Languages, frameworks, key dependencies | Wrong idioms, wrong patterns |
| **Behavior Rules** | How Claude should operate in this project | Unpredictable, inconsistent sessions |
| **Tool Permissions** | What bash/file ops are allowed | Either too cautious or too permissive |
| **Architecture Notes** | Key decisions, constraints, "never do X" | Violates project conventions |
| **MCP / Tool References** | Which MCPs are installed and how to use them | MCPs ignored or misused |

Optional but high-value:
- **Sub-agent Contracts** — when to spawn, what to hand off
- **Compaction Strategy** — what to preserve in `/compact` summaries
- **Memory Anchors** — sticky facts Claude must never forget

---

## 2. Section Templates {#templates}

### Project Overview
```markdown
## Project Overview
[Project name] is a [type: web app / API / CLI / data pipeline / AI application] 
built with [primary stack]. It [core purpose in one sentence].

Key constraints:
- [constraint 1]
- [constraint 2]

Current phase: [prototype / active development / maintenance / production]
```

### Tech Stack
```markdown
## Tech Stack
- **Language**: [e.g., TypeScript 5.x / Python 3.12]
- **Framework**: [e.g., Next.js 14 / FastAPI / Express]
- **Database**: [e.g., PostgreSQL via Prisma / SQLite]
- **Testing**: [e.g., Vitest / pytest / Jest]
- **Package manager**: [npm / yarn / pnpm / uv / poetry]
- **Key libraries**: [list 3-5 most important]
- **Deployment**: [e.g., Vercel / AWS Lambda / Docker / bare metal]
```

### Behavior Rules
```markdown
## Behavior Rules

### Always
- Write tests for any new function or feature
- Follow existing code style — don't introduce new patterns without asking
- Keep changes minimal and scoped; don't refactor unless asked
- Add inline comments for non-obvious logic

### Never
- Modify .env files or secrets
- Run destructive bash commands (rm -rf, DROP TABLE) without explicit confirmation
- Change the database schema without generating a migration
- Push to main directly — always suggest a branch

### Code Style
- [e.g., Use named exports, not default exports]
- [e.g., Prefer async/await over callbacks]
- [e.g., Errors should always be typed, never `any`]
```

### Tool Permissions
```markdown
## Tool Permissions

### Allowed
- Read any file
- Write to: src/, tests/, docs/
- Run: npm, npx, git, python, pytest, make

### Restricted (ask before running)
- Installing new dependencies
- Running database migrations
- Any network requests outside of tests

### Forbidden
- Writing to .env, .env.local, .env.production
- Running with sudo
- Deleting files outside of tmp/
```

### Architecture Notes
```markdown
## Architecture Notes

### Key Decisions
- [Decision 1]: [rationale] — DO NOT change without discussion
- [Decision 2]: [rationale]

### Patterns in Use
- [Pattern name]: [where and why, e.g., "Repository pattern for all DB access"]
- [Pattern name]: [where and why]

### Known Constraints
- [e.g., "This must run on Node 18 — no Node 20+ syntax"]
- [e.g., "No external HTTP calls from the core module — use adapters"]

### Don't Touch
- [file/module]: [reason, e.g., "legacy code — refactor is tracked in JIRA-1234"]
```

### MCP / Tool References
```markdown
## MCP Tools Available

### GitHub MCP
- Use for: reading/creating issues, reviewing PRs, checking CI status
- Do NOT use for: pushing commits (use git bash instead)
- Key tools: `create_issue`, `list_pull_requests`, `get_file_contents`

### Atlassian MCP
- Use for: Jira issue lookups, Confluence page reads/updates, JSM requests
- Project key: [YOUR-PROJECT-KEY]
- Main Confluence space: [SPACE-KEY]

### Filesystem
- Working directory: ./src
- Sensitive paths (read-only): ./config/production/, ./.env*
```

### Sub-agent Contracts
```markdown
## Sub-agents

### code-reviewer
- Invoke when: any change >50 lines or touching auth/payments/DB
- Pass: diff + file context
- Expect back: PASS/FAIL with file:line findings

### researcher  
- Invoke when: need current docs, API specs, or external context
- Pass: specific question + URL hints if known
- Expect back: structured summary with sources

### planner
- Invoke when: new feature > 2 files or unclear scope
- Pass: feature description + relevant existing files
- Expect back: ordered task list with file scope
```

### Compaction Strategy
```markdown
## Compaction Strategy

When /compact is triggered, preserve:
1. This entire CLAUDE.md (do not summarize)
2. Current task: [what we're working on]
3. Decisions made this session: [list]
4. Files modified: [list with 1-line summary of change]
5. Blockers/open questions: [list]

Drop:
- Full file contents (they're on disk)
- Exploration tangents that didn't land
- Error traces that are resolved
```

---

## 3. Anti-Patterns {#anti-patterns}

### ❌ Vague project description
```markdown
# Bad
This project is for our app.

# Good  
CustomerPortal is a B2B SaaS web application (Next.js 14 + PostgreSQL) 
that lets enterprise clients manage their subscription and user access.
```

### ❌ Missing stack specifics
```markdown
# Bad
We use TypeScript and React.

# Good
TypeScript 5.3, React 18, Next.js 14 App Router, Tailwind 3.4, 
Prisma 5.x on PostgreSQL 16, deployed on Vercel.
```

### ❌ Overly permissive permissions
```markdown
# Bad (too open)
permissions: allow all bash

# Good
Allow: git, npm, npx, pytest
Deny: sudo, rm -rf, writing to .env
```

### ❌ Rules without rationale
```markdown
# Bad
Don't use default exports.

# Good
Don't use default exports — this codebase uses named exports consistently 
for better IDE auto-import support and refactoring safety.
```

### ❌ Bloated CLAUDE.md (>300 lines of prose)
- Move large reference docs to `references/` and link from CLAUDE.md
- Keep CLAUDE.md as the index + rules layer only
- Target: under 150 lines for straightforward projects

### ❌ No "never do" section
Every project has things Claude absolutely must not do. Make them explicit.

### ❌ No MCP usage guidance
Installing MCPs without telling Claude how to use them in this project → MCPs get ignored.

---

## 4. Scoring Rubric {#rubric}

Score each dimension 0–2:

| Dimension | 0 | 1 | 2 |
|---|---|---|---|
| Project context | Missing | Vague | Clear + specific |
| Tech stack | Missing | Partial | Complete + versioned |
| Behavior rules | Missing | Some rules | Comprehensive + rationale |
| Tool permissions | Missing | Present | Calibrated + specific |
| Architecture notes | Missing | Some notes | Key decisions + constraints |
| MCP references | Missing | Listed | Listed + usage guidance |
| Sub-agent contracts | Missing | Named | Named + trigger + handoff |
| Token hygiene | Bloated | OK | Tight + well-structured |

**Score interpretation:**
- 0–6: Major gaps — generate new CLAUDE.md from scratch
- 7–11: Moderate gaps — targeted additions
- 12–14: Good — minor refinements only
- 15–16: Excellent — no action needed

---

## 5. Complete Good Example {#example}

```markdown
# CLAUDE.md — InventorySync API

## Project Overview
InventorySync is a REST API service (Python / FastAPI) that synchronizes 
inventory data between ERP systems and 3PLs. Core responsibility: 
reliable, idempotent event processing with a dead-letter queue.

Current phase: Active development (MVP targeting Q3)

## Tech Stack
- Language: Python 3.12
- Framework: FastAPI 0.111
- Database: PostgreSQL 15 via SQLAlchemy 2.x (async)
- Message queue: Redis Streams
- Testing: pytest + httpx
- Package manager: uv
- Deployment: Docker → AWS ECS

## Behavior Rules

### Always
- Write async functions throughout — no blocking I/O anywhere
- Add a pytest test for every new endpoint or service method
- Use Pydantic v2 models for all request/response shapes
- Log structured JSON, never plain strings

### Never  
- Use synchronous SQLAlchemy calls
- Hardcode connection strings — always use Settings from config.py
- Add new dependencies without noting them in this file
- Modify alembic/versions/ — generate migrations via `alembic revision --autogenerate`

## Tool Permissions
Allow: python, pytest, alembic, git, docker, uv
Deny: sudo, rm -rf, writing to .env.production

## Architecture Notes
- All DB access goes through repository classes in src/repositories/
- Events are idempotent by design — event_id is the dedup key
- Never call external APIs from inside a repository — use service layer
- The dead-letter queue is in src/dlq/ — touch carefully

## MCP Tools
### GitHub MCP
- Use for issue tracking only — check GITHUB-[n] references in comments
- Don't use for code pushes

### Filesystem
- Working dir: src/
- Off-limits: .env, .env.production, alembic/versions/

## Sub-agents
### code-reviewer: invoke before any commit touching auth/ or dlq/
### log-analyzer: invoke on pytest failure or Docker build errors

## Compaction
Preserve: this file, current task, decisions this session, files touched
```
