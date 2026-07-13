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
| **Commands** | Dev/build/test/lint commands | Agent uses wrong commands |
| **Hard Rules** | Project-specific prohibitions and conventions (≤15 rules) | Unpredictable, inconsistent sessions |
| **Architecture Notes** | Key decisions, constraints, "never do X" | Violates project conventions |

Optional but high-value:
- **MCP / Tool References** — project-specific MCPs only (do NOT duplicate `.claude/CLAUDE.md` behavior)

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

### Commands
```markdown
## Commands
Dev:        <FILL IN, e.g. npm run dev>
Build:      <FILL IN, e.g. npm run build>
Test file:  <FILL IN, e.g. npm test -- path/to/file>
Test all:   <FILL IN, e.g. npm test>
Lint:       <FILL IN, e.g. npm run lint:fix>
Types:      <FILL IN, e.g. npx tsc --noEmit>
```

### Hard Rules
```markdown
## Hard Rules

Format: numbered, ≤15 rules, one line each.

1. Run `npm run type-check` after every code change.
2. No cross-skill imports — each skill is fully self-contained.
3. Path aliases (`@skills/*`, `@utils/*`) only — no `../../` cross-boundary relative paths.
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

### MCP / Tool References (optional)

Only project-specific MCP setup. Do NOT duplicate `.claude/CLAUDE.md` behavior.

```markdown
## MCP Tools
### <Name>: Use for: <tasks in this project>. Key tools: <list>.
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
| Hard rules | Missing | Some rules | ≤15 project-specific rules with rationale |
| Architecture notes | Missing | Some notes | Key decisions + constraints |
| MCP references | Missing | Listed | Listed + usage guidance |
| Token hygiene | Bloated | OK | Tight + well-structured |

**Score interpretation:**
- 0–3: Major gaps — generate new CLAUDE.md from scratch
- 4–7: Moderate gaps — targeted additions
- 8–10: Good — minor refinements only
- 11–12: Excellent — no action needed

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

## Hard Rules

1. Write async functions — no blocking I/O anywhere.
2. Add a pytest test for every new endpoint or service method.
3. Use Pydantic v2 models for all request/response shapes.
4. Log structured JSON, never plain strings.
5. No synchronous SQLAlchemy calls.
6. Never hardcode connection strings — always use Settings from config.py.
7. Never modify alembic/versions/ directly — use `alembic revision --autogenerate`.

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

```
