# Agentic Dev Workflow — End User Guide

A structured workflow framework for developing software products with AI coding agents
(Claude Code, Copilot, Gemini) — from first idea to shipped release.

![version](https://img.shields.io/badge/version-0.1.1-blue)
![license](https://img.shields.io/badge/license-MIT-green)

> **Visual reference:** Open [`docs/workflow_cheat_sheet.html`](docs/workflow_cheat_sheet.html)
> in a browser for a side-by-side command reference with clickable copy buttons.

---

## Overview

This toolset installs a family of Claude Code skills and hooks that guide you through
the full software delivery lifecycle — idea discovery, backlog management, epic delivery,
and retrospective — using a dual-track agile model.

Two tracks run in parallel:

- **Discovery** — validate ideas before committing to build them
- **Delivery** — execute validated work through a 7-phase per-epic spine

The three core skills coordinate these tracks:

| Skill | Role |
|-------|------|
| `ts-project-planner` | Cross-epic orchestrator. Manages Discovery → Backlog → Delivery layers. |
| `ts-deliver-router` | Per-epic 7-phase engine (Think → Plan → Build → Review → Test → Ship → Reflect). |
| `ts-acpl` | Build-phase coding discipline. 20 patterns across 5 groups, mutation-resistant output. |

---

## Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed and authenticated
- Python 3.x (Linux/macOS hooks) or PowerShell 7+ / `pwsh` (Windows hooks)
- A project directory with a `CLAUDE.md` (the installer sets this up)

---

## Installation

**Windows (PowerShell):**
```powershell
irm https://github.com/chingchangtw/agentic_toolset/releases/latest/download/install.ps1 | iex
```

**macOS / Linux:**
```bash
curl -fsSL https://github.com/chingchangtw/agentic_toolset/releases/latest/download/install.sh | bash
```

The installer:
1. Downloads and extracts `release.zip` from GitHub Releases
2. Copies skills → `~/.claude/skills/`
3. Copies hooks → `~/.claude/hooks/`
4. Patches `~/.claude/settings.json` with hook registrations

After install, restart Claude Code and initialize your project (see [First Use](#first-use)).

---

## First Use

In your project directory, inside a Claude Code session:

```
/ts-project-planner
```

Follow the on-screen first-use initialization. This creates the `.ai/` workspace structure
your project needs.

For a single-epic project (no portfolio management needed), initialize the router directly:

```
/ts-deliver-router
/ts-deliver:init
```

---

## Workflow

The full lifecycle flows through five stages. See
[`docs/workflow_cheat_sheet.html`](docs/workflow_cheat_sheet.html) for a visual map.

### Stage 01 — Discovery

Validate ideas before planning delivery. Run storming sessions, surface risks, and
decide whether to build, kill, or reduce scope.

```
/ts-discover explore <id>
/ts-discover validate <id>
/ts-discover decide <id> [build|kill|reduce-scope]
```

`validate` is optional for low-uncertainty items. The WIP limit is 3 ideas in
`exploring` + `validating` combined.

### Stage 02 — Backlog

Sync validated ideas into a release plan and epic backlog.

```
/ts-project plan --new <vision>    # seed Discovery with candidate ideas
/ts-project plan --sync            # pull ready items into plan.json as epics
/ts-project refine                 # refine backlog, releases, and priorities
```

### Stage 03 — Iteration Delivery

Orchestrate a release iteration. Sequence dependencies, manage epic progress.

```
/ts-iteration start <release>
/ts-iteration status
/ts-iteration next                 # triggers ts-deliver-router for the next epic
/ts-iteration close
```

### Stage 04 — Epic: Think & Plan (G1 Gate)

`/ts-iteration next` initializes the active epic via `ts-deliver-router`. Work through
Think and Plan phases. Exit requires passing the **G1 security gate** (STRIDE threat model,
100% complete, human sign-off — never auto-signed regardless of autonomy setting).

```
/ts-deliver:status                 # check current phase and state
/ts-deliver:init                   # re-initialize if state is unclear
```

### Stage 05 — Epic: Build, Test & Ship (G2 Gate)

Execute Build → Review → Test → Ship → Reflect. The checks registry runs
automatically per phase. Exiting Ship requires the **G2 security gate** (full checklist,
human sign-off).

```
/ts-deliver:status
/ts-deliver:jump <phase>           # skip to a phase (use with care)
/ts-deliver:refine                 # refine the project registry
```

If Delivery surfaces a new unknown that affects scope or security, the router
automatically calls:
```
/ts-discover idea --from-router    # non-blocking feedback hook back to Discovery
```

---

## Autonomy Settings (DIAL)

`ts-deliver-router` supports three autonomy levels:

| Level | Behavior |
|-------|---------|
| `HIGH` | Auto-proceed through phases. Gates always pause for human. |
| `MID` | Recommend next action, wait for confirmation. (default) |
| `LOW` | Suggest only — human drives every step. |

Switch in-session: `"go auto"` / `"recommend"` / `"suggestions only"`

Security gates (G1, G2) **always** pause for human sign-off, regardless of DIAL level.

---

## Dry-Run Mode

Test the workflow without side effects:

```
"dry-run on"    # prefix all output [DRY-RUN], state.json read-only
"dry-run off"   # resume normal operation
```

Dry-run is session-scoped and not persisted. Cannot sign security gates.
`HIGH + dry-run` is the recommended pre-flight combination.

---

## Hooks

Two hooks run automatically after install:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `ts-session-guard` | Before each prompt | Warns when message count ≥ 10 or context ≥ 70% |
| `ts-statusline bridge` | After each turn | Shows context percentage in the Claude Code status bar |

Hooks always exit 0 — they never block your session.

---

## Workspace Layout

Skills write to a shared `.ai/` directory in your project root:

```
.ai/
├── domain.json               — event-storming domain model
├── discovery.json            — Discovery backlog + Ready-for-Delivery buffer
├── iteration.json            — current release state
├── risks.md                  — risk register
├── decisions/                — Architecture Decision Records (ADRs)
├── ts-deliver-router/        — per-epic state, autonomy, registry
└── ts-project-planner/       — plan.json, retrospectives
```

Only `ts-deliver-router` may append to `discovery.json` (via the feedback hook).
Only `ts-project-planner` may set `status` and `decision` fields on Discovery entries.

---

## Configuration

Hook thresholds are set at the top of each hook script in `~/.claude/hooks/`:

| File | Configurable thresholds |
|------|------------------------|
| `ts-session-guard.py` / `.ps1` | Message count (default 10), context advisory (70%), context critical (85%) |
| `ts-statusline_bridge.py` / `.ps1` | None — display only |

---

## Example Workflows

### 1 — New greenfield project

Starting from a raw idea with no existing backlog.

```
# Initialize the planner workspace
/ts-project-planner

# Seed Discovery with the product vision
/ts-project plan --new "Build a multi-tenant invoicing SaaS"

# Explore and validate the riskiest idea
/ts-discover explore INV-001
/ts-discover validate INV-001

# Decision: build it
/ts-discover decide INV-001 build

# Pull validated ideas into the release plan
/ts-project plan --sync

# Start the first release iteration
/ts-iteration start MVP

# Kick off the first epic — triggers ts-deliver-router
/ts-iteration next
```

`ts-deliver-router` takes over from here: Think → Plan (G1 gate) → Build → Review → Test → Ship (G2 gate) → Reflect.

---

### 2 — Single bugfix or small standalone change

No portfolio management needed. Go directly to the router.

```
# Initialize the router for this repo
/ts-deliver-router
/ts-deliver:init

# Check current state at any time
/ts-deliver:status
```

The router runs the same 7-phase spine at reduced scope. Refactor and bugfix
work unit profiles skip Plan and Ship phases automatically.

---

### 3 — Mid-delivery scope change (feedback hook)

During Build phase, the team discovers a new external dependency not previously
in scope. The router fires the feedback hook automatically:

```
# (automatic — triggered by ts-deliver-router during Think or Build)
/ts-discover idea --from-router
```

This creates a new Discovery entry linked to the current epic. Delivery
continues without blocking. Later:

```
# Check what the hook surfaced
/ts-discover status

# Validate and decide in the next planning cycle
/ts-discover validate NEW-007
/ts-discover decide NEW-007 build

# Sync into the next release
/ts-project plan --sync
/ts-iteration start v1.1
```

The feedback hook never writes `status` or `decision` — only `ts-project-planner`
(human-invoked) can move an idea to `ready` or `killed`.

---

### 4 — Full dual-track loop (portfolio across two releases)

Both tracks run continuously in parallel. Release 1 is in Delivery while
Release 2's ideas are already in Discovery.

```
# Release 1 — in progress
/ts-iteration status                    # check delivery progress

# Release 2 — Discovery running in parallel
/ts-discover explore REL2-001
/ts-discover validate REL2-001
/ts-discover decide REL2-001 build

# When Release 1 closes, sync Release 2's ready items
/ts-iteration close                     # prompts: check /ts-discover status
/ts-project plan --sync
/ts-iteration start "Release 2"
/ts-iteration next                      # first epic of Release 2
```

`/ts-iteration close` explicitly surfaces pending Discovery items — the prompt
"Discovery has been running in parallel — check `/ts-discover status`" is
built into the close flow.

---

## Contributing

[TODO] Contribution guidelines not yet written. In the meantime:

- Report issues at [github.com/chingchangtw/agentic_toolset/issues](https://github.com/chingchangtw/agentic_toolset/issues)
- Follow existing TypeScript conventions (strict mode, ESM)
- Run `npm run type-check` and `npm test` before submitting a PR

---

## License

MIT — see [LICENSE](LICENSE) for details.
