# Agentic Dev Workflow — End User Guide

A structured workflow framework for developing software products with AI coding agents
(Claude Code, Copilot, Gemini) — from first idea to shipped release.

![version](https://img.shields.io/badge/version-0.1.1-blue)
![license](https://img.shields.io/badge/license-MIT-green)

> **Visual reference:** Open [`docs/solution_cheat_sheet.html`](docs/solution_cheat_sheet.html)
> in a browser for a one-page command reference covering all 4 orchestration layers.

---

## Overview

This toolset installs a family of Claude Code skills and hooks that guide you through
the full software delivery lifecycle — idea discovery, backlog management, epic delivery,
and retrospective — using a dual-track agile model.

Two tracks run in parallel:

- **Discovery** — validate ideas before committing to build them
- **Delivery** — execute validated work through a 7-phase per-epic spine

Four skills coordinate these tracks across four layers:

| Skill | Role |
|-------|------|
| `ts-orchestrate` | **Dual-track orchestrator — session entry point.** Orchestrates Layer D → 0 → 1 → 2. Sets WORK_TYPE + DIAL, routes phase spine, enforces G1/G2 gates, provides unified status. |
| `ts-project-planner` | Discovery track planner. Manages Layer D (idea→explore→validate→decide), Layer 0 (backlog sync), Layer 1 (iteration sequencing). |
| `ts-deliver-router` | Delivery track engine (Layer 2). 7-phase spine (Think→Plan→Build→Review→Test→Ship→Reflect); spine varies by WORK_TYPE. |
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
/ts-orchestrate:start WORK_TYPE=EPIC AUTONOMY=MID
```

`ts-orchestrate` is the session entry point for all work types. It reads the
`[WORKFLOW STATE]` hook, sets `active_epic` + `dial` in `iteration.json`, and
routes to the correct phase spine. If no project exists yet, it directs you to:

```
/ts-project:plan --new "<vision>"    # seed Discovery with candidate ideas
```

For a single bugfix or small standalone change (no portfolio management):

```
/ts-orchestrate:start WORK_TYPE=BUGFIX AUTONOMY=MID
```

This activates the lean spine: Think → Build → Ship (no G1/G2 gates).

---

## Workflow

The full lifecycle flows through four orchestration layers. See
[`docs/solution_cheat_sheet.html`](docs/solution_cheat_sheet.html) for a visual map.

### Session Start — ts-orchestrate

Always begin with ts-orchestrate. It reads the `[WORKFLOW STATE]` hook injected each
prompt turn and determines which layer is active.

```
/ts-orchestrate:start WORK_TYPE=EPIC|REFACTOR|BUGFIX AUTONOMY=HIGH|MID|LOW
/ts-orchestrate:status             # unified Discovery + Delivery view
/ts-orchestrate:next               # advance with gate enforcement
```

### Layer D — Discovery

Validate ideas before committing to build. Run in parallel with Delivery.

```
/ts-discover:idea                  # capture raw idea → discovery.json
/ts-discover:explore <id>          # research + assumption mapping
/ts-discover:validate <id>         # test riskiest assumption (skip if no H-risk)
/ts-discover:decide <id> [build|kill|keep-learning|reduce-scope]
/ts-discover:status                # kanban view · WIP limit = 3
```

### Layer 0 — Backlog

Sync validated ideas into a release plan and epic backlog.

```
/ts-project:plan --new "<vision>"  # seed Discovery with candidate ideas (first use)
/ts-project:plan --sync            # pull ready items → plan.json as epics
```

### Layer 1 — Iteration Sequencing

Sequence epics per release. Each `/ts-iteration:next` drives ts-deliver-router for one epic.

```
/ts-iteration:start <release>
/ts-iteration:next                 # advance epic → calls /ts-deliver:init
/ts-iteration:close                # close after last epic (prompts Discovery check)
```

### Layer 2 — Epic Delivery (ts-deliver-router)

Per-epic 7-phase spine. Spine varies by WORK_TYPE:

| WORK_TYPE | Spine | Gates |
|-----------|-------|-------|
| `BUGFIX` | Think → Build → Ship | none (lean) |
| `REFACTOR` | Think → Plan → Build → Review → Ship → Reflect | G1 |
| `EPIC` | Think → Plan → Build → Review → Test → Ship → Reflect | G1 + G2 |

**G1** (threat-model) blocks Think→Plan for REFACTOR + EPIC. **G2** (sec-review) blocks
Ship for EPIC. Both require human sign-off — never auto-signed at any DIAL level.

```
/ts-deliver:status                 # current phase + gate status
/ts-deliver:jump <phase>           # skip to phase (use with care)
/ts-deliver:refine                 # refine project registry
```

If Delivery surfaces a new unknown affecting scope or security, the router fires
automatically:
```
/ts-discover:idea --from-router    # non-blocking feedback hook → Discovery
```

---

## Autonomy Settings (DIAL)

Set via `/ts-orchestrate:start AUTONOMY=...` or switch in-session:

| Level | Behavior |
|-------|---------|
| `HIGH` | Auto-advance after gate sign-off. Gates always pause for human. |
| `MID` | Recommend next action, wait for confirmation. **(default)** |
| `LOW` | Suggest only — human drives every step. |

Switch in-session: `"go auto"` / `"recommend"` / `"suggestions only"`

Security gates (G1, G2) **always** pause for human sign-off — never auto-signed at any DIAL level.

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

Three hooks run automatically after install:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `inject-workflow-state.sh` | Before each prompt | Injects `[WORKFLOW STATE] phase: <phase> \| active epic: <id>` + `[NEXT]` guidance into every prompt. ts-orchestrate reads this instead of re-reading state files. Silent if no state files exist. |
| `ts-session-guard` | Before each prompt | Warns when message count ≥ 10 or context ≥ 70% |
| `ts-statusline bridge` | After each turn | Shows context percentage in the Claude Code status bar |

Hooks always exit 0 — they never block your session. `inject-workflow-state.sh` never
echoes free-text fields (prompt injection prevention).

---

## Workspace Layout

Skills write to a shared `.ai/` directory in your project root:

```
.ai/
├── domain.json               — event-storming domain model
├── discovery.json            — Discovery backlog + Ready-for-Delivery buffer
├── iteration.json            — release state: active_epic, dial, epics (written by ts-orchestrate + ts-project-planner)
├── risks.md                  — risk register
├── decisions/                — Architecture Decision Records (ADRs)
├── ts-deliver-router/
│   ├── state.json            — slim: current_phase, phase_entered_at, artifacts, gates (constant size)
│   ├── history.jsonl         — append-only: one phase_exit event per line
│   ├── autonomy              — DIAL level file
│   └── registry/             — registry-<phase>.md per phase
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
# Session entry — ts-orchestrate routes everything from here
/ts-orchestrate:start WORK_TYPE=EPIC AUTONOMY=MID

# Seed Discovery with the product vision (Layer 0)
/ts-project:plan --new "Build a multi-tenant invoicing SaaS"

# Explore and validate the riskiest idea (Layer D)
/ts-discover:explore INV-001
/ts-discover:validate INV-001
/ts-discover:decide INV-001 build

# Sync ready items into release plan (Layer 0 → Layer 1)
/ts-project:plan --sync
/ts-iteration:start MVP

# Kick off first epic — drives ts-deliver-router (Layer 2)
/ts-iteration:next
```

ts-deliver-router takes over at Layer 2: Think → Plan (G1 gate) → Build → Review → Test → Ship (G2 gate) → Reflect.

---

### 2 — Single bugfix or small standalone change

No portfolio management needed. ts-orchestrate routes to the lean spine.

```
# Session entry — lean spine activated automatically for BUGFIX
/ts-orchestrate:start WORK_TYPE=BUGFIX AUTONOMY=MID

# Check state at any time
/ts-deliver:status
```

BUGFIX spine: Think → Build → Ship. No G1/G2 gates. Plan, Review, Test, Reflect
are skipped. Fastest path from problem to ship.

---

### 3 — Mid-delivery scope change (feedback hook)

During Build phase, a new external dependency emerges. ts-deliver-router fires
the feedback hook automatically (non-blocking):

```
# (automatic — fired by ts-deliver-router during Think or Build)
/ts-discover:idea --from-router
```

A new Discovery entry is created, linked via `source_epic`. Delivery continues.
Check unified status via ts-orchestrate:

```
/ts-orchestrate:status             # shows Discovery WIP + current delivery phase

# In next planning cycle:
/ts-discover:validate NEW-007
/ts-discover:decide NEW-007 build

# Sync and start next release
/ts-project:plan --sync
/ts-iteration:start v1.1
```

The feedback hook is APPEND-ONLY on `discovery.json` — only `/ts-discover:decide`
(human-invoked) can move an idea to `ready` or `killed`.

---

### 4 — Full dual-track loop (portfolio across two releases)

Both tracks run continuously in parallel. Release 1 ships while Release 2's
ideas are validated in Discovery. ts-orchestrate:status shows both at once.

```
# Release 1 — in progress (Layer 2)
/ts-orchestrate:status                  # unified: Delivery phase + Discovery WIP

# Release 2 — Discovery in parallel (Layer D)
/ts-discover:explore REL2-001
/ts-discover:validate REL2-001
/ts-discover:decide REL2-001 build

# Release 1 close → sync Release 2 ready items
/ts-iteration:close                     # prompts: check /ts-discover:status
/ts-project:plan --sync                 # ready buffer → Release 2 backlog
/ts-iteration:start "Release 2"
/ts-orchestrate:next                    # advances to first epic of Release 2
```

`/ts-iteration:close` surfaces pending Discovery items — "Discovery has been
running in parallel — check `/ts-discover:status`" is built into the close flow.

---

## Contributing

[TODO] Contribution guidelines not yet written. In the meantime:

- Report issues at [github.com/chingchangtw/agentic_toolset/issues](https://github.com/chingchangtw/agentic_toolset/issues)
- Follow existing TypeScript conventions (strict mode, ESM)
- Run `npm run type-check` and `npm test` before submitting a PR

---

## License

MIT — see [LICENSE](LICENSE) for details.
