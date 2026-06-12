# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- SPECTRA:START v1.0.2 -->

# Spectra Instructions

This project uses Spectra for Spec-Driven Development(SDD). Specs live in `openspec/specs/`, change proposals in `openspec/changes/`.

## Use `/spectra-*` skills when:

- A discussion needs structure before coding → `/spectra-discuss`
- User wants to plan, propose, or design a change → `/spectra-propose`
- Tasks are ready to implement → `/spectra-apply`
- There's an in-progress change to continue → `/spectra-ingest`
- User asks about specs or how something works → `/spectra-ask`
- Implementation is done → `/spectra-archive`
- Commit only files related to a specific change → `/spectra-commit`

## Workflow

discuss? → propose → apply ⇄ ingest → archive

- `discuss` is optional — skip if requirements are clear
- Requirements change mid-work? Plan mode → `ingest` → resume `apply`

## Parked Changes

Changes can be parked（暫存）— temporarily moved out of `openspec/changes/`. Parked changes won't appear in `spectra list` but can be found with `spectra list --parked`. To restore: `spectra unpark <name>`. The `/spectra-apply` and `/spectra-ingest` skills handle parked changes automatically.

<!-- SPECTRA:END -->

# CLAUDE.md — Project Brief

**See also**
- `.claude/CLAUDE.md` — universal behaviour, anti-slop guardrail, core principles, communication style, mandatory prompt rule.
- `.claude/goverance_CLAUDE.md` — Definition of Done, Release Readiness, registries, agent roles, implementation workflow, self-reflection cadence.

## Project

Framework for building and hosting AI agent skills, plugins, and MCP (Model Context Protocol) artifacts. Primary user: AI agent developers building Claude Code skills and tools.

## Stack

- Language: TypeScript 5.x (strict mode, ES2020, ESM `"type": "module"`)
- Runtime: Node.js with `ts-node/esm` loader for dev
- Test: Vitest 1.x
- Build output: `./dist` with declarations + source maps
- Path aliases: `@skills/*`, `@plugins/*`, `@mcp/*`, `@utils/*`, `@types/*` → map to `src/` subdirs

## Specs
Change proposals and specs live in `openspec/`. Read `openspec/specs/` for capability specs, `openspec/changes/` for active change proposals before implementing.

## Commands

```
Dev:        npm run dev
Build:      npm run build
Test file:  npm test -- <path>
Test all:   npm test
Test watch: npm run test:watch
Lint:       npm run lint
Lint fix:   npm run lint:fix
Types:      npm run type-check
```

## Architecture

- `src/skills/` — self-contained skill modules; each skill is independently deployable
- `src/plugins/` — plugin modules extending core functionality
- `src/mcp/` — MCP server implementations
- `src/core/` — base classes and framework interfaces (exported via `src/index.ts`)
- `src/types/` — shared TypeScript definitions (exported via `src/index.ts`)
- `src/utils/` — reusable helpers

Skills are isolated by directory. Each skill owns its own submodules (e.g., `lifecycle-router/` contains registry, state, phases, security-gates). `src/index.ts` exports only `core` and `types` — skills/plugins are not re-exported from root.

## Hard Rules

1. Run `npm run type-check` after every code change.
2. Skills and plugins must be self-contained — no cross-skill imports.
3. Use path aliases (`@skills/*`, `@utils/*`, etc.) — no `../../` cross-boundary relative paths.
4. `src/index.ts` exports only core and types; do not add skill/plugin exports there.

## Project File Structure

```text
project-root/
├── CLAUDE.md                  → this file (project brief)
├── CLAUDE.local.md            → personal overrides, gitignored
├── .gitignore
├── .ai/
│   ├── ANTI_AI_STYLE.md       → style guard (referenced by global)
│   ├── LESSONS_LEARNED.md     → durable lessons (see goverance)
│   ├── build-test-validate.md → build / test / validate recipes
│   └── standards.md           → project-specific standards
├── .claude/
│   ├── CLAUDE.md              → universal agent behaviour
│   ├── goverance_CLAUDE.md    → DoD, registries, agent roles, workflow
│   ├── hooks/                 → deterministic enforcement
│   ├── commands/              → slash-command flows
│   ├── skills/                → model-invokable, on-demand
│   ├── agents/                → subagents with isolated context
│   ├── settings.json          → permissions, model, hook registry
│   └── settings.local.json    → personal settings, gitignored
├── docs/
│   └── architecture.md        → architecture deep-dive
├── src/                       → application source
├── tests/                     → test source
└── openspec/                  → Spectra specs and change proposals
```

## Out of Scope

- `dist/` — generated, do not edit
- `.env` — local only, gitignored

## Maintenance Checklist

- Owner: tlchang
- Last reviewed: 2026-06-10

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
| ------ | ---------- |
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
