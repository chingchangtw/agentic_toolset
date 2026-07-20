# Agentic Toolset

A distribution framework for Claude Code skills, hooks, and project scaffold templates — built around a dual-track agile workflow that takes ideas from first spark to shipped release.

![version](https://img.shields.io/badge/version-0.1.6-blue)
![license](https://img.shields.io/badge/license-MIT-green)

→ **End-user workflow guide:** [`USER_GUIDE.md`](USER_GUIDE.md)
→ **One-page command reference:** [`docs/dual-track-workflow.html`](docs/dual-track-workflow.html)
→ **Architecture deep-dive:** [`docs/architecture.md`](docs/architecture.md)
→ **Changelog:** [`release/CHANGELOG.md`](release/CHANGELOG.md)

---

## What it does

This toolset installs a family of Claude Code skills and hooks into your project. Two tracks run in parallel:

- **Discovery** — validate ideas before committing to build them
- **Delivery** — execute validated work through a phase-gated spine

`ts-orchestrate` is the session entry point. It routes work across four layers:

| Layer | Owner | Purpose |
|-------|-------|---------|
| D — Discovery | `ts-project-planner` | idea → explore → validate → decide |
| 0 — Backlog | `ts-project-planner` | sync ready items → release map |
| 1 — Sequencing | `ts-project-planner` | iteration → epic → `/ts-deliver:init` |
| 2 — Delivery | `ts-deliver-router` | phase spine per WORK_TYPE |

Start every session with:

```
/ts-orchestrate:start WORK_TYPE=FEATURE|BUGFIX|HOTFIX|REFACTOR|CHORE|PATCH|SPIKE|POC|OPS AUTONOMY=HIGH|MID|LOW
```

Each work type routes to its own phase spine and gate requirements — canonical table in `ts-orchestrate/SKILL.md` → Workflow Routing.

---

## Skills

| Skill | Role |
|-------|------|
| `ts-orchestrate` | **Dual-track orchestrator — session entry point.** Routes all 4 layers, enforces G1/G2 gates, unified status view. |
| `ts-project-planner` | Discovery track (Layer D/0/1). Idea kanban, backlog sync, iteration sequencing. |
| `ts-deliver-router` | Delivery track (Layer 2). Phase spine varies by WORK_TYPE — from 2 phases (CHORE: Build→Ship) up to 7 (EPIC: Think→Plan→Build→Review→Test→Ship→Reflect). |
| `ts-acpl` | Build-phase coding patterns. 20 patterns across 5 groups, mutation-resistant output. |
| `ts-project-scaffolder` | Scaffolds a new project workspace from the standard template. |
| `ts-project-init-advisor` | Analyzes an existing project and generates an executable Claude Code setup plan. |

## Sub-agents

| Agent | Role |
|-------|------|
| `ts-event-storming-facilitator` | Discovery track. Runs domain decomposition during `/ts-discover explore` — required to exit that command (produces `exploration_output`: domain_events, commands, aggregates, bounded_contexts, ubiquitous_language_terms). |
| `ts-ddd-tactical-validator` | Discovery + Delivery Review. Validates tactical DDD patterns and ubiquitous-language coverage; required before `/ts-discover decide build` (FAIL blocks the build decision). |

Installed to `<project>/.claude/agents/` by both installers, packaged via the release manifest's `agents` category.

## Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `inject-workflow-state.sh` | Before each prompt | Injects `[WORKFLOW STATE] phase: <phase> \| active epic: <id>` — ts-orchestrate reads this instead of re-reading state files. Silent if no state files. |
| `ts-session-guard` | Before each prompt | Warns when message count ≥ 10 or context ≥ 70%. |
| `ts-statusline bridge` | After each turn | Displays context percentage in the Claude Code status bar. |

All hooks exit 0 — they never block your session.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Claude Code](https://claude.ai/code) CLI
- Python 3.x (Linux/macOS hooks)
- PowerShell 7+ / `pwsh` (Windows hooks)

For release publishing: [GitHub CLI](https://cli.github.com/) (`gh`)

---

## Installation

### End-user install (from GitHub Releases)

**macOS / Linux:**
```bash
curl -fsSL https://github.com/chingchangtw/agentic_toolset/releases/latest/download/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://github.com/chingchangtw/agentic_toolset/releases/latest/download/install.ps1 | iex
```

The installer downloads `release.zip`, copies skills → `<project>/.claude/skills/` (project-scoped), agents → `<project>/.claude/agents/`, hooks → `~/.claude/hooks/`, and patches `~/.claude/settings.json` with hook registrations. Scaffold templates are skipped by default under piped install (no interactive stdin) — opt in with `SCAFFOLD=y curl ... | bash` (or `$env:SCAFFOLD='y'` before `irm ... | iex` on Windows); add `SCAFFOLD_OVERWRITE=y` to replace existing files.

### Developer setup (from source)

```bash
git clone https://github.com/chingchangtw/agentic_toolset.git
cd agentic_toolset
npm install
```

---

## Development commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm test` | Run all tests |
| `npm test -- <path>` | Run a specific test file |
| `npm run test:watch` | Watch mode |
| `npm run lint` | Lint source |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run type-check` | TypeScript type check — **run after every code change** |

---

## Building and shipping a release

```bash
# Build release.zip
node scripts/build-release.mjs

# Tag and publish
git tag vX.Y.Z && git push origin vX.Y.Z
gh release create vX.Y.Z dist/release.zip release/install.sh release/install.ps1 \
  --title "vX.Y.Z" --notes-file release/CHANGELOG.md
```

`build-release.mjs` validates that every skill directory has a `SKILL.md` and aborts if one is missing.

---

## Project structure

```
agenticToolset/
├── src/
│   ├── skills/                  — Claude Code skill modules (deliverable)
│   │   ├── ts-orchestrate/
│   │   ├── ts-deliver-router/
│   │   ├── ts-project-planner/
│   │   ├── ts-project-scaffolder/
│   │   ├── ts-acpl/
│   │   └── ondemand/            — Lazy-loaded skills
│   │       └── ts-project-init-advisor/
│   ├── agents/                  — Sub-agent prompt files (deliverable, → .claude/agents/)
│   ├── hook/                    — Hook scripts (deliverable)
│   ├── commands/                — Slash-command reference docs
│   ├── scripts/                 — PowerShell helper scripts
│   ├── project_root_structure/  — Scaffold template tree
│   └── utils/                   — TypeScript helpers (phase-routing.ts)
├── scripts/
│   └── build-release.mjs        — Builds dist/release.zip
├── release/
│   ├── install.sh               — macOS/Linux installer
│   ├── install.ps1              — Windows installer
│   └── CHANGELOG.md
├── docs/
│   ├── architecture.md          — Full architecture, skill catalogue, hook data flow
│   ├── solution_cheat_sheet.html — One-page command reference
│   └── Ideas.md                 — Design rationale and decisions
├── openspec/                    — Spectra change proposals and specs
└── tests/                       — Vitest test suite
```

Key distinction: `src/` contains deliverable artifacts that get installed on user machines. `.agents/` is this project's own dev workspace — not packaged.

---

## Adding skills

1. Create `src/skills/<skill-name>/`
2. Add `SKILL.md` — the prompt Claude Code loads on invocation
3. Skills must be self-contained: no cross-skill imports, no shared state

---

## Hard rules

1. Run `npm run type-check` after every code change.
2. Skills are isolated — no cross-skill imports.
3. Use path aliases (`@skills/*`, `@utils/*`) — no `../../` cross-boundary relative paths.
4. `src/index.ts` exports only core and types.

---

## Contributing

- Follow existing TypeScript conventions (strict mode, ESM, path aliases)
- Run `npm run type-check` and `npm test` before committing
- One logical change per PR; Conventional Commits format
- Report issues: [github.com/chingchangtw/agentic_toolset/issues](https://github.com/chingchangtw/agentic_toolset/issues)

---

## License

MIT — see [LICENSE](LICENSE) for details.
