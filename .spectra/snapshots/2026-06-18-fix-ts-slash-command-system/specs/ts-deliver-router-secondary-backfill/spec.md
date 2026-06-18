## ADDED Requirements

### Requirement: Backfill reference package SHALL preserve core router structure
The change SHALL introduce secondary guidance as lazy-loaded reference documents under `src/skills/ts-deliver-router/references/` while preserving existing PRIMARY core router structure, including frontmatter, section hierarchy, fixed phase spine, and primitive identity (`DIAL · CHECKS REGISTRY · DRY-RUN`).

#### Scenario: Core structure remains stable while references are added
- **WHEN** the backfill is applied
- **THEN** the core router document retains existing structural contract and only receives additive pointer/index updates for new references


<!-- @trace
source: wise-snacking-fountain
updated: 2026-06-15
code:
  - src/skills/ts-deliver-router/references/registry/registry-reflect.md
  - src/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-deliver-router/references/phase-exit-contracts.md
  - src/skills/ts-deliver-router/modules/registry/registry-build.md
  - src/skills/ts-deliver-router/references/registry/index.md
  - src/skills/ts-deliver-router/modules/registry/index.md
  - src/skills/ts-deliver-router/rawfiles/references/phase-exit-contracts.md
  - src/skills/ts-deliver-router/rawfiles/references/gate-checklists.md
  - src/skills/ts-deliver-router/modules/phases.md
  - src/skills/ts-deliver-router/modules/registry/registry-test.md
  - src/skills/ts-deliver-router/references/registry/registry-build.md
  - .agents/skills/caveman-compress/scripts/__pycache__/compress.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-plan.md
  - src/skills/ts-project-planner/references/work-unit-profiles.md
  - .agents/skills/caveman-compress/scripts/__pycache__/validate.cpython-314.pyc
  - src/skills/ts-deliver-router/references/workspace.md
  - src/skills/ts-deliver-router/references/registry/registry-ship.md
  - src/skills/ts-deliver-router/rawfiles/references/state.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-reflect.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-test.md
  - src/skills/ts-deliver-router/rawfiles/references/github-mcp.md
  - src/skills/ts-deliver-router/modules/edge-tests.md
  - docs/workflow_cheat_sheet.html
  - src/skills/ts-deliver-router/references/gate-checklists.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-review.md
  - src/skills/ts-deliver-router/modules/state.md
  - src/skills/ts-deliver-router/references/security-gates.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-think.md
  - src/skills/ts-project-planner/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/SKILL.md
  - src/skills/ts-deliver-router/references/sub-agents.md
  - src/skills/ts-deliver-router/references/github-mcp.md
  - src/skills/ts-deliver-router/modules/registry/registry-ship.md
  - src/skills/ts-deliver-router/references/phases.md
  - src/skills/ts-deliver-router/references/project-registry.md
  - src/skills/ts-deliver-router/rawfiles/references/acpl-integration.md
  - src/skills/ts-deliver-router/references/registry/registry-review.md
  - src/skills/ts-deliver-router/rawfiles/references/setup-gaps.md
  - src/skills/ts-deliver-router/modules/registry/registry-plan.md
  - src/skills/ts-deliver-router/rawfiles/references/project-registry.md
  - src/skills/ts-deliver-router/references/registry/registry-test.md
  - src/skills/ts-project-planner/references/discovery-kanban.md
  - src/skills/ts-deliver-router/rawfiles/references/sub-agents.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-ship.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-build.md
  - src/skills/ts-deliver-router/rawfiles/references/security-gates.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__init__.cpython-314.pyc
  - src/skills/ts-deliver-router/references/acpl-integration.md
  - src/skills/ts-deliver-router/PROJECT_SETUP.md
  - src/skills/ts-deliver-router/references/commands.md
  - src/skills/ts-deliver-router/references/registry-schema.md
  - src/skills/ts-deliver-router/rawfiles/references/phases.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/index.md
  - src/skills/ts-deliver-router/modules/security-gates.md
  - src/skills/ts-deliver-router/references/setup-gaps.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__main__.cpython-314.pyc
  - src/skills/ts-deliver-router/modules/registry/registry-think.md
  - src/skills/ts-deliver-router/modules/registry/registry-reflect.md
  - .agents/skills/caveman-compress/scripts/__pycache__/detect.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/edge-tests.md
  - src/skills/ts-deliver-router/rawfiles/references/workspace.md
  - src/skills/ts-deliver-router/references/state.md
  - src/skills/ts-deliver-router/rawfiles/references/registry-schema.md
  - src/skills/ts-deliver-router/references/registry/registry-think.md
  - src/skills/ts-project-planner/references/iteration-schema.md
  - src/skills/ts-deliver-router/modules/registry/registry-review.md
  - .agents/skills/caveman-compress/scripts/__pycache__/cli.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-project-planner/references/workspace-spec.md
  - workflow_cheat_sheet.html
  - src/skills/ts-deliver-router/SKILL.original.md
  - src/skills/ts-deliver-router/modules/registry.md
  - src/skills/ts-deliver-router/references/registry/registry-plan.md
  - src/skills/ts-deliver-router/references/edge-tests.md
-->

### Requirement: Project registry semantics SHALL extend CHECKS REGISTRY without introducing a new primitive
The backfill SHALL define project registry semantics as project-specific activation and threshold metadata that extend CHECKS REGISTRY behavior, and SHALL NOT redefine primitive count or primitive names.

#### Scenario: Primitive identity remains unchanged
- **WHEN** an operator reads the updated primitive interfaces and related references
- **THEN** project registry appears as supporting model under CHECKS REGISTRY and not as primitive four

##### Example: Primitive set stability
- **GIVEN** primitive set in core router is `DIAL`, `CHECKS REGISTRY`, `DRY-RUN`
- **WHEN** project-registry guidance is added
- **THEN** primitive set remains exactly `DIAL`, `CHECKS REGISTRY`, `DRY-RUN`


<!-- @trace
source: wise-snacking-fountain
updated: 2026-06-15
code:
  - src/skills/ts-deliver-router/references/registry/registry-reflect.md
  - src/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-deliver-router/references/phase-exit-contracts.md
  - src/skills/ts-deliver-router/modules/registry/registry-build.md
  - src/skills/ts-deliver-router/references/registry/index.md
  - src/skills/ts-deliver-router/modules/registry/index.md
  - src/skills/ts-deliver-router/rawfiles/references/phase-exit-contracts.md
  - src/skills/ts-deliver-router/rawfiles/references/gate-checklists.md
  - src/skills/ts-deliver-router/modules/phases.md
  - src/skills/ts-deliver-router/modules/registry/registry-test.md
  - src/skills/ts-deliver-router/references/registry/registry-build.md
  - .agents/skills/caveman-compress/scripts/__pycache__/compress.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-plan.md
  - src/skills/ts-project-planner/references/work-unit-profiles.md
  - .agents/skills/caveman-compress/scripts/__pycache__/validate.cpython-314.pyc
  - src/skills/ts-deliver-router/references/workspace.md
  - src/skills/ts-deliver-router/references/registry/registry-ship.md
  - src/skills/ts-deliver-router/rawfiles/references/state.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-reflect.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-test.md
  - src/skills/ts-deliver-router/rawfiles/references/github-mcp.md
  - src/skills/ts-deliver-router/modules/edge-tests.md
  - docs/workflow_cheat_sheet.html
  - src/skills/ts-deliver-router/references/gate-checklists.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-review.md
  - src/skills/ts-deliver-router/modules/state.md
  - src/skills/ts-deliver-router/references/security-gates.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-think.md
  - src/skills/ts-project-planner/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/SKILL.md
  - src/skills/ts-deliver-router/references/sub-agents.md
  - src/skills/ts-deliver-router/references/github-mcp.md
  - src/skills/ts-deliver-router/modules/registry/registry-ship.md
  - src/skills/ts-deliver-router/references/phases.md
  - src/skills/ts-deliver-router/references/project-registry.md
  - src/skills/ts-deliver-router/rawfiles/references/acpl-integration.md
  - src/skills/ts-deliver-router/references/registry/registry-review.md
  - src/skills/ts-deliver-router/rawfiles/references/setup-gaps.md
  - src/skills/ts-deliver-router/modules/registry/registry-plan.md
  - src/skills/ts-deliver-router/rawfiles/references/project-registry.md
  - src/skills/ts-deliver-router/references/registry/registry-test.md
  - src/skills/ts-project-planner/references/discovery-kanban.md
  - src/skills/ts-deliver-router/rawfiles/references/sub-agents.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-ship.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-build.md
  - src/skills/ts-deliver-router/rawfiles/references/security-gates.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__init__.cpython-314.pyc
  - src/skills/ts-deliver-router/references/acpl-integration.md
  - src/skills/ts-deliver-router/PROJECT_SETUP.md
  - src/skills/ts-deliver-router/references/commands.md
  - src/skills/ts-deliver-router/references/registry-schema.md
  - src/skills/ts-deliver-router/rawfiles/references/phases.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/index.md
  - src/skills/ts-deliver-router/modules/security-gates.md
  - src/skills/ts-deliver-router/references/setup-gaps.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__main__.cpython-314.pyc
  - src/skills/ts-deliver-router/modules/registry/registry-think.md
  - src/skills/ts-deliver-router/modules/registry/registry-reflect.md
  - .agents/skills/caveman-compress/scripts/__pycache__/detect.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/edge-tests.md
  - src/skills/ts-deliver-router/rawfiles/references/workspace.md
  - src/skills/ts-deliver-router/references/state.md
  - src/skills/ts-deliver-router/rawfiles/references/registry-schema.md
  - src/skills/ts-deliver-router/references/registry/registry-think.md
  - src/skills/ts-project-planner/references/iteration-schema.md
  - src/skills/ts-deliver-router/modules/registry/registry-review.md
  - .agents/skills/caveman-compress/scripts/__pycache__/cli.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-project-planner/references/workspace-spec.md
  - workflow_cheat_sheet.html
  - src/skills/ts-deliver-router/SKILL.original.md
  - src/skills/ts-deliver-router/modules/registry.md
  - src/skills/ts-deliver-router/references/registry/registry-plan.md
  - src/skills/ts-deliver-router/references/edge-tests.md
-->

### Requirement: Expanded operational guidance SHALL be available through explicit reference artifacts
The backfill SHALL include reference artifacts for commands, sub-agent specs, phase-exit contracts, setup-gap guidance, ACPL integration, GitHub MCP traceability, workspace contract, and expanded security checklist detail, and these artifacts SHALL be reachable from documented pointer paths.

#### Scenario: Each required guidance area is discoverable
- **WHEN** a user follows LOAD INDEX rows and documented cross-links
- **THEN** every required guidance area resolves to a concrete reference artifact path

##### Example: Guidance coverage matrix
| Guidance area | Required reference artifact |
| --- | --- |
| Commands | `references/commands.md` |
| Sub-agent specs | `references/sub-agents.md` |
| Phase-exit contracts | `references/phase-exit-contracts.md` |
| Setup gaps | `references/setup-gaps.md` |
| ACPL integration | `references/acpl-integration.md` |
| GitHub MCP traceability | `references/github-mcp.md` |
| Workspace contract | `references/workspace.md` |
| Expanded gate detail | `references/gate-checklists.md` |


<!-- @trace
source: wise-snacking-fountain
updated: 2026-06-15
code:
  - src/skills/ts-deliver-router/references/registry/registry-reflect.md
  - src/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-deliver-router/references/phase-exit-contracts.md
  - src/skills/ts-deliver-router/modules/registry/registry-build.md
  - src/skills/ts-deliver-router/references/registry/index.md
  - src/skills/ts-deliver-router/modules/registry/index.md
  - src/skills/ts-deliver-router/rawfiles/references/phase-exit-contracts.md
  - src/skills/ts-deliver-router/rawfiles/references/gate-checklists.md
  - src/skills/ts-deliver-router/modules/phases.md
  - src/skills/ts-deliver-router/modules/registry/registry-test.md
  - src/skills/ts-deliver-router/references/registry/registry-build.md
  - .agents/skills/caveman-compress/scripts/__pycache__/compress.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-plan.md
  - src/skills/ts-project-planner/references/work-unit-profiles.md
  - .agents/skills/caveman-compress/scripts/__pycache__/validate.cpython-314.pyc
  - src/skills/ts-deliver-router/references/workspace.md
  - src/skills/ts-deliver-router/references/registry/registry-ship.md
  - src/skills/ts-deliver-router/rawfiles/references/state.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-reflect.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-test.md
  - src/skills/ts-deliver-router/rawfiles/references/github-mcp.md
  - src/skills/ts-deliver-router/modules/edge-tests.md
  - docs/workflow_cheat_sheet.html
  - src/skills/ts-deliver-router/references/gate-checklists.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-review.md
  - src/skills/ts-deliver-router/modules/state.md
  - src/skills/ts-deliver-router/references/security-gates.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-think.md
  - src/skills/ts-project-planner/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/SKILL.md
  - src/skills/ts-deliver-router/references/sub-agents.md
  - src/skills/ts-deliver-router/references/github-mcp.md
  - src/skills/ts-deliver-router/modules/registry/registry-ship.md
  - src/skills/ts-deliver-router/references/phases.md
  - src/skills/ts-deliver-router/references/project-registry.md
  - src/skills/ts-deliver-router/rawfiles/references/acpl-integration.md
  - src/skills/ts-deliver-router/references/registry/registry-review.md
  - src/skills/ts-deliver-router/rawfiles/references/setup-gaps.md
  - src/skills/ts-deliver-router/modules/registry/registry-plan.md
  - src/skills/ts-deliver-router/rawfiles/references/project-registry.md
  - src/skills/ts-deliver-router/references/registry/registry-test.md
  - src/skills/ts-project-planner/references/discovery-kanban.md
  - src/skills/ts-deliver-router/rawfiles/references/sub-agents.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-ship.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-build.md
  - src/skills/ts-deliver-router/rawfiles/references/security-gates.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__init__.cpython-314.pyc
  - src/skills/ts-deliver-router/references/acpl-integration.md
  - src/skills/ts-deliver-router/PROJECT_SETUP.md
  - src/skills/ts-deliver-router/references/commands.md
  - src/skills/ts-deliver-router/references/registry-schema.md
  - src/skills/ts-deliver-router/rawfiles/references/phases.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/index.md
  - src/skills/ts-deliver-router/modules/security-gates.md
  - src/skills/ts-deliver-router/references/setup-gaps.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__main__.cpython-314.pyc
  - src/skills/ts-deliver-router/modules/registry/registry-think.md
  - src/skills/ts-deliver-router/modules/registry/registry-reflect.md
  - .agents/skills/caveman-compress/scripts/__pycache__/detect.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/edge-tests.md
  - src/skills/ts-deliver-router/rawfiles/references/workspace.md
  - src/skills/ts-deliver-router/references/state.md
  - src/skills/ts-deliver-router/rawfiles/references/registry-schema.md
  - src/skills/ts-deliver-router/references/registry/registry-think.md
  - src/skills/ts-project-planner/references/iteration-schema.md
  - src/skills/ts-deliver-router/modules/registry/registry-review.md
  - .agents/skills/caveman-compress/scripts/__pycache__/cli.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-project-planner/references/workspace-spec.md
  - workflow_cheat_sheet.html
  - src/skills/ts-deliver-router/SKILL.original.md
  - src/skills/ts-deliver-router/modules/registry.md
  - src/skills/ts-deliver-router/references/registry/registry-plan.md
  - src/skills/ts-deliver-router/references/edge-tests.md
-->

### Requirement: Security and state guidance SHALL remain schema-aligned and token-efficient
The backfill SHALL keep `modules/security-gates.md` concise with a pointer to full checklist detail, and SHALL ensure phase-exit contract examples remain aligned with state schema v1 semantics documented in `modules/state.md`.

#### Scenario: Compact gate module with full-detail access
- **WHEN** an operator checks gate behavior in `modules/security-gates.md`
- **THEN** concise gate checklist contract is present and full-detail checklist content is reachable through explicit reference link

#### Scenario: Phase-exit examples align to state schema
- **WHEN** phase-exit examples are reviewed against state schema v1 fields
- **THEN** examples use compatible shape for current phase, gate checklist results, and ingest log contract

## Requirements


<!-- @trace
source: wise-snacking-fountain
updated: 2026-06-15
code:
  - src/skills/ts-deliver-router/references/registry/registry-reflect.md
  - src/skills/ts-deliver-router/SKILL.md
  - src/skills/ts-deliver-router/references/phase-exit-contracts.md
  - src/skills/ts-deliver-router/modules/registry/registry-build.md
  - src/skills/ts-deliver-router/references/registry/index.md
  - src/skills/ts-deliver-router/modules/registry/index.md
  - src/skills/ts-deliver-router/rawfiles/references/phase-exit-contracts.md
  - src/skills/ts-deliver-router/rawfiles/references/gate-checklists.md
  - src/skills/ts-deliver-router/modules/phases.md
  - src/skills/ts-deliver-router/modules/registry/registry-test.md
  - src/skills/ts-deliver-router/references/registry/registry-build.md
  - .agents/skills/caveman-compress/scripts/__pycache__/compress.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-plan.md
  - src/skills/ts-project-planner/references/work-unit-profiles.md
  - .agents/skills/caveman-compress/scripts/__pycache__/validate.cpython-314.pyc
  - src/skills/ts-deliver-router/references/workspace.md
  - src/skills/ts-deliver-router/references/registry/registry-ship.md
  - src/skills/ts-deliver-router/rawfiles/references/state.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-reflect.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-test.md
  - src/skills/ts-deliver-router/rawfiles/references/github-mcp.md
  - src/skills/ts-deliver-router/modules/edge-tests.md
  - docs/workflow_cheat_sheet.html
  - src/skills/ts-deliver-router/references/gate-checklists.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-review.md
  - src/skills/ts-deliver-router/modules/state.md
  - src/skills/ts-deliver-router/references/security-gates.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-think.md
  - src/skills/ts-project-planner/SKILL.md
  - src/skills/ts-deliver-router/rawfiles/SKILL.md
  - src/skills/ts-deliver-router/references/sub-agents.md
  - src/skills/ts-deliver-router/references/github-mcp.md
  - src/skills/ts-deliver-router/modules/registry/registry-ship.md
  - src/skills/ts-deliver-router/references/phases.md
  - src/skills/ts-deliver-router/references/project-registry.md
  - src/skills/ts-deliver-router/rawfiles/references/acpl-integration.md
  - src/skills/ts-deliver-router/references/registry/registry-review.md
  - src/skills/ts-deliver-router/rawfiles/references/setup-gaps.md
  - src/skills/ts-deliver-router/modules/registry/registry-plan.md
  - src/skills/ts-deliver-router/rawfiles/references/project-registry.md
  - src/skills/ts-deliver-router/references/registry/registry-test.md
  - src/skills/ts-project-planner/references/discovery-kanban.md
  - src/skills/ts-deliver-router/rawfiles/references/sub-agents.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-ship.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/registry-build.md
  - src/skills/ts-deliver-router/rawfiles/references/security-gates.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__init__.cpython-314.pyc
  - src/skills/ts-deliver-router/references/acpl-integration.md
  - src/skills/ts-deliver-router/PROJECT_SETUP.md
  - src/skills/ts-deliver-router/references/commands.md
  - src/skills/ts-deliver-router/references/registry-schema.md
  - src/skills/ts-deliver-router/rawfiles/references/phases.md
  - src/skills/ts-deliver-router/rawfiles/references/registry/index.md
  - src/skills/ts-deliver-router/modules/security-gates.md
  - src/skills/ts-deliver-router/references/setup-gaps.md
  - .agents/skills/caveman-compress/scripts/__pycache__/__main__.cpython-314.pyc
  - src/skills/ts-deliver-router/modules/registry/registry-think.md
  - src/skills/ts-deliver-router/modules/registry/registry-reflect.md
  - .agents/skills/caveman-compress/scripts/__pycache__/detect.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/edge-tests.md
  - src/skills/ts-deliver-router/rawfiles/references/workspace.md
  - src/skills/ts-deliver-router/references/state.md
  - src/skills/ts-deliver-router/rawfiles/references/registry-schema.md
  - src/skills/ts-deliver-router/references/registry/registry-think.md
  - src/skills/ts-project-planner/references/iteration-schema.md
  - src/skills/ts-deliver-router/modules/registry/registry-review.md
  - .agents/skills/caveman-compress/scripts/__pycache__/cli.cpython-314.pyc
  - src/skills/ts-deliver-router/rawfiles/references/commands.md
  - src/skills/ts-project-planner/references/workspace-spec.md
  - workflow_cheat_sheet.html
  - src/skills/ts-deliver-router/SKILL.original.md
  - src/skills/ts-deliver-router/modules/registry.md
  - src/skills/ts-deliver-router/references/registry/registry-plan.md
  - src/skills/ts-deliver-router/references/edge-tests.md
-->

### Requirement: Backfill reference package SHALL preserve core router structure
The change SHALL introduce secondary guidance as lazy-loaded reference documents under `src/skills/ts-deliver-router/references/` while preserving existing PRIMARY core router structure, including frontmatter, section hierarchy, fixed phase spine, and primitive identity (`DIAL · CHECKS REGISTRY · DRY-RUN`).

#### Scenario: Core structure remains stable while references are added
- **WHEN** the backfill is applied
- **THEN** the core router document retains existing structural contract and only receives additive pointer/index updates for new references

---
### Requirement: Project registry semantics SHALL extend CHECKS REGISTRY without introducing a new primitive
The backfill SHALL define project registry semantics as project-specific activation and threshold metadata that extend CHECKS REGISTRY behavior, and SHALL NOT redefine primitive count or primitive names.

#### Scenario: Primitive identity remains unchanged
- **WHEN** an operator reads the updated primitive interfaces and related references
- **THEN** project registry appears as supporting model under CHECKS REGISTRY and not as primitive four

##### Example: Primitive set stability
- **GIVEN** primitive set in core router is `DIAL`, `CHECKS REGISTRY`, `DRY-RUN`
- **WHEN** project-registry guidance is added
- **THEN** primitive set remains exactly `DIAL`, `CHECKS REGISTRY`, `DRY-RUN`

---
### Requirement: Expanded operational guidance SHALL be available through explicit reference artifacts
The backfill SHALL include reference artifacts for commands, sub-agent specs, phase-exit contracts, setup-gap guidance, ACPL integration, GitHub MCP traceability, workspace contract, and expanded security checklist detail, and these artifacts SHALL be reachable from documented pointer paths.

#### Scenario: Each required guidance area is discoverable
- **WHEN** a user follows LOAD INDEX rows and documented cross-links
- **THEN** every required guidance area resolves to a concrete reference artifact path

##### Example: Guidance coverage matrix
| Guidance area | Required reference artifact |
| --- | --- |
| Commands | `references/commands.md` |
| Sub-agent specs | `references/sub-agents.md` |
| Phase-exit contracts | `references/phase-exit-contracts.md` |
| Setup gaps | `references/setup-gaps.md` |
| ACPL integration | `references/acpl-integration.md` |
| GitHub MCP traceability | `references/github-mcp.md` |
| Workspace contract | `references/workspace.md` |
| Expanded gate detail | `references/gate-checklists.md` |

---
### Requirement: Security and state guidance SHALL remain schema-aligned and token-efficient
The backfill SHALL keep `modules/security-gates.md` concise with a pointer to full checklist detail, and SHALL ensure phase-exit contract examples remain aligned with state schema v1 semantics documented in `modules/state.md`.

#### Scenario: Compact gate module with full-detail access
- **WHEN** an operator checks gate behavior in `modules/security-gates.md`
- **THEN** concise gate checklist contract is present and full-detail checklist content is reachable through explicit reference link

#### Scenario: Phase-exit examples align to state schema
- **WHEN** phase-exit examples are reviewed against state schema v1 fields
- **THEN** examples use compatible shape for current phase, gate checklist results, and ingest log contract