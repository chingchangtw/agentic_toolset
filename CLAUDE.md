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

Distribution framework for Claude Code skills, hooks, and project scaffold templates.
Authors build and maintain skills in `src/`; the build pipeline (`scripts/build-release.mjs`)
packages them into `dist/release.zip` for distribution via GitHub Releases installer.

Key architecture distinction:
- `src/` — deliverable artifacts (skills, hooks, scaffold templates) packaged for end-user install
- `.agents/skills/` and `.claude/skills/` — THIS project's own dev environment (ts-deliver-router,
  Spectra SDD, caveman). NOT part of what gets installed on user machines.

Primary user: developer authoring Claude Code skills to distribute, OR end-user installing
the toolset into their own project.

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

See `docs/architecture.md` for full architecture, skill catalogue, hook data flow, build/distribution pipeline, and repo layout.

> **Dev env note:** `.agents/skills/` and `.claude/skills/` are this project's own
> development tooling (ts-deliver-router + Spectra + caveman). Not packaged into
> `release.zip` — do not confuse with `src/skills/` (the deliverable).

## Hard Rules

1. Run `npm run type-check` after every code change.
2. Skills and plugins must be self-contained — no cross-skill imports.
3. Use path aliases (`@skills/*`, `@utils/*`, etc.) — no `../../` cross-boundary relative paths.
4. `src/index.ts` exports only core and types; do not add skill/plugin exports there.

## Project File Structure

See `docs/architecture.md` → Repository Layout.

## Ship (Release)

See 'docs/architecture.md' → Build and Distribution.

## Out of Scope

- `dist/` — generated, do not edit
- `.env` — local only, gitignored

## Maintenance Checklist

- Owner: tlchang
- Last reviewed: 2026-06-29

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
