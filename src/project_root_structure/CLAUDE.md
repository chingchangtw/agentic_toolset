# CLAUDE.md — Project Brief

Project-specific. Owns: stack, architecture, file structure, project-scoped hard rules.

**See also**
- `.claude/CLAUDE.md` — universal behaviour, anti-slop guardrail, core principles, communication style, mandatory prompt rule.
- `.claude/goverance_CLAUDE.md` — Definition of Done, Release Readiness, registries, agent roles, implementation workflow, self-reflection cadence.

> **Template usage:** Replace every `<FILL IN: ...>` placeholder. Delete sections that do not apply. Keep this file under ~150 lines. Deletion test on every line: "Would removing this cause a specific mistake? If no → delete."

## Project
<FILL IN: one line — what this project does and who uses it.>
<FILL IN: business / domain context — constraints, regulatory posture, primary user.>

## Stack
- Language: <FILL IN, e.g. TypeScript 5.x>
- Framework: <FILL IN, e.g. Next.js 14 App Router>
- Data layer: <FILL IN, e.g. Postgres via Drizzle ORM>
- Deployment: <FILL IN, e.g. Vercel static export>
- Key dependencies: <FILL IN, e.g. Zod, TanStack Query, shadcn/ui>

## Commands
```
Dev:        <FILL IN, e.g. npm run dev>
Build:      <FILL IN, e.g. npm run build>
Test file:  <FILL IN, e.g. npm test -- path/to/file>
Test all:   <FILL IN, e.g. npm test>
Lint:       <FILL IN, e.g. npm run lint:fix>
Types:      <FILL IN, e.g. npx tsc --noEmit>
```

## Specs
Change proposals and specs live in `openspec/`. Read `openspec/specs/` for capability specs, `openspec/changes/` for active change proposals before implementing.

## Architecture Map
Directory roles:
- `<FILL IN: src/lib/services/>` — <FILL IN: business logic>
- `<FILL IN: src/components/>` — <FILL IN: stateless UI only>
- `<FILL IN: src/lib/store/>` — <FILL IN: global state>
- `<FILL IN: src/app/api/>` — <FILL IN: API routes, no business logic>

Cross-boundary rules:
- <FILL IN: e.g. Data access only through Server Actions or repository layer — no direct DB calls from components.>
- <FILL IN: e.g. No business logic in UI components.>
- <FILL IN: e.g. Static export only — no SSR.>

## Tool preferences
Never use Bash `find`, `grep`, `ls -R`, or `cat` for file discovery/search.
Always use the Glob tool for filename/pattern search and the Grep tool for
content search. This applies on every OS — not just Windows — for consistency.

For `*.json` / `*.jsonl` content (values, filtering, structure) — use `jq`, never
grep/cat/sed. Grep/Glob are for filename and text search only, not structured
JSON extraction. Applies to `.agents/*.json*` state files in particular.

## Project File Structure
```text
project-root/
├── CLAUDE.md                  → this file (project brief)
├── CLAUDE.local.md            → personal overrides, gitignored
├── .gitignore
├── .agents/
│   ├── ANTI_AI_STYLE.md       → style guard (referenced by global)
│   ├── LESSONS_LEARNED.md     → durable lessons (see goverance)
│   ├── build-test-validate.md → build / test / validate recipes
│   └── standards.md           → project-specific standards
├── .claude/
│   ├── global_CLAUDE.md       → universal agent behaviour
│   ├── goverance_CLAUDE.md    → DoD, registries, agent roles, workflow
│   ├── hooks/                 → deterministic enforcement
│   ├── commands/              → slash-command flows
│   ├── skills/                → model-invokable, on-demand
│   ├── agents/                → subagents with isolated context
│   ├── rules/                 → path-scoped rules (loaded on glob match)
│   ├── settings.json          → permissions, model, hook registry
│   └── settings.local.json    → personal settings, gitignored
├── docs/
│   └── architecture.md        → architecture deep-dive (optional)
├── src/                       → application source
├── tests/                     → test source
└── tasks/
	├── todo.md                → current plan, checkable items
	└── checkpoint.md          → state persisted across compactions
```

## Hard Rules (project-scoped, ≤15, one line each)
Deletion test: if removing the line would not cause a specific mistake, drop it.

1. <FILL IN, e.g. All async calls must use try/catch with structured logging.>
2. <FILL IN, e.g. Functional components only — no class components.>
3. <FILL IN, e.g. Run `npx tsc --noEmit` after every code change.>
4. <FILL IN, e.g. PRs must pass `npm test` and `npm run lint` before merge.>
5. <FILL IN, e.g. No direct `fetch` in components — go through the API client layer.>
6. <FILL IN, e.g. Migrations are forward-only; rollback via new migration, never edit in place.>
7. <FILL IN: add project-specific rule>
8. <FILL IN: add project-specific rule>


## Workflow (project pointer)
Think → Plan → Build → Review → Test → Ship → Reflect & Document.
Detailed 7-step workflow, Definition of Done, and Release Readiness gates live in `.claude/goverance_CLAUDE.md`.

## Out of Scope
- <FILL IN: files manually maintained — do not touch.>
- <FILL IN: integrations the agent should not modify.>
- <FILL IN: vendored or generated code paths, e.g. `dist/`, `gen/`.>
- <FILL IN: legacy directories scheduled for removal.>

## Maintenance Checklist
- Review monthly. Drop rules that haven't prevented a specific mistake in 90 days.
- After every user correction → add a lesson to `.agents/LESSONS_LEARNED.md` (see `.claude/goverance_CLAUDE.md`).
- Promote stable lessons into a Hard Rule above when the pattern recurs.
- Owner: <FILL IN: name / team responsible for this file.>
- Last reviewed: <FILL IN: YYYY-MM-DD>.
