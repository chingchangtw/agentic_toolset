# PRD: Harness & Loop Engineering Framework (HLEF)

**Document Version:** 1.2  
**Date:** 2026-07-02  
**Changelog:**
- v1.1 — added Module 5 (Loop Engineering), generator-evaluator verification, deterministic gates, comprehension-debt guardrail, multi-scale constraint ladder. Source: `tasks/ideasHarness.md` discussions.
- v1.2 — aligned with the ts- family architecture updates of 2026-07-02 (`docs/Ideas.md`, `docs/architecture.md`, `CLAUDE.md`): `ts-orchestrate` as session entry + gate enforcer, slim state + `history.jsonl` convention, `[WORKFLOW STATE]` hook pattern, epic-type phase spines, G2 location fix.

**Owner:** Tony (CAO, Synaptics)  
**Target Runtime:** Claude Code CLI (multi-agent, agentic architecture)  
**Design Principle:** *Add rigour, never add scope.*

---

## 1. Executive Summary

HLEF is a **full-stack, CLI-operable practice environment** that implements the four-module curriculum of the *Harness & Loop Engineering* course directly inside Claude Code, plus a fifth Loop Engineering module distilled from field practice (`tasks/ideasHarness.md`). It provides runnable practice exercises, agent scaffolding, guardrails infrastructure, multi-agent orchestration patterns, and a self-evolution memory loop — all wired into the ts- skill family (session entry and gate enforcement via `ts-orchestrate`, per-epic delivery via `ts-deliver-router`) and the `.ai/` workspace convention already established in the Synaptics skill ecosystem.

The project is not a tutorial viewer. It is an **operational harness** the user runs to complete course practices, accumulate institutional knowledge from mistakes, and graduate course concepts into production skill patterns.

The design follows a two-layer thesis:

- **Harness Engineering** arms a *single* agent run — tools, allowed actions, recovery protocols, and an explicit definition of "done". It is the operational boundary for one task.
- **Loop Engineering** sits one floor above the harness: it replaces the human prompter with a system that discovers, schedules, and feeds work to the agent autonomously, then verifies the result independently.

Modules 1–4 build the harness. Module 5 (new in v1.1) closes the loop.

---

## 2. Problem Statement

| Pain | Impact |
|---|---|
| Course modules teach theory but provide no persistent, runnable scaffolding | Practices are done once, then forgotten |
| Guardrails, HITL nodes, and incident flows exist only as concepts | No verifiable audit trail from practice |
| Multi-agent orchestration is hand-crafted per project | No reusable, inspectable pattern library |
| Error-to-memory loop lacks tooling | Same mistakes recur across projects |
| The agent that writes the output also grades it | Self-approval bias — broken output is praised and shipped |
| No loop layer: a human must prompt, schedule, and feed every run | Throughput capped by human availability; completed work is forgotten once the context window clears (the "amnesiac loop") |

---

## 3. Goals & Success Criteria

| Goal | Success Criterion |
|---|---|
| G1 — Runnable practices | All 7 practice exercises in the syllabus can be executed end-to-end inside Claude Code CLI |
| G2 — Guardrails infrastructure | Guardrail layers are enforced and violations are logged to audit trail |
| G3 — HITL enforcement | High-risk nodes pause and require human sign-off before proceeding |
| G4 — Multi-agent patterns | All 5 orchestration patterns are scaffolded and runnable |
| G5 — Self-evolution loop | Errors are captured, formalised, and fed back into skill/harness updates |
| G6 — Loop engineering | The five core loop moves (Discovery, Handoff, Verification, Persistence, Scheduling) are scaffolded and runnable; P8 executes a scheduled generator→evaluator loop end-to-end |
| G7 — Independent verification | No artifact is marked done by the agent that produced it; the evaluator verifies by *action* (running tests/tools), not by reading |

### Out of Scope (v1)
- UI dashboard or web frontend
- Integration with external SaaS beyond Atlassian (already handled by `atlassian-rest-api` skill)
- LLM provider switching (Claude Code is the spine; muscle agents follow existing architecture)

---

## 4. Users & Personas

| Persona | Role | Primary Use |
|---|---|---|
| **Tony (CAO)** | Course learner + practitioner | Runs exercises, validates harness patterns against real Synaptics workflows |
| **Rookie IT Engineer** | OJT student | Follows guided practices inside the harness with HITL guardrails protecting them from high-risk mistakes |
| **Rovo Agent** | Automated worker | Operates within the guardrail boundaries defined by the harness |

---

## 5. Architecture Overview

```
HLEF Project Root
├── .ai/                          ← shared ts- family workspace (unprefixed root convention)
│   ├── ts-deliver-router/
│   │   ├── state.json            ← slim: current phase only
│   │   └── history.jsonl         ← append-only phase-exit audit log
│   ├── iteration.json            ← active_epic + DIAL (owned by sequencing, not the router)
│   └── hlef/                     ← HLEF-specific workspace
│       ├── config.json           ← project config (DIAL level, guardrail tier, agent roster)
│       ├── incident-log.md       ← append-only incident audit trail
│       ├── evolution-log.md      ← error→lesson→fix records
│       ├── loop-triage.md        ← persistent loop memory: findings, priorities, task status
│       └── agent-roster.json     ← registered agents + capability boundaries
│
├── harness/                      ← Module 1: Harness definitions
│   ├── agent-work-packages/      ← One .md per virtual employee definition
│   ├── behaviour-boundaries.md   ← Shared constraint registry
│   └── harness-schema.json       ← JSON schema for a valid agent work package
│
├── guardrails/                   ← Module 2: Internal controls
│   ├── guardrail-registry.md     ← All guardrail rules, tiers, enforcement level
│   ├── hitl-nodes.json           ← High-risk nodes requiring human sign-off
│   ├── incident-handler.md       ← Incident response SOP
│   └── post-incident-template.md ← Learning loop trigger template
│
├── orchestration/                ← Module 3: Multi-agent patterns
│   ├── patterns/
│   │   ├── manager-dispatch.md
│   │   ├── pipeline.md
│   │   ├── reviewer.md
│   │   ├── debate.md
│   │   └── committee.md
│   └── workflows/
│       ├── research-to-deck/     ← Practice: research → presentation multi-agent flow
│       └── manager-dispatch-rules.md
│
├── evolution/                    ← Module 4: Self-evolution
│   ├── error-taxonomy.md         ← Categorised error types
│   ├── skill-evolution-hook.md   ← How errors feed skill updates
│   └── anti-dogma-check.md       ← Prevents over-generalisation from small samples
│
├── loop/                         ← Module 5: Loop engineering
│   ├── five-moves.md             ← Discovery / Handoff / Verification / Persistence / Scheduling
│   ├── generator-evaluator.md    ← Split-role verification contract
│   ├── hard-stops.md             ← Deterministic gates + hard-stop conditions
│   ├── comprehension-debt.md     ← Daily human sampling protocol
│   └── schedules/                ← Cron / automation definitions per loop
│
├── practices/                    ← All 8 runnable practices
│   ├── P1-agent-work-package.md
│   ├── P2-hitl-approval-flow.md
│   ├── P3-post-incident-learning.md
│   ├── P4-research-to-deck-workflow.md
│   ├── P5-manager-dispatch-rules.md
│   ├── P6-skill-evolution.md
│   ├── P7-full-harness-integration.md (capstone)
│   └── P8-scheduled-loop.md      ← Module 5: scheduled generator→evaluator loop
│
├── SKILL.md                      ← Claude Code skill entry point
└── README.md                     ← Setup and quick-start guide
```

---

## 6. Module Breakdown & Feature Specifications

---

### Module 1 — Harness Engineering Core

**Purpose:** Shift from prompt engineering to context engineering to harness engineering. Define virtual employees with job scope, capability boundaries, and behavioural constraints.

#### Feature 1.1 — Agent Work Package Schema

- **File:** `harness/harness-schema.json`
- **Fields (required):**
  - `agent_id` — unique identifier
  - `role` — job title / function description
  - `capabilities` — array of permitted tool categories
  - `prohibited_actions` — explicit deny list (mirrors g0-oss-intake security model)
  - `output_contract` — what the agent must produce (format + schema)
  - `escalation_trigger` — conditions that force HITL handoff
  - `token_budget` — soft and hard limits
  - `dial_level` — default DIAL autonomy (HIGH / MID / LOW)
  - `done_definition` — machine-checkable completion criteria (a harness must define what "done" is; the agent never decides this for itself)
  - `recovery_protocol` — what the agent does on failure (retry / rollback / escalate), so a failed run degrades predictably instead of improvising
- **Validation rule:** Claude Code hook validates schema on `agent-work-package` creation. Invalid packages are blocked (G0 gate equivalent).

#### Feature 1.2 — Behaviour Boundary Registry

- **File:** `harness/behaviour-boundaries.md`
- **Content:** Human-readable rules shared across all agents. Written as numbered constraints, each with an `enforcement_level` tag: `[BLOCK]`, `[WARN]`, `[LOG]`.
- **Usage pattern:** Agents load `behaviour-boundaries.md` as mandatory context before any task.

#### Feature 1.3 — Multi-Scale Constraint Ladder

Constraints are layered by scale. Each layer shrinks the space in which the agent can
hallucinate — quality becomes the inevitable result of constraints, not a lucky accident:

| Scale | Constraint | Where it lives in HLEF |
|---|---|---|
| Requirements | BDD acceptance criteria derived from the task spec | `output_contract` in the work package |
| Large | Architecture rules (e.g. Clean Architecture / DDD / CQRS boundaries) | `behaviour-boundaries.md` |
| Mid | Sub-agent responsibility — each agent lives in a context sized to its job | work package `role` + `capabilities` |
| Small | Coding standards, interface conventions | `behaviour-boundaries.md` entries |
| Micro | Design by Contract — pre-conditions, post-conditions, invariants | `output_contract` + `escalation_trigger` |

The ladder is a *living pattern language*: the Module 4 evolution loop refines it from
observed errors, so team know-how sediments into the constraints over time.

#### Practice P1 — Design a Complete Agent Work Package

- **Input:** User provides: role name, high-level task description
- **Output:** A fully validated `agent-work-package.json` written to `harness/agent-work-packages/`
- **Guided steps inside the practice file:**
  1. Define role and scope
  2. Enumerate permitted tools
  3. Define prohibited actions (at least 3)
  4. Write output contract
  5. Set escalation triggers
  6. Set DIAL level
  7. Validate against `harness-schema.json`

---

### Module 2 — Internal Controls & Incident Handling

**Purpose:** Build guardrails, define human-in-the-loop nodes, and establish an incident-to-learning audit loop.

#### Feature 2.1 — Guardrail Registry

- **File:** `guardrails/guardrail-registry.md`
- **Guardrail tiers:**

| Tier | Label | Enforcement |
|---|---|---|
| 0 | Hard Block | Agent cannot proceed; task aborted |
| 1 | HITL Required | Task paused; human must sign off |
| 2 | Warn + Log | Proceeds with warning written to `incident-log.md` |
| 3 | Log Only | Silent audit trail entry |

- **Rule format per entry:**
  ```
  GR-NNN | [TIER] | Trigger condition | Enforcement action | Related agents
  ```

#### Feature 2.2 — HITL Node Definitions

- **File:** `guardrails/hitl-nodes.json`
- **Each node contains:**
  - `node_id`
  - `description` — what decision point this is
  - `risk_classification` — HIGH / CRITICAL
  - `required_approver` — role that must sign off
  - `timeout_seconds` — escalation if no response
  - `fallback_action` — what happens on timeout (abort / escalate / log)
- **Integration:** HITL nodes are registered as `gate` rows in the CHECKS REGISTRY, instantiated per project via the PROJECT REGISTRY (`/ts-deliver:init`, refined at Reflect via `/ts-deliver:refine`). Enforcement is `/ts-orchestrate:next` — it refuses phase advance while a required gate is unsigned and never auto-signs at any DIAL level.

#### Feature 2.3 — Incident Handler & Post-Incident Learning

- **File:** `guardrails/incident-handler.md` — SOP: detect → contain → investigate → document → evolve
- **File:** `guardrails/post-incident-template.md` — Structured template triggering Module 4 loop
- **Audit trail:** All incidents append to `.ai/hlef/incident-log.md` with timestamp, agent_id, guardrail triggered, action taken, human reviewer.

#### Practice P2 — Design HITL Approval Flow

- **Scenario:** A Manager Agent wants to delete files in production. Design the HITL checkpoint.
- **Output:** One HITL node entry in `hitl-nodes.json` + one guardrail entry in `guardrail-registry.md`

#### Practice P3 — Post-Incident Learning Flow

- **Scenario:** An agent produced output that bypassed an intended guardrail.
- **Output:** A completed `post-incident-template.md` entry, plus one new guardrail rule added to the registry, plus one evolution log entry.

---

### Module 3 — Multi-Agent Role Division & Orchestration

**Purpose:** Design and run multi-agent workflows using five orchestration patterns.

#### Feature 3.1 — Pattern Library

Each pattern file in `orchestration/patterns/` contains:
- **Pattern name & metaphor**
- **When to use** (trigger conditions)
- **Token cost estimate** (relative: Low / Medium / High)
- **Role definitions** (Manager, Worker, Reviewer, etc.)
- **Handoff contract** (what Agent A passes to Agent B)
- **Failure modes** (what breaks and how to detect it)
- **Claude Code command scaffold** (ready-to-run template)

| Pattern | File | Token Cost | Best For |
|---|---|---|---|
| Manager Dispatch | `manager-dispatch.md` | Medium | Parallel independent tasks |
| Pipeline | `pipeline.md` | Low | Sequential transforms |
| Reviewer | `reviewer.md` | Low-Medium | Quality gates on output |
| Debate | `debate.md` | High | High-stakes decisions needing dissent |
| Committee | `committee.md` | High | High-risk output sign-off |

#### Feature 3.2 — Research-to-Deck Workflow

- **Directory:** `orchestration/workflows/research-to-deck/`
- **Agents in this workflow:**
  - `research-agent` — searches, summarises sources
  - `structure-agent` — builds outline from research
  - `writer-agent` — drafts slide content
  - `reviewer-agent` — checks factual accuracy and consistency
  - `deck-builder-agent` — renders to pptx (using existing `pptx` skill)
- **Orchestration pattern used:** Pipeline → Reviewer
- **State file:** `.ai/hlef/research-to-deck-state.json`

#### Practice P4 — Research-to-Deck Multi-Agent Workflow

- **Input:** User provides a topic
- **Output:** A completed Deck produced by the multi-agent flow, plus a token-usage report

#### Practice P5 — Manager Agent Dispatch Rules

- **Output:** A `manager-dispatch-rules.md` defining: task taxonomy, agent selection logic, priority queue rules, overflow handling, timeout policy.

---

### Module 4 — Continuous Self-Evolution Mechanism

**Purpose:** Formalise the error→lesson→fix→verify loop so that the HLEF harness itself evolves over time and does not repeat past mistakes.

#### Feature 4.1 — Error Taxonomy

- **File:** `evolution/error-taxonomy.md`
- **Categories:**
  - E1 — Scope creep (agent exceeded task boundary)
  - E2 — Output contract violation (wrong format or missing fields)
  - E3 — Guardrail bypass (rule existed but was not enforced)
  - E4 — Context drift (agent lost track of task state mid-session)
  - E5 — Hallucination (fabricated data or tool call)
  - E6 — Cascading failure (upstream error propagated downstream silently)
  - E7 — Self-approval (generator certified its own output as done, bypassing the evaluator)

#### Feature 4.2 — Skill Evolution Hook

- **File:** `evolution/skill-evolution-hook.md`
- **Process:**
  1. Incident is logged → post-incident template completed
  2. Error is classified using taxonomy
  3. Fix target is identified: `harness/`, `guardrails/`, `orchestration/`, `loop/`, or existing skill file
  4. Fix is proposed as a diff (human reviews)
  5. Human approves → fix applied → evolution log entry written
  6. Evolution log entry includes: error_id, category, root cause, fix applied, verification method
- **Anti-dogma check** (`evolution/anti-dogma-check.md`): Before generalising a fix to all agents, verify the error occurred in 2+ independent sessions. Prevents over-fitting harness rules to a single anomaly.

#### Feature 4.3 — Evolution Log

- **File:** `.ai/hlef/evolution-log.md` (append-only)
- **Entry format:**
  ```
  ## EVO-NNN | YYYY-MM-DD
  Error: [E-category] — brief description
  Root Cause: [one sentence]
  Fix Applied: [file changed] → [what changed]
  Verified By: [method: re-run practice / manual review / new guardrail test]
  Status: OPEN | CLOSED
  ```

#### Practice P6 — Skill Evolution

- **Scenario:** Given a fabricated incident log entry (E5 — hallucination in research-agent), run the full evolution loop.
- **Output:** One new guardrail entry + one harness update + one closed evolution log entry.

---

### Module 5 — Loop Engineering *(new in v1.1)*

**Purpose:** Replace the human prompter with a system that schedules and feeds the agent
autonomously. Modules 1–4 make a single run safe; Module 5 makes runs *continuous* — and
keeps them honest without a human watching every turn.

#### Feature 5.1 — The Five Core Moves

- **File:** `loop/five-moves.md`

| Move | Definition | HLEF implementation |
|---|---|---|
| Discovery | The loop finds its own work via skills (triage, backlog scan) instead of waiting for a prompt | Triage skill writes candidates to `loop-triage.md` |
| Handoff | Parallel tasks are isolated so runs cannot trample each other | One git worktree per dispatched task |
| Verification | An independent quality check gates every iteration | Feature 5.2 generator-evaluator split |
| Persistence | State is written to disk, outside the chat — the agent forgets, the repository does not | `.ai/hlef/loop-triage.md` (append-only findings, priorities, task status) |
| Scheduling | Runs are triggered by automations/cron, not by a human | `loop/schedules/` definitions |

Loop state is surfaced to the session the same way workflow state already is: following
the `inject-workflow-state.sh` precedent, a UserPromptSubmit hook injects a `[LOOP STATE]`
prefix line each turn — echoing only enum values and IDs, never free-text fields (the
hook family's prompt-injection rule).

#### Feature 5.2 — Generator-Evaluator Split

- **File:** `loop/generator-evaluator.md`
- If the agent that writes the output also grades it, it will praise its own work. The loop therefore uses two distinct roles:
  - **Generator** — produces the artifact within its work package boundary.
  - **Evaluator** — a separate sub-agent briefed as a *skeptic*: assume the output is broken until proven otherwise.
- **Fresh context ("amnesiac reviewer"):** the evaluator starts in a clean session with no memory of the generator's reasoning — the same effect as asking an uninvolved colleague. Cross-model review (e.g. Codex CLI from the existing muscle roster) is preferred where available, since a different model does not share the generator's blind spots.
- **Verification by action, not reading:** the evaluator may not judge output by "looks right." It must *execute* — run the tests, drive Playwright/MCP tools, inspect actual results.
- **Hard-stop condition** (`loop/hard-stops.md`): the loop keeps iterating until an independent check confirms tests pass and the linter is clean. The generator can never self-certify done — that is error class E7.

#### Feature 5.3 — Deterministic Gates

- **File:** `loop/hard-stops.md`
- Probabilistic LLM steps are interleaved with strict, deterministic pipeline gates. Anything rule-bound — lint, schema validation, test execution, commit hygiene — stays in scripts, out of the LLM's hands (the Stripe "Minions" precedent: reliability comes from pipeline constraints, not model size).
- Every loop iteration ends in a deterministic gate script. The existing G0 schema-validation hook is the template; the loop extends it to lint + test checks.

#### Feature 5.4 — Comprehension-Debt Guardrail

- **File:** `loop/comprehension-debt.md`
- As the loop makes generation cheap, **human judgment becomes the scarce resource**. An efficient loop can quietly ship code faster than humans can understand it (comprehension debt).
- **Protocol:**
  - The human reads a **daily representative sample** of loop output — non-negotiable, logged in `loop-triage.md`.
  - Architecture-level decisions are registered as a **permanent HITL node** — never delegated to the loop, because they constrain everything downstream.
  - Progress is measured by **demo velocity** (features demonstrably runnable end-to-end), not PR counts or lines of code, which a loop can game trivially.

#### Practice P8 — Scheduled Generator→Evaluator Loop

- **Input:** A small recurring task (e.g., triage open TODOs in a repo)
- **Output:** One schedule entry in `loop/schedules/`, one completed loop run in which the evaluator rejected at least one generator artifact before final acceptance, persisted state in `loop-triage.md`, and a deterministic-gate log
- **Success criteria:** No self-certification occurred (no E7); loop state survives session end and is readable by the next run.

---

### Capstone Practice P7 — Full Harness Integration

- **Objective:** Run a complete end-to-end scenario using all four harness modules together. (P8 then re-runs the same scenario under loop control — Module 5 is verified separately.)
- **Scenario:** A Manager Agent is tasked with producing a quarterly AI governance report using the research-to-deck workflow. A mid-flow incident occurs (context drift). The HITL node fires. Human reviews. Incident is logged. Evolution loop is triggered.
- **Success criteria:**
  - Agent work package used and validated
  - At least one guardrail enforced during the run
  - HITL node fired and signed off
  - Post-incident template completed
  - Evolution log updated

---

## 7. Technical Stack

| Layer | Choice | Rationale |
|---|---|---|
| Session entry & gate enforcement | `ts-orchestrate` | Dual-track orchestrator; `/ts-orchestrate:next` never auto-signs gates |
| Per-epic delivery spine | `ts-deliver-router` | 7-phase spine, varies by epic type (bugfix=3 / refactor=6 / epic=7); already production |
| Agent runtime | Claude Code CLI | Target runtime per project brief |
| Muscle agents | GitHub Copilot CLI, Codex CLI (existing) | Existing multi-agent architecture |
| State management | Slim live state (`.ai/hlef/*.json`) + append-only history | Mirrors the `state.json` + `history.jsonl` split shipped in `ts-deliver-router` (2026-06-28) |
| Audit trail | Append-only `.md` files | Human-readable, git-diffable |
| Schema validation | JSON Schema (harness-schema.json) | Lightweight, Claude Code native |
| Presentation output | `pptx` skill (existing) | Already in skill library |
| Memory tier | Obsidian `myBrains` vault (Tier 1) | Existing three-tier memory architecture |
| Loop scheduling | cron / Claude Code automations | Five-moves Scheduling primitive |
| Parallel task isolation | git worktrees | Five-moves Handoff primitive — runs cannot trample each other |
| Independent evaluator | Fresh-context session; cross-model via Codex CLI | Amnesiac-reviewer verification (Feature 5.2) |
| Loop state surface | UserPromptSubmit hook (`[LOOP STATE]` prefix) | Same pattern as `inject-workflow-state.sh`; enum values and IDs only |

---

## 8. File-by-File Build Checklist

### Phase 1 — Foundation (Build first)
- [ ] `README.md` — setup and quick-start
- [ ] `SKILL.md` — Claude Code entry point
- [ ] `.ai/hlef/config.json` — project config
- [ ] `harness/harness-schema.json` — agent work package schema
- [ ] `harness/behaviour-boundaries.md` — shared constraint registry

### Phase 2 — Guardrails
- [ ] `guardrails/guardrail-registry.md` — populated with 10 starter rules
- [ ] `guardrails/hitl-nodes.json` — 5 starter HITL nodes
- [ ] `guardrails/incident-handler.md` — SOP
- [ ] `guardrails/post-incident-template.md`
- [ ] `.ai/hlef/incident-log.md` — empty, with header

### Phase 3 — Orchestration
- [ ] `orchestration/patterns/manager-dispatch.md`
- [ ] `orchestration/patterns/pipeline.md`
- [ ] `orchestration/patterns/reviewer.md`
- [ ] `orchestration/patterns/debate.md`
- [ ] `orchestration/patterns/committee.md`
- [ ] `orchestration/workflows/research-to-deck/` (5 agent definitions + state file)
- [ ] `orchestration/workflows/manager-dispatch-rules.md`

### Phase 4 — Evolution
- [ ] `evolution/error-taxonomy.md`
- [ ] `evolution/skill-evolution-hook.md`
- [ ] `evolution/anti-dogma-check.md`
- [ ] `.ai/hlef/evolution-log.md` — empty, with header

### Phase 5 — Practices
- [ ] `practices/P1-agent-work-package.md`
- [ ] `practices/P2-hitl-approval-flow.md`
- [ ] `practices/P3-post-incident-learning.md`
- [ ] `practices/P4-research-to-deck-workflow.md`
- [ ] `practices/P5-manager-dispatch-rules.md`
- [ ] `practices/P6-skill-evolution.md`
- [ ] `practices/P7-full-harness-integration.md`

### Phase 6 — Loop
- [ ] `loop/five-moves.md`
- [ ] `loop/generator-evaluator.md`
- [ ] `loop/hard-stops.md`
- [ ] `loop/comprehension-debt.md`
- [ ] `loop/schedules/` — one starter schedule definition
- [ ] `.ai/hlef/loop-triage.md` — empty, with header
- [ ] `practices/P8-scheduled-loop.md`

---

## 9. DIAL & Security Gate Mapping

| Gate | Location | Condition | Required Action |
|---|---|---|---|
| G0 | Agent work package creation | Schema invalid | Block; return validation errors |
| G1 | ts-deliver-router Think→Plan | Practice scope unclear | 100% checklist + human sign-off |
| G1-HITL | Any HITL node trigger | High-risk action detected | Pause; human signs off within timeout |
| G2 | ts-deliver-router Ship (sec-review) | Capstone P7 completion | 100% checklist + human sign-off |
| GR-TIER-0 | Any guardrail Tier 0 violation | Hard block condition met | Abort; log to incident-log.md |
| G-EVAL | Loop iteration exit | Evaluator has not verified by action | Iteration cannot be marked done; work re-queued |
| G-DET | End of every loop iteration | Deterministic gate script (lint / test / schema) fails | Block commit; log to incident-log.md |
| G-ARCH | Architecture-level decision detected in loop | Always | Permanent HITL node — never auto-signed |

Gate enforcement is owned by `/ts-orchestrate:next`: it refuses to advance a phase while a
required gate is unsigned, at every DIAL level. HLEF practices enter through the standard
session entry point (`/ts-orchestrate:start WORK_TYPE=… AUTONOMY=…`) and inherit epic-type
phase routing — a practice-sized task may run the lean bugfix spine (Think→Build→Ship),
while the capstone P7 runs the full 7-phase epic spine with G1 + G2.

---

## 10. Non-Functional Requirements

| NFR | Requirement |
|---|---|
| Token efficiency | Each agent work package MUST declare a `token_budget`. Practices warn if budget is exceeded. |
| Auditability | All guardrail events, HITL decisions, and evolution changes are append-only log entries (never deleted). |
| Portability | All files are plain Markdown or JSON. No binary dependencies beyond the `pptx` skill. |
| Extensibility | New agents are added by creating one `.json` file in `harness/agent-work-packages/` — no spine changes needed. |
| Backward compatibility | HLEF operates as a peer skill alongside the ts- family (`ts-orchestrate` / `ts-project-planner` / `ts-deliver-router` / `ts-acpl`), not a replacement. |
| Independent verification | The agent that generates an artifact never certifies it done (E7). Evaluator verification is by action, in fresh context. |
| Comprehension debt | A human reads a daily representative sample of loop output. Architecture decisions are never delegated to the loop. |
| Measurement | Progress is tracked by demo velocity (runnable end-to-end results), not PR counts or lines of code. |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Evolution loop over-generalises from single incidents | Medium | Anti-dogma check (2+ independent occurrences required) |
| Guardrail registry grows too large to load efficiently | Low | Tier 0/1 rules loaded always; Tier 2/3 loaded on-demand |
| Capstone P7 produces cascading agent failures | Medium | Dry-run follows the `ts-deliver-router` DRY-RUN primitive (session-scoped, never persisted, cannot sign gates); failures are learning material, not blockers |
| HITL timeout causes task abandonment | Low | `fallback_action` defined per HITL node |
| Evaluator degenerates into a rubber stamp (context contamination) | Medium | Fresh-context evaluator with skeptic brief; verification by action; cross-model review where available |
| Comprehension debt accrues as loop throughput rises | Medium | Daily sample review protocol; permanent architecture HITL node (G-ARCH); demo-velocity metric keeps humans looking at outcomes |

---

## 12. Delivery Sequence (Recommended Sprint Order)

Each sprint's work item enters via `/ts-orchestrate:start` as a normal epic — HLEF
development itself runs on the spine it teaches.

| Sprint | Deliverables | Exit Criterion |
|---|---|---|
| S1 | Foundation files + P1 practice runnable | P1 produces a valid agent work package |
| S2 | Guardrails + HITL + P2 + P3 | P2 and P3 produce logged guardrail and incident entries |
| S3 | Orchestration patterns + P4 + P5 | P4 runs 5-agent research-to-deck end-to-end |
| S4 | Evolution loop + P6 | P6 closes one evolution log entry |
| S5 | Capstone P7 | Full integration scenario runs with all four harness modules active |
| S6 | Loop module + P8 | P8 runs a scheduled loop with at least one evaluator rejection, a passing deterministic gate, and state persisted across sessions |

---

## 13. Appendix — Syllabus-to-PRD Traceability

| Syllabus Practice | PRD Practice | Module |
|---|---|---|
| 設計一個完整的 Agent 工作包 | P1 — Agent Work Package | Module 1 |
| 設計 Agent 流程內人類介入的審批流程 | P2 — HITL Approval Flow | Module 2 |
| 建立「事故後學習流程」 | P3 — Post-Incident Learning | Module 2 |
| 設計「從研究到簡報」的多 Agent 工作流 | P4 — Research-to-Deck | Module 3 |
| 建立 Manager Agent 的派工規則 | P5 — Manager Dispatch Rules | Module 3 |
| 讓智能代理根據錯誤經驗持續進化 | P6 — Skill Evolution | Module 4 |
| *(Capstone — synthesises all modules)* | P7 — Full Harness Integration | All |
| *(Field practice — harness/loop thesis in `tasks/ideasHarness.md`, not in syllabus)* | P8 — Scheduled Generator→Evaluator Loop | Module 5 |

---

*End of PRD v1.2*
