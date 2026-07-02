# Architecture

## Overview

agenticToolset is a distribution framework for Claude Code skills, hooks, and project
scaffold templates. It bundles reusable AI agent components and ships them to developer
machines via a GitHub Releases installer.

The repo has two concerns:

1. **Authoring** — developing and maintaining skills, hooks, and scaffold templates in `src/`
2. **Distribution** — packaging and publishing those artifacts via `scripts/build-release.mjs`
   and GitHub Releases

There is no runtime server. Everything runs locally inside the user's Claude Code session.

---

## Repository Layout

```
agenticToolset/
├── src/
│   ├── skills/          — Claude Code skill modules (each independently deployable)
│   ├── hook/            — Claude Code hook scripts (UserPromptSubmit + StatusLine)
│   ├── commands/        — Slash-command reference docs
│   ├── scripts/         — Helper scripts (PowerShell utilities)
│   ├── project_root_structure/  — Scaffold template tree
│   ├── core/            — TypeScript framework base (stub)
│   ├── types/           — Shared TypeScript types (stub)
│   ├── utils/           — Reusable TypeScript helpers (stub)
│   ├── mcp/             — MCP server implementations (stub)
│   └── plugins/         — Plugin modules (stub)
├── scripts/
│   └── build-release.mjs  — Builds release.zip from src/
├── release/
│   ├── install.sh         — Linux/macOS installer (release asset)
│   ├── install.ps1        — Windows installer (release asset)
│   └── CHANGELOG.md       — Release notes
├── dist/                  — Build output (gitignored)
│   └── release.zip
├── openspec/              — Spectra change proposals and specs
└── tests/                 — Test suite (Vitest)
```

---

## Skills

Skills are self-contained Claude Code prompt modules. Each skill lives in its own directory
under `src/skills/` and must contain a `SKILL.md` — the prompt loaded by Claude Code when
the skill is invoked.

Skills are isolated: no cross-skill imports, no shared state files between skills.

### Current Skills

| Skill | Description |
|-------|-------------|
| `ts-orchestrate` | **Dual-track orchestrator — session entry point.** Orchestrates all 4 layers: Layer D (Discovery) → Layer 0 (Backlog) → Layer 1 (Sequencing) → Layer 2 (Delivery spine). `/ts-orchestrate:start WORK_TYPE AUTONOMY` sets active_epic + DIAL, routes to correct phase spine. `/ts-orchestrate:status` shows unified view of Discovery WIP + Delivery phase + pending gates. `/ts-orchestrate:next` enforces G1/G2 before phase advance (never auto-signs). |
| `ts-project-planner` | **Discovery track planner.** Layer D (idea→explore→validate→decide) + Layer 0 (Backlog sync: `--new` / `--sync`) + Layer 1 (Delivery sequencing: `/ts-iteration:start\|next\|close`). Drives `ts-deliver-router` per epic. NOT the top-level orchestrator — that's `ts-orchestrate`. |
| `ts-deliver-router` | **Delivery track engine.** 7-phase spine (Think→Plan→Build→Review→Test→Ship→Reflect); spine varies by epic type (bugfix=3, refactor=6, epic=7). Reads `.ai/ts-deliver-router/state.json` (slim: current phase); history in `.ai/ts-deliver-router/history.jsonl`. |
| `ts-project-scaffolder` | Scaffolds a new project workspace from the standard template. Requires Spectra CLI. |
| `ts-acpl` | AI Coding Pattern Language — pattern library bridging Problem Frame specs → AI-generated code → mutation-resistant output. |
| `ts-project-init-advisor` | Analyzes an existing project and generates `PROJECT_INIT_PLAN.md` — an executable Claude Code setup plan (MCPs, skills, hooks, CLAUDE.md). |

### Skill Loading

Two loading modes:

- **Always-loaded** (`src/skills/`) — bundled into `release.zip` and installed to
  `.claude/skills/` at install time. Available in every session.
- **On-demand** (`src/skills/ondemand/`) — installed to `.claude/skills/ondemand/`.
  Claude Code loads these lazily when referenced.

### Skill Invocation

Skills are invoked via the Claude Code `Skill` tool or slash commands. The `src/commands/`
directory contains reference docs for slash commands that surface specific skills.

---

## Hooks

Hooks are scripts that Claude Code executes at lifecycle events. This project ships three
hook types:

### UserPromptSubmit Hook — `inject-workflow-state.sh`

Fires before each user prompt. Reads `.ai/ts-deliver-router/state.json` and
`.ai/iteration.json` and injects a `[WORKFLOW STATE]` line into Claude's context on
every turn — giving `ts-orchestrate` the current phase and active epic without a file
read per invocation.

Output format:
```
[WORKFLOW STATE] ts-deliver phase: <phase> | active epic: <id>
[NEXT] Run /ts-deliver:refine after <phase-specific guidance>
```

Discovery mode (no `state.json`): `[WORKFLOW STATE] Discovery | dial: <dial> | active_epic: <id or none>`

No state files → silent (empty stdout). Free-text fields (`notes`, etc.) are never
echoed — prompt injection safety. Installs to `${PROJECT_CLAUDE_DIR}/hooks/`
(project-scoped, not global). Install is idempotent.

### UserPromptSubmit Hook — `ts-session-guard`

Fires before each user prompt. Reads the session transcript to count message turns and
reads the shared state file for context percentage. Injects a warning into Claude's
context when thresholds are exceeded. Always exits 0 — never blocks the session.

Thresholds (configurable at top of script):

| Trigger | Threshold | Signal |
|---------|-----------|--------|
| Message count | ≥ 10 turns | advisory |
| Context usage | 70–84% | advisory |
| Context usage | ≥ 85% | critical |

Ships as both `ts-session-guard.py` (Linux/macOS) and `ts-session-guard.ps1` (Windows).

### StatusLine Hook — `ts-statusline` pipeline

Fires after each turn. Extracts `used_percentage` from the Claude Code StatusLine payload,
computes context percentage, writes it to a shared state file, and prints a colored status
bar to the terminal.

The pipeline has three components:

```
ts-statusline_wrapper.sh
  ├── [ -f ts-statusline_bridge.sh ] → execute .sh bridge (if present)
  └── else → python3 ts-statusline_bridge.py

ts-statusline_bridge.py        — Python bridge (Linux/macOS/WSL)
ts-statusline_bridge.ps1       — PowerShell bridge (Windows)
ts-statusline_wrapper.ps1      — Windows wrapper (calls .ps1 bridge + existing statusLine)
```

Both bridges write to a shared state file (`~/.claude/session_guard_state.json`):

```json
{ "context_pct": 42.5 }
```

This file is the data contract between the StatusLine bridge (writer) and the session-guard
hook (reader). The bridges also print a colored dot + percentage to the terminal status bar.

### Hook Data Flow

```
Every turn:
  StatusLine event
    → ts-statusline_wrapper.sh / ts-statusline_wrapper.ps1
    → bridge (py or ps1)
    → writes context_pct to session_guard_state.json
    → prints status bar

Before each prompt (two hooks fire in sequence):
  UserPromptSubmit event
    → inject-workflow-state.sh
    → reads .ai/ts-deliver-router/state.json + .ai/iteration.json
    → injects [WORKFLOW STATE] + [NEXT] into Claude's additionalContext
    → (silent if no state files)

  UserPromptSubmit event
    → ts-session-guard.py / ts-session-guard.ps1
    → reads transcript for message count
    → reads session_guard_state.json for context_pct
    → injects warning into Claude's additionalContext (if threshold exceeded)
```

---

## Project Scaffold Template

`src/project_root_structure/` is a directory tree that the installer copies into new
projects. It establishes the standard workspace layout:

```
.ai/          — project standards, lessons learned, build recipes
.claude/      — CLAUDE.md, governance, hooks, skills, settings
.github/      — Copilot instructions
docs/         — architecture, project init docs
tasks/        — PLAN.md, TASK.md
CLAUDE.md     — project brief (project-scoped)
AGENTS.md     — agent roles
```

`ts-project-scaffolder` uses this template when initializing a new workspace.

---

## Build and Distribution

### Build

`scripts/build-release.mjs` bundles four source directories into `dist/release.zip`:

| Source | Bundle path |
|--------|-------------|
| `src/skills/` | `skills/` |
| `src/hook/` | `hook/` (specific files only) |
| `src/commands/` | `commands/` |
| `src/project_root_structure/` | `scaffold/` |

Every skill directory is validated for a `SKILL.md` before bundling. Missing `SKILL.md`
throws and aborts the build.

### Release Assets

Three assets are uploaded to GitHub Releases:

| Asset | Source | Purpose |
|-------|--------|---------|
| `release.zip` | `dist/release.zip` | Bundled skills, hooks, scaffold |
| `install.sh` | `release/install.sh` | Linux/macOS installer |
| `install.ps1` | `release/install.ps1` | Windows installer |

### Installer Behavior

Both installers:

1. Download `release.zip` from GitHub Releases
2. Extract to a temp directory
3. Copy skills → `.claude/skills/`
4. Copy hooks → `~/.claude/hooks/`
5. Copy commands → `.claude/commands/`
6. Copy scaffold → project root (on demand)
7. Patch `~/.claude/settings.json` with hook registrations

`install.ps1` uses `pwsh`/PowerShell; `install.sh` uses bash + curl/unzip.

### Release Trigger

Cut a new release whenever `src/skills/`, `src/hook/`, `src/commands/`, or
`src/project_root_structure/` changes.

```bash
node scripts/build-release.mjs
git tag vX.Y.Z && git push origin vX.Y.Z
gh release create vX.Y.Z dist/release.zip release/install.sh release/install.ps1 \
  --title "vX.Y.Z" --notes-file release/CHANGELOG.md
```

---

## TypeScript Framework

`src/core/`, `src/types/`, `src/mcp/`, `src/plugins/` exist as stubs. `src/utils/` has
real implementations:

| File | Exports |
|------|---------|
| `src/utils/phase-routing.ts` | `getPhaseList(epicType: "bugfix" \| "refactor" \| "epic"): string[]` — maps epic type to ordered phase array (bugfix→3, refactor→6, epic→7 phases) |

`src/index.ts` re-exports `core` and `types` only.

Path aliases (`@skills/*`, `@plugins/*`, `@mcp/*`, `@utils/*`, `@types/*`) map to `src/`
subdirs via `tsconfig.json`. No cross-boundary relative imports (`../../`).

---

## Key Invariants

- Skills are isolated — no cross-skill imports.
- `src/index.ts` exports only `core` and `types` — skill modules are not re-exported.
- Every skill directory must have `SKILL.md` or the build aborts.
- Hook scripts always exit 0 — hooks never block a Claude Code session.
- `session_guard_state.json` is the shared runtime state between StatusLine bridge and session-guard hook.
- `.ai/ts-deliver-router/state.json` is slim (current phase only, constant size). Full history lives in `.ai/ts-deliver-router/history.jsonl` (append-only, one line per phase exit).
- `inject-workflow-state.sh` never echoes free-text fields — only enum values and IDs (prompt injection prevention).
- Never invoke `/ts-deliver:init` without `active_epic` in `iteration.json` — ts-orchestrate enforces this at entry gate.
- `dist/` is gitignored; `release/` is tracked source.
