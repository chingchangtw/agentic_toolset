# PRD: Harness & Loop Engineering Framework (HLEF)

**Document Version:** 1.0  
**Date:** 2026-06-28  
**Owner:** Tony (CAO, Synaptics)  
**Target Runtime:** Claude Code CLI (multi-agent, agentic architecture)  
**Design Principle:** *Add rigour, never add scope.*

---

## 1. Executive Summary

HLEF is a **full-stack, CLI-operable practice environment** that implements the four-module curriculum of the *Harness & Loop Engineering* course directly inside Claude Code. It provides runnable practice exercises, agent scaffolding, guardrails infrastructure, multi-agent orchestration patterns, and a self-evolution memory loop — all wired into the `ts-deliver-router` spine and the `.ai/` workspace convention already established in the Synaptics skill ecosystem.

The project is not a tutorial viewer. It is an **operational harness** the user runs to complete course practices, accumulate institutional knowledge from mistakes, and graduate course concepts into production skill patterns.

---

## 2. Problem Statement

| Pain | Impact |
|---|---|
| Course modules teach theory but provide no persistent, runnable scaffolding | Practices are done once, then forgotten |
| Guardrails, HITL nodes, and incident flows exist only as concepts | No verifiable audit trail from practice |
| Multi-agent orchestration is hand-crafted per project | No reusable, inspectable pattern library |
| Error-to-memory loop lacks tooling | Same mistakes recur across projects |

---

## 3. Goals & Success Criteria

| Goal | Success Criterion |
|---|---|
| G1 — Runnable practices | All 7 practice exercises in the syllabus can be executed end-to-end inside Claude Code CLI |
| G2 — Guardrails infrastructure | Guardrail layers are enforced and violations are logged to audit trail |
| G3 — HITL enforcement | High-risk nodes pause and require human sign-off before proceeding |
| G4 — Multi-agent patterns | All 5 orchestration patterns are scaffolded and runnable |
| G5 — Self-evolution loop | Errors are captured, formalised, and fed back into skill/harness updates |

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
├── .ai/                          ← ts-deliver-router + ts-project-planner workspace
│   ├── ts-deliver-router/
│   │   ├── state.json
│   │   └── autonomy
│   └── hlef/                     ← HLEF-specific workspace
│       ├── config.json           ← project config (DIAL level, guardrail tier, agent roster)
│       ├── incident-log.md       ← append-only incident audit trail
│       ├── evolution-log.md      ← error→lesson→fix records
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
├── practices/                    ← All 7 runnable course practices
│   ├── P1-agent-work-package.md
│   ├── P2-hitl-approval-flow.md
│   ├── P3-post-incident-learning.md
│   ├── P4-research-to-deck-workflow.md
│   ├── P5-manager-dispatch-rules.md
│   ├── P6-skill-evolution.md
│   └── P7-full-harness-integration.md (capstone)
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
- **Validation rule:** Claude Code hook validates schema on `agent-work-package` creation. Invalid packages are blocked (G0 gate equivalent).

#### Feature 1.2 — Behaviour Boundary Registry

- **File:** `harness/behaviour-boundaries.md`
- **Content:** Human-readable rules shared across all agents. Written as numbered constraints, each with an `enforcement_level` tag: `[BLOCK]`, `[WARN]`, `[LOG]`.
- **Usage pattern:** Agents load `behaviour-boundaries.md` as mandatory context before any task.

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
- **Integration:** `ts-deliver-router` G1/G2 gate mechanism is the enforcement spine. HITL nodes are registered as `gate` checks in the CHECKS REGISTRY.

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

#### Feature 4.2 — Skill Evolution Hook

- **File:** `evolution/skill-evolution-hook.md`
- **Process:**
  1. Incident is logged → post-incident template completed
  2. Error is classified using taxonomy
  3. Fix target is identified: `harness/`, `guardrails/`, `orchestration/`, or existing skill file
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

### Capstone Practice P7 — Full Harness Integration

- **Objective:** Run a complete end-to-end scenario using all four modules together.
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
| Orchestration spine | `ts-deliver-router` | Already production in Synaptics ecosystem |
| Agent runtime | Claude Code CLI | Target runtime per project brief |
| Muscle agents | GitHub Copilot CLI, Codex CLI (existing) | Existing multi-agent architecture |
| State management | `.ai/hlef/*.json` (flat file) | Consistent with `ts-deliver-router` convention |
| Audit trail | Append-only `.md` files | Human-readable, git-diffable |
| Schema validation | JSON Schema (harness-schema.json) | Lightweight, Claude Code native |
| Presentation output | `pptx` skill (existing) | Already in skill library |
| Memory tier | Obsidian `myBrains` vault (Tier 1) | Existing three-tier memory architecture |

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

---

## 9. DIAL & Security Gate Mapping

| Gate | Location | Condition | Required Action |
|---|---|---|---|
| G0 | Agent work package creation | Schema invalid | Block; return validation errors |
| G1 | ts-deliver-router Think→Plan | Practice scope unclear | 100% checklist + human sign-off |
| G1-HITL | Any HITL node trigger | High-risk action detected | Pause; human signs off within timeout |
| G2 | ts-deliver-router Plan→Ship | Capstone P7 completion | 100% checklist + human sign-off |
| GR-TIER-0 | Any guardrail Tier 0 violation | Hard block condition met | Abort; log to incident-log.md |

---

## 10. Non-Functional Requirements

| NFR | Requirement |
|---|---|
| Token efficiency | Each agent work package MUST declare a `token_budget`. Practices warn if budget is exceeded. |
| Auditability | All guardrail events, HITL decisions, and evolution changes are append-only log entries (never deleted). |
| Portability | All files are plain Markdown or JSON. No binary dependencies beyond the `pptx` skill. |
| Extensibility | New agents are added by creating one `.json` file in `harness/agent-work-packages/` — no spine changes needed. |
| Backward compatibility | HLEF operates as a peer skill alongside `ts-deliver-router`, not a replacement. |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Evolution loop over-generalises from single incidents | Medium | Anti-dogma check (2+ independent occurrences required) |
| Guardrail registry grows too large to load efficiently | Low | Tier 0/1 rules loaded always; Tier 2/3 loaded on-demand |
| Capstone P7 produces cascading agent failures | Medium | Dry-run mode supported; failures are learning material, not blockers |
| HITL timeout causes task abandonment | Low | `fallback_action` defined per HITL node |

---

## 12. Delivery Sequence (Recommended Sprint Order)

| Sprint | Deliverables | Exit Criterion |
|---|---|---|
| S1 | Foundation files + P1 practice runnable | P1 produces a valid agent work package |
| S2 | Guardrails + HITL + P2 + P3 | P2 and P3 produce logged guardrail and incident entries |
| S3 | Orchestration patterns + P4 + P5 | P4 runs 5-agent research-to-deck end-to-end |
| S4 | Evolution loop + P6 | P6 closes one evolution log entry |
| S5 | Capstone P7 | Full integration scenario runs with all four modules active |

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

---

*End of PRD v1.0*
