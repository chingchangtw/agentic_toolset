# ts-deliver-router

A workflow hub for agentic software development. Coordinates the full
Think→Plan→Build→Review→Test→Ship→Reflect cycle with explicit state, per-project
tool registries, security gates, and a feedback hook into `ts-project-planner`'s
Discovery track.

---

## Quick Start

```bash
# 1. Start a new project
/ts-router init

# 2. Check where you are
/ts-router status

# 3. Ask what to do next
"what next?"  |  "where am I?"  |  "which skill?"

# 4. Refine your registry after first cycle
/ts-router refine

# 5. Simulate before running
/ts-router dry-run on
```

---

## File Structure

```
ts-deliver-router/
├── SKILL.md                          ← Canonical skill (full prose)
├── SKILL_caveman.md                  ← Token-optimized variant (~36%)
├── README.md                         ← This file
├── PROJECT_SETUP.md                  ← Paste-ready Claude Code Project Instructions
└── references/
    ├── registry-schema.md            ← registry.json field reference + pilot example
    ├── gate-checklists.md            ← G1 STRIDE + G2 mutation full checklists
    ├── phase-exit-contracts.md       ← Exit contract spec for all 7 phases
    ├── setup-gaps.md                 ← Install instructions per pending-setup tool
    ├── sub-agents.md                 ← Build specs for 4 recommended sub-agents
    └── acpl-integration.md           ← ts-acpl skill phase-by-phase integration guide
```

**Per-project state (written at runtime, not in this package):**
```
.ai/ts-deliver-router/
├── state.json        ← current phase + exit contracts
├── autonomy          ← DIAL level (HIGH/MID/LOW)
├── registry.json     ← active tool collection + gate thresholds
└── registry.log      ← refinement history
```

`.ai/` is the shared workspace root (see `.ai/WORKSPACE.md`, created by
`/ts-router init`). This skill's private directory is `.ai/ts-deliver-router/`.
Shared artifacts it reads: `domain.json`, `iteration.json` (epic status
fields), `risks.md` (G1 gate), `discovery.json` (G1 linkage + `--from-router`
append).

---

## Core 4 (invariant — always active)

| Role | Tool |
|---|---|
| 7-phase spine | gstack |
| BDD discipline | Spectra |
| Review discipline | code-review-graph MCP |
| Token discipline | caveman format |

---

## Three Primitives + One Hook

| Primitive | Purpose | Stored in |
|---|---|---|
| DIAL | Autonomy level per session | `.ai/ts-deliver-router/autonomy` |
| CHECKS REGISTRY | Template catalogue of all activities | `SKILL.md` table |
| PROJECT REGISTRY | Per-project active tools + gate config | `.ai/ts-deliver-router/registry.json` |

**Discovery Feedback Hook** (not a 4th primitive — a single hook): when Think
or Build surfaces an unresolved assumption meeting one of three gating
criteria — (a) blocks G1/G2, (b) affects >1 epic scope, (c) new external
dependency — this skill calls `/ts-discover idea --from-router`, pushing the
unknown upstream into `ts-project-planner`'s Discovery track. Non-blocking;
outcome always logged in `state.json.notes`.

---

## Fills Former Placeholders

| Placeholder | Now | Phase |
|---|---|---|
| `<SAST tool>` | Semgrep | Build + Review G1 |
| `<dep/secrets scanner>` | Trivy | Build + Test G2 |
| `<mutation tool>` | Stryker / PITest / mutmut | Test G2 |

---

## GitHub MCP — Full Traceability Chain

| Phase | Operation | Effect |
|---|---|---|
| Plan | `create_branch` | Feature branch from main; linked to Jira |
| Build | `push_files` | Commits to feature branch (conventional commits) |
| Review | `create_pull_request` + `create_review_comment` | PR opened; code-review-graph findings posted inline |
| Test | `update_pull_request_review` | PR description updated with mutation score |
| Ship | `merge_pull_request` + `create_release` | Squash merge; release tag with Spectra changelog |

---

## Sub-Agents

| Agent | Phase | Purpose |
|---|---|---|
| `ts-event-storming-facilitator` | Think | ES session → Domain Events/Commands/Aggregates → ACPL pattern group |
| `ts-spec-validator` | Plan (gate) | Verify Spectra minimum-schema before exit |
| `ts-ddd-tactical-validator` | Review | Aggregate/Repository alignment vs scenarios |
| `ts-mutation-analyst` | Test | Surviving mutants → exact missing ACPL test |

Build specs: `references/sub-agents.md`

---

## Key Design Principles

- **Add rigour, never add scope** — every addition must harden the spine, not grow it
- **State is written, never inferred** — `.ai/ts-deliver-router/state.json` is the only truth source
- **Core 4 is invariant** — gstack/Spectra/code-review-graph/caveman never negotiated
- **Project Registry is living** — initialized once, refined every Reflect cycle
- **Security gates always pause** — no DIAL level bypasses G1/G2 human sign-off
- **ACPL is the Build discipline** — patterns → mutation-hostile code from generation
- **Discovery Feedback Hook is non-blocking and gated** — three explicit
  criteria prevent flooding Discovery with implementation noise

---

## Companion Skills

This skill works in tandem with:

- **`ts-acpl`** — coding pattern library. See `references/acpl-integration.md`
  for the phase-by-phase integration guide.
- **`ts-project-planner`** — the project orchestrator that calls this skill
  per epic via `/ts-router init`, and receives feedback via
  `/ts-discover idea --from-router`. See its README for the Discovery track.

The combined workflow:
```
Problem Frames (Think)
  → ACPL pattern group selected (Think exit)
  → unresolved assumption? → /ts-discover idea --from-router (gated, non-blocking)
    → Spectra scenarios written with typed assertions (Plan)
      → ACPL patterns applied during code generation (Build)
        → Mutation testing validates pattern coverage (Test)
          → Registry refined based on mutation results (Reflect)
```
