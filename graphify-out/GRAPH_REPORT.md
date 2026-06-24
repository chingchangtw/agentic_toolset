# Graph Report - .  (2026-06-22)

## Corpus Check
- 483 files · ~299,720 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 507 nodes · 626 edges · 35 communities (27 shown, 8 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 71 edges (avg confidence: 0.87)
- Token cost: 813,506 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Security Gates & Setup|Security Gates & Setup]]
- [[_COMMUNITY_TS Skill Family Hub|TS Skill Family Hub]]
- [[_COMMUNITY_Discovery & Planning Layer|Discovery & Planning Layer]]
- [[_COMMUNITY_Deliver-Router Core Skill|Deliver-Router Core Skill]]
- [[_COMMUNITY_Router Capabilities BackfillJump|Router Capabilities: Backfill/Jump]]
- [[_COMMUNITY_Spectra Prompts & CLI|Spectra Prompts & CLI]]
- [[_COMMUNITY_Spectra Skills & Project Init|Spectra Skills & Project Init]]
- [[_COMMUNITY_Validation Module|Validation Module]]
- [[_COMMUNITY_CompressDetect Module|Compress/Detect Module]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Package Manifest|Package Manifest]]
- [[_COMMUNITY_Registry & State Schemas|Registry & State Schemas]]
- [[_COMMUNITY_Phases & Router Commands|Phases & Router Commands]]
- [[_COMMUNITY_ACPL Pattern Language|ACPL Pattern Language]]
- [[_COMMUNITY_Agent Scaffold & Slash Stubs|Agent Scaffold & Slash Stubs]]
- [[_COMMUNITY_Project Init Advisor|Project Init Advisor]]
- [[_COMMUNITY_MCP Tools & Agents|MCP Tools & Agents]]
- [[_COMMUNITY_Governance & Agent Rules|Governance & Agent Rules]]
- [[_COMMUNITY_Discovery-Delivery Loop|Discovery-Delivery Loop]]
- [[_COMMUNITY_Release Build Distribution|Release Build Distribution]]
- [[_COMMUNITY_Clarify & Anti-Slop Rules|Clarify & Anti-Slop Rules]]
- [[_COMMUNITY_OSS Review List|OSS Review List]]
- [[_COMMUNITY_Code-Review-Graph MCP|Code-Review-Graph MCP]]
- [[_COMMUNITY_Spectra Debug Workflow|Spectra Debug Workflow]]
- [[_COMMUNITY_Spectra Commit Staging|Spectra Commit Staging]]
- [[_COMMUNITY_Spectra Debug Skill|Spectra Debug Skill]]
- [[_COMMUNITY_Ts-Deliver Stub Creation|Ts-Deliver Stub Creation]]
- [[_COMMUNITY_Src README & Aliases|Src README & Aliases]]
- [[_COMMUNITY_Compress Package Init|Compress Package Init]]
- [[_COMMUNITY_Project Scaffolder Skill|Project Scaffolder Skill]]
- [[_COMMUNITY_Architecture (empty)|Architecture (empty)]]
- [[_COMMUNITY_OpenSpec Config|OpenSpec Config]]
- [[_COMMUNITY_Workflow Cheat Sheet|Workflow Cheat Sheet]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `Ideas (Agentic Dev Workflow Hub design record)` - 15 edges
3. `validate()` - 14 edges
4. `Spectra Apply Prompt` - 12 edges
5. `compress_file()` - 10 edges
6. `ts-deliver-router skill` - 10 edges
7. `Setup Gaps (installation instructions)` - 10 edges
8. `detect_file_type()` - 9 edges
9. `ts-deliver-router-secondary-backfill (capability)` - 9 edges
10. `ts-acpl (AI Coding Pattern Language)` - 9 edges

## Surprising Connections (you probably didn't know these)
- `MCP tool recommendations (Context7, Serena, GitHub MCP, Playwright, Memory MCP)` --semantically_similar_to--> `GitHub MCP`  [INFERRED] [semantically similar]
  tasks/IMG_4298.jpg → src/skills/ts-project-planner/references/agents.md
- `README (Agentic Toolset)` --conceptually_related_to--> `CLAUDE.md project brief`  [INFERRED]
  README.md → CLAUDE.md
- `compress_file()` --calls--> `validate()`  [EXTRACTED]
  .agents/skills/caveman-compress/scripts/compress.py → .claude/skills/caveman-compress/scripts/validate.py
- `merge-code-review-into-registry proposal` --implements--> `Change artifacts (proposal/design/tasks/specs)`  [INFERRED]
  openspec/changes/archive/2026-06-11-merge-code-review-into-registry/proposal.md → .github/skills/spectra-propose/SKILL.md
- `CLAUDE.md project brief` --conceptually_related_to--> `.spectra.yaml config`  [INFERRED]
  CLAUDE.md → .spectra.yaml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Spectra Spec-Driven Development Workflow** — prompts_spectra_discuss_prompt, prompts_spectra_propose_prompt, prompts_spectra_apply_prompt, prompts_spectra_ingest_prompt, prompts_spectra_archive_prompt [EXTRACTED 0.95]
- **Three Adversary Lenses (Scoundrel/Lazy/Confused)** — spectra_audit_three_adversaries, spectra_audit_six_trap_categories, spectra_audit_security_least_resistance [EXTRACTED 0.85]
- **Durable Handoff Principle** — spectra_apply_durable_handoff_contract, prompts_spectra_propose_durable_handoff_review, prompts_spectra_drift_dormancy_trigger [INFERRED 0.75]
- **Spectra change lifecycle skills** — spectra_discuss_skill_spectra_discuss, spectra_propose_skill_spectra_propose, spectra_ingest_skill_spectra_ingest, spectra_drift_skill_spectra_drift, spectra_commit_skill_spectra_commit [INFERRED 0.85]
- **ts- skill family (Core 4 spine)** — ts_deliver_router_prd_ts_deliver_router, ts_acpl_prd_ts_acpl, ts_project_planner_prd_ts_project_planner, ideas_core_4_invariant [INFERRED 0.85]
- **ts-deliver-router primitives** — ideas_dial_primitive, ideas_checks_registry, ideas_project_registry, ideas_dry_run [EXTRACTED 1.00]
- **ts-deliver-router capability evolution** — ts_deliver_router_secondary_backfill_spec, ts_deliver_router_agent_scaffold_spec, ts_deliver_router_jump_spec [INFERRED 0.85]
- **Lazy-load references progressive disclosure** — backfill_references_package, refactor_ts_project_planner_skill_md_load_index, refactor_ts_project_planner_skill_md_flat_extraction [INFERRED 0.75]
- **ts-deliver-router specs** — ts_deliver_router_agent_scaffold_spec, ts_deliver_router_jump_spec, ts_deliver_router_secondary_backfill_spec, ts_slash_command_stubs_spec [INFERRED 0.85]
- **Claude governance document stack** — claude_project_brief_template, claude_universal_agent_rules, goverance_claude_governance, anti_ai_style_guard, lessons_learned_log [INFERRED 0.85]
- **Problem Frame to Pattern to Mutation-Resistance** — ts_acpl_SKILL_problem_frame, ts_acpl_SKILL_pattern_groups, reference_patterns_mutation_sensitivity, ts_acpl_SKILL_mutation_integration [EXTRACTED 0.85]
- **Router Primitives (DIAL/Registry/Dry-Run)** — ts_deliver_router_SKILL_three_primitives, ts_deliver_router_README_autonomy_dial, ts_deliver_router_README_checks_registry, ts_deliver_router_SKILL_state_json [EXTRACTED 0.85]
- **project-init-advisor Reference Stack** — ts_project_init_advisor_SKILL, references_catalog_static, references_claudemd_patterns, references_init_plan_template [EXTRACTED 0.85]
- **Phase state and gate lifecycle** — state_json, phase_exit_contracts, edge_tests_min_schema, security_gates [INFERRED 0.85]
- **Per-phase check registries** — registry_think, registry_plan, registry_build, registry_review, registry_test, registry_ship, registry_reflect, index [EXTRACTED 1.00]
- **ACPL pattern to mutation-test flow** — acpl_integration_problem_frame, acpl_integration_pattern_groups, acpl_integration_mutant_feedback_loop, sub_agents_ts_mutation_analyst [INFERRED 0.85]
- **Per-phase registry check catalogs** — registry_think, registry_plan, registry_build, registry_review, registry_test, registry_ship, registry_reflect, registry_index [EXTRACTED 1.00]
- **ts-deliver-router build sub-agents** — sub_agents_ts_event_storming_facilitator, sub_agents_ts_spec_validator, sub_agents_ts_ddd_tactical_validator, sub_agents_ts_mutation_analyst [EXTRACTED 1.00]
- **ts-project-planner three layers + router** — ts_project_planner_layer_d, ts_project_planner_layer_0, ts_project_planner_layer_1, ts_project_planner_ts_deliver_router [EXTRACTED 1.00]
- **Discovery Kanban governance rules** — discovery_kanban_wip_limit, discovery_kanban_stale_rule, discovery_kanban_dedup_jaccard, discovery_state_machine [EXTRACTED 0.95]
- **Work unit type profiles** — work_unit_profiles_epic, work_unit_profiles_refactor, work_unit_profiles_bugfix, iteration_schema_phase_activation [EXTRACTED 0.85]
- **ts-project-planner layered pipeline** — architecture_layer_d_discovery, architecture_layer_0_backlog, architecture_layer_1_delivery, agents_ts_deliver_router [EXTRACTED 0.95]
- **Discovery-Delivery Full Loop** — full_loop_discovery, full_loop_delivery, full_loop_feedback_loop [EXTRACTED 0.85]
- **OSS Repos Under Review** — ossreviewlist_impeccable, ossreviewlist_ponytail, ossreviewlist_agent_skills [EXTRACTED 0.75]

## Communities (35 total, 8 thin omitted)

### Community 0 - "Security Gates & Setup"
Cohesion: 0.06
Nodes (46): ACPL Integration Guide, 8 Core Generation Rules (R1-R8), Mutant->Pattern->Scenario Feedback Loop, ACPL Pattern Groups (G1-G5), Problem Frame Classification, /ts-deliver jump (gate replay), Gate Checklists (G1/G2 detail), OWASP Top 10 (+38 more)

### Community 1 - "TS Skill Family Hub"
Cohesion: 0.07
Nodes (39): Agent Scaffold extension proposal, .agent/ shared handoff layer, Muscle agents (Copilot/Codex/Antigravity), Opt-in reference-file extension, lifecycle-router CHECK REGISTRY, /security-review Review-phase gate, code-review-registry-entries spec, Ideas (Agentic Dev Workflow Hub design record) (+31 more)

### Community 2 - "Discovery & Planning Layer"
Cohesion: 0.06
Nodes (35): ts-deliver-router (Layer 2 delivery spine), Layer 0 — Backlog, Layer 1 — Delivery (orchestrates Layer 2), Layer D — Discovery, ts-project-planner Layered Architecture (D/0/1/2), /ts-discover idea --from-router (feedback intake, dedup-gated), /ts-discover command family, /ts-iteration command family (+27 more)

### Community 3 - "Deliver-Router Core Skill"
Cohesion: 0.06
Nodes (35): Discussion: code-graph & registry changes, Development-Graph (derivable from state.json), GCC Git Context Controller, Phase-Tag Checkpoint Strategy (tags only), Ideas: Agentic Dev Workflow Design Session, Atlassian-admin Pilot, One Spine, Many Organs, Six Thinking Hats Session (+27 more)

### Community 4 - "Router Capabilities: Backfill/Jump"
Cohesion: 0.06
Nodes (32): Primitive Identity DIAL CHECKS REGISTRY DRY-RUN, Project Registry as CHECKS REGISTRY extension, references/ lazy-loaded package, Rename /ts-router to /ts-deliver, secondary-backfill command-rename delta, G1/G2 non-bypassable security gates, Forward jump sequential gate replay, Seven-phase spine Think Plan Build Review Test Ship Reflect (+24 more)

### Community 5 - "Spectra Prompts & CLI"
Cohesion: 0.09
Nodes (30): Spectra Apply Prompt, Spectra Archive Prompt, Spectra Ask Prompt, Spectra Audit Prompt, Spectra Commit Prompt, Source File Tracking (.spectra/touched), Assumptions vs Interview Mode, Interface Depth Check (+22 more)

### Community 6 - "Spectra Skills & Project Init"
Cohesion: 0.09
Nodes (27): AGENTS.md (caveman mode), AGENTS.md Caveman Style Reference, CLAUDE.md project brief, codegraph vs Graphify survey, merge-code-review-into-registry .openspec.yaml, merge-code-review-into-registry proposal, project_init install notes, Caveman Mode Tooling (+19 more)

### Community 7 - "Validation Module"
Cohesion: 0.16
Nodes (22): Path, Path, benchmark_pair(), count_tokens(), main(), print_table(), count_bullets(), extract_code_blocks() (+14 more)

### Community 8 - "Compress/Detect Module"
Cohesion: 0.14
Nodes (22): Path, Path, main(), print_usage(), build_compress_prompt(), build_fix_prompt(), call_claude(), compress_file() (+14 more)

### Community 9 - "TypeScript Config"
Cohesion: 0.08
Nodes (25): compilerOptions, baseUrl, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module (+17 more)

### Community 10 - "Package Manifest"
Cohesion: 0.09
Nodes (21): author, dependencies, description, devDependencies, @types/node, typescript, vitest, keywords (+13 more)

### Community 11 - "Registry & State Schemas"
Cohesion: 0.12
Nodes (21): Edge Tests (min-schema + must-pass cases), Minimum-schema per artifact, Phase Exit Contracts, Staleness Rule (artifact mtime > state.json mtime), Project Registry (activation over phase templates), Lifecycle Stage (early/active/stabilizing/maintenance), Source-of-truth Split (template catalog vs project activation), Tier (active/optional/pending-setup/retired) (+13 more)

### Community 12 - "Phases & Router Commands"
Cohesion: 0.12
Nodes (19): Agent Scaffold Reference, Escalation Invariant (muscle never gates), Router Commands, /ts-deliver init, /ts-deliver refine, Phases (lifecycle map + sub-loops), Agent Division (Hub=Claude Code, Muscle=Copilot/Gemini), Discovery Feedback Hook (/ts-discover) (+11 more)

### Community 13 - "ACPL Pattern Language"
Cohesion: 0.15
Nodes (19): ACPL Integration Guide (per phase), Mutant to Pattern to Scenario Feedback Loop, Mutation Testing Guide (ACPL output), Target Mutation Score by Phase, Stryker Mutator (TS/JS), ACPL Pattern Catalogue (20 patterns), Dependency Injection Pattern, Guard Clause Pattern (+11 more)

### Community 14 - "Agent Scaffold & Slash Stubs"
Cohesion: 0.14
Nodes (16): .agent/ directory contract, Fix ts Slash Command System Design, Escalation invariant (muscle agents never gate), First-use initialization pattern, Fix ts Slash Command System Proposal, Fix ts Slash Command System Tasks, ts-deliver-router-agent-scaffold (capability), .agent/ Shared Handoff Directory (+8 more)

### Community 15 - "Project Init Advisor"
Cohesion: 0.17
Nodes (16): Lifecycle Hooks (block-env-edit, session-summary), Project Init Advisor Static Catalog, Sub-agent Archetypes, CLAUDE.md Patterns Library, CLAUDE.md Anti-Patterns, CLAUDE.md Scoring Rubric (0-2 per dimension), PROJECT_INIT_PLAN Template Format, Task Block Specification (approval-gated) (+8 more)

### Community 16 - "MCP Tools & Agents"
Cohesion: 0.17
Nodes (12): Atlassian Rovo MCP, council-advisor, critical-thinker, first-principles-agent, GitHub MCP, Skills & Agents Used (Discovery layers), tows-strategy-analyst, ts-event-storming-facilitator sub-agent (+4 more)

### Community 17 - "Governance & Agent Rules"
Cohesion: 0.18
Nodes (12): ANTI_AI_STYLE Guard, CLAUDE.md Project Brief Template, Universal Agent Rules, Anti-Slop Discipline, Definition of Done, Elegance Check Gate, Project Governance & Registries, Implementation Workflow (+4 more)

### Community 18 - "Discovery-Delivery Loop"
Cohesion: 0.38
Nodes (7): Full Loop, Delivery Phase, Discovery Phase, .ai/discovery.json, Feedback to New Idea, Iteration Loop (start/next/close), lifecycle-router (Think to Reflect)

### Community 19 - "Release Build Distribution"
Cohesion: 0.40
Nodes (5): scripts/build-skills-dist.mjs (future generator/validator), Freeze constraint (.claude/.github/config untouched), npx skills add publishing channel, release-build distribution approach (src/skills -> root skills/), Audit + Skill Distribution Design

### Community 20 - "Clarify & Anti-Slop Rules"
Cohesion: 0.50
Nodes (4): Anti-AI Style Guard, Ask Clarifying Questions First Rule, Clarify Data Contract Before Coding, Lessons Learned Log

### Community 21 - "OSS Review List"
Cohesion: 0.50
Nodes (4): OSS Review List, agent-skills, impeccable, ponytail

### Community 24 - "Spectra Debug Workflow"
Cohesion: 0.67
Nodes (3): Four-Phase Debug Workflow, Spectra Debug Prompt, Three-Attempt Rule

### Community 25 - "Spectra Commit Staging"
Cohesion: 0.67
Nodes (3): Selective staging (no git add .), spectra-commit skill, .spectra/touched tracking file

### Community 26 - "Spectra Debug Skill"
Cohesion: 0.67
Nodes (3): Reproduce-Isolate-RootCause-Fix workflow, spectra-debug skill, Three-Attempt Rule

## Knowledge Gaps
- **184 isolated node(s):** `uvx`, `name`, `version`, `description`, `type` (+179 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `code-review-registry-entries capability` connect `TS Skill Family Hub` to `Spectra Skills & Project Init`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `Caveman compress scripts.  This package provides tools to compress natural lan`, `Heuristic denylist for files that must never be shipped to a third-party API.`, `Strip outer ```markdown ... ``` fence when it wraps the entire output.` to the rest of the system?**
  _223 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Security Gates & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.05990338164251208 - nodes in this community are weakly interconnected._
- **Should `TS Skill Family Hub` be split into smaller, more focused modules?**
  _Cohesion score 0.06882591093117409 - nodes in this community are weakly interconnected._
- **Should `Discovery & Planning Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.06218487394957983 - nodes in this community are weakly interconnected._
- **Should `Deliver-Router Core Skill` be split into smaller, more focused modules?**
  _Cohesion score 0.06386554621848739 - nodes in this community are weakly interconnected._
- **Should `Router Capabilities: Backfill/Jump` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._