# discovery-subagents Specification

## Purpose

TBD - created by archiving change 'dual-track-orchestration'. Update Purpose after archive.

## Requirements

### Requirement: ts-event-storming-facilitator is required to exit /ts-discover explore

`/ts-discover explore <id>` SHALL run `ts-event-storming-facilitator` and
SHALL NOT advance `idea.status` to `"exploring"` unless
`exploration_output.domain_events`, `.aggregates`, and `.bounded_contexts`
are all non-empty.

#### Scenario: facilitator output populates exploration_output

- **WHEN** `/ts-discover explore idea-NNN` runs and the facilitator returns a
  well-formed output contract
- **THEN** `idea-NNN.exploration_output` is written with `domain_events`,
  `commands`, `aggregates`, `bounded_contexts`, `acpl_pattern_group`, and
  `ubiquitous_language_terms`, and `idea-NNN.status` becomes `"exploring"`

#### Scenario: empty required fields block the transition

- **WHEN** the facilitator returns empty `domain_events`, `aggregates`, or
  `bounded_contexts`
- **THEN** `idea-NNN.status` stays `"idea"`, the missing fields are reported,
  and the facilitator is re-run — the command does NOT proceed to set
  `status = "exploring"`


<!-- @trace
source: dual-track-orchestration
updated: 2026-07-05
code:
  - src/skills/ts-project-planner/references/discovery-state.md
  - src/skills/ts-deliver-router/references/workspace.md
  - src/skills/ts-orchestrate/commands/next.md
  - src/skills/ts-project-planner/SKILL.md
  - scripts/build-release.mjs
  - src/skills/ts-orchestrate/commands/start.md
  - src/hook/inject-workflow-state.sh
  - .agents/ts-project-planner/retrospectives/MVP-retro.md
  - tests/orchestration/fixtures/iteration-state/feature-mid.json
  - src/skills/ts-project-planner/references/agents.md
  - tasks/dual-track-orchestration-plan.md
  - tests/orchestration/fixtures/iteration-state/ops-mid.json
  - .agents/ts-project-planner/plan.json
  - src/utils/phase-routing.ts
  - scripts/verify-install.mjs
  - tests/orchestration/fixtures/iteration-state/ops-high.json
  - .agents/ts-project-planner/retrospectives/Iter1-retro.md
  - tests/orchestration/fixtures/iteration-state/hotfix-low.json
  - tasks/ideasToImproveOrchestration.md
  - .agents/ts-deliver-router/artifacts/EPIC-DUAL-TRACK-ORCHESTRATION/review/report.md
  - release/install.sh
  - .agents/ts-deliver-router/artifacts/EPIC-DUAL-TRACK-ORCHESTRATION/think/framing.md
  - src/skills/ts-project-planner/references/work-unit-profiles.md
  - scripts/generate-gitignore-block.mjs
  - tests/orchestration/fixtures/iteration-state/feature-high.json
  - tests/orchestration/fixtures/iteration-state/chore-high.json
  - release/CHANGELOG.md
  - tests/orchestration/fixtures/iteration-state/patch-low.json
  - tests/orchestration/fixtures/iteration-state/patch-mid.json
  - src/skills/ts-md-improve/SKILL.md
  - tests/orchestration/fixtures/iteration-state/spike-high.json
  - tests/orchestration/fixtures/iteration-state/chore-low.json
  - .agents/ts-deliver-router/artifacts/EPIC-DUAL-TRACK-ORCHESTRATION/think/never_automate.md
  - src/skills/ts-orchestrate/SKILL.md
  - src/agents/ts-ddd-tactical-validator.md
  - tests/orchestration/fixtures/iteration-state/hotfix-mid.json
  - tests/orchestration/fixtures/iteration-state/feature-low.json
  - scripts/release-manifest.json
  - release/install.ps1
  - tests/orchestration/fixtures/iteration-state/spike-mid.json
  - .agents/iteration.json
  - tests/orchestration/fixtures/iteration-state/patch-high.json
  - src/skills/ts-deliver-router/references/sub-agents.md
  - scripts/generate-manifest.mjs
  - scripts/ring0-check.mjs
  - src/agents/ts-event-storming-facilitator.md
  - src/skills/ts-project-planner/references/commands.md
  - tests/orchestration/fixtures/iteration-state/chore-mid.json
  - tests/orchestration/fixtures/iteration-state/hotfix-high.json
  - tests/orchestration/fixtures/iteration-state/ops-low.json
  - scripts/dogfood.mjs
  - src/skills/ts-md-improve/references/delegation-templates.md
  - src/skills/ts-md-improve/references/judgment-checklist.md
  - tests/orchestration/fixtures/iteration-state/spike-low.json
  - .agents/ts-deliver-router/artifacts/EPIC-DUAL-TRACK-ORCHESTRATION/think/capabilities.md
  - scripts/pilot.mjs
tests:
  - src/tests/unit/hook-output.test.ts
  - src/tests/unit/phase-routing.test.ts
  - src/tests/unit/gate-enforcement.test.ts
  - src/tests/unit/state-schema.test.ts
  - src/tests/unit/spine-consistency.test.ts
-->

---
### Requirement: ts-ddd-tactical-validator is required before /ts-discover decide build

`/ts-discover decide <id> build` SHALL require
`validation_output.ddd_validation` to exist with
`recommendation != "FAIL"`. If `validate` was skipped (no H-risk
assumptions), `decide build` SHALL invoke `ts-ddd-tactical-validator` (Mode
A) at decide-time before proceeding.

#### Scenario: validator runs during validate

- **WHEN** `/ts-discover validate <id>` runs
- **THEN** `ts-ddd-tactical-validator` (Mode A) always runs and writes
  `validation_output.ddd_validation`

#### Scenario: validator runs at decide-time if validate was skipped

- **WHEN** `/ts-discover decide <id> build` runs and
  `validation_output.ddd_validation` is absent
- **THEN** `ts-ddd-tactical-validator` (Mode A) runs now, before the build
  decision is finalized

#### Scenario: FAIL blocks the build decision

- **WHEN** `validation_output.ddd_validation.recommendation == "FAIL"`
- **THEN** `/ts-discover decide <id> build` STOPS, surfaces the violations,
  and suggests `keep-learning` or `reduce-scope` instead


<!-- @trace
source: dual-track-orchestration
updated: 2026-07-05
code:
  - src/skills/ts-project-planner/references/discovery-state.md
  - src/skills/ts-deliver-router/references/workspace.md
  - src/skills/ts-orchestrate/commands/next.md
  - src/skills/ts-project-planner/SKILL.md
  - scripts/build-release.mjs
  - src/skills/ts-orchestrate/commands/start.md
  - src/hook/inject-workflow-state.sh
  - .agents/ts-project-planner/retrospectives/MVP-retro.md
  - tests/orchestration/fixtures/iteration-state/feature-mid.json
  - src/skills/ts-project-planner/references/agents.md
  - tasks/dual-track-orchestration-plan.md
  - tests/orchestration/fixtures/iteration-state/ops-mid.json
  - .agents/ts-project-planner/plan.json
  - src/utils/phase-routing.ts
  - scripts/verify-install.mjs
  - tests/orchestration/fixtures/iteration-state/ops-high.json
  - .agents/ts-project-planner/retrospectives/Iter1-retro.md
  - tests/orchestration/fixtures/iteration-state/hotfix-low.json
  - tasks/ideasToImproveOrchestration.md
  - .agents/ts-deliver-router/artifacts/EPIC-DUAL-TRACK-ORCHESTRATION/review/report.md
  - release/install.sh
  - .agents/ts-deliver-router/artifacts/EPIC-DUAL-TRACK-ORCHESTRATION/think/framing.md
  - src/skills/ts-project-planner/references/work-unit-profiles.md
  - scripts/generate-gitignore-block.mjs
  - tests/orchestration/fixtures/iteration-state/feature-high.json
  - tests/orchestration/fixtures/iteration-state/chore-high.json
  - release/CHANGELOG.md
  - tests/orchestration/fixtures/iteration-state/patch-low.json
  - tests/orchestration/fixtures/iteration-state/patch-mid.json
  - src/skills/ts-md-improve/SKILL.md
  - tests/orchestration/fixtures/iteration-state/spike-high.json
  - tests/orchestration/fixtures/iteration-state/chore-low.json
  - .agents/ts-deliver-router/artifacts/EPIC-DUAL-TRACK-ORCHESTRATION/think/never_automate.md
  - src/skills/ts-orchestrate/SKILL.md
  - src/agents/ts-ddd-tactical-validator.md
  - tests/orchestration/fixtures/iteration-state/hotfix-mid.json
  - tests/orchestration/fixtures/iteration-state/feature-low.json
  - scripts/release-manifest.json
  - release/install.ps1
  - tests/orchestration/fixtures/iteration-state/spike-mid.json
  - .agents/iteration.json
  - tests/orchestration/fixtures/iteration-state/patch-high.json
  - src/skills/ts-deliver-router/references/sub-agents.md
  - scripts/generate-manifest.mjs
  - scripts/ring0-check.mjs
  - src/agents/ts-event-storming-facilitator.md
  - src/skills/ts-project-planner/references/commands.md
  - tests/orchestration/fixtures/iteration-state/chore-mid.json
  - tests/orchestration/fixtures/iteration-state/hotfix-high.json
  - tests/orchestration/fixtures/iteration-state/ops-low.json
  - scripts/dogfood.mjs
  - src/skills/ts-md-improve/references/delegation-templates.md
  - src/skills/ts-md-improve/references/judgment-checklist.md
  - tests/orchestration/fixtures/iteration-state/spike-low.json
  - .agents/ts-deliver-router/artifacts/EPIC-DUAL-TRACK-ORCHESTRATION/think/capabilities.md
  - scripts/pilot.mjs
tests:
  - src/tests/unit/hook-output.test.ts
  - src/tests/unit/phase-routing.test.ts
  - src/tests/unit/gate-enforcement.test.ts
  - src/tests/unit/state-schema.test.ts
  - src/tests/unit/spine-consistency.test.ts
-->

---
### Requirement: exploration_output schema includes ubiquitous_language_terms

`idea.exploration_output` SHALL include a `ubiquitous_language_terms[]`
array, populated by `ts-event-storming-facilitator` and consumed by
`ts-ddd-tactical-validator`'s coverage calculation.

#### Scenario: schema includes the new field

- **WHEN** a developer reads `discovery-state.md`'s schema example
- **THEN** `exploration_output.ubiquitous_language_terms` appears alongside
  `domain_events`, `commands`, `aggregates`, `bounded_contexts`,
  `acpl_pattern_group`

<!-- @trace
source: dual-track-orchestration
updated: 2026-07-05
code:
  - src/skills/ts-project-planner/references/discovery-state.md
  - src/skills/ts-deliver-router/references/workspace.md
  - src/skills/ts-orchestrate/commands/next.md
  - src/skills/ts-project-planner/SKILL.md
  - scripts/build-release.mjs
  - src/skills/ts-orchestrate/commands/start.md
  - src/hook/inject-workflow-state.sh
  - .agents/ts-project-planner/retrospectives/MVP-retro.md
  - tests/orchestration/fixtures/iteration-state/feature-mid.json
  - src/skills/ts-project-planner/references/agents.md
  - tasks/dual-track-orchestration-plan.md
  - tests/orchestration/fixtures/iteration-state/ops-mid.json
  - .agents/ts-project-planner/plan.json
  - src/utils/phase-routing.ts
  - scripts/verify-install.mjs
  - tests/orchestration/fixtures/iteration-state/ops-high.json
  - .agents/ts-project-planner/retrospectives/Iter1-retro.md
  - tests/orchestration/fixtures/iteration-state/hotfix-low.json
  - tasks/ideasToImproveOrchestration.md
  - .agents/ts-deliver-router/artifacts/EPIC-DUAL-TRACK-ORCHESTRATION/review/report.md
  - release/install.sh
  - .agents/ts-deliver-router/artifacts/EPIC-DUAL-TRACK-ORCHESTRATION/think/framing.md
  - src/skills/ts-project-planner/references/work-unit-profiles.md
  - scripts/generate-gitignore-block.mjs
  - tests/orchestration/fixtures/iteration-state/feature-high.json
  - tests/orchestration/fixtures/iteration-state/chore-high.json
  - release/CHANGELOG.md
  - tests/orchestration/fixtures/iteration-state/patch-low.json
  - tests/orchestration/fixtures/iteration-state/patch-mid.json
  - src/skills/ts-md-improve/SKILL.md
  - tests/orchestration/fixtures/iteration-state/spike-high.json
  - tests/orchestration/fixtures/iteration-state/chore-low.json
  - .agents/ts-deliver-router/artifacts/EPIC-DUAL-TRACK-ORCHESTRATION/think/never_automate.md
  - src/skills/ts-orchestrate/SKILL.md
  - src/agents/ts-ddd-tactical-validator.md
  - tests/orchestration/fixtures/iteration-state/hotfix-mid.json
  - tests/orchestration/fixtures/iteration-state/feature-low.json
  - scripts/release-manifest.json
  - release/install.ps1
  - tests/orchestration/fixtures/iteration-state/spike-mid.json
  - .agents/iteration.json
  - tests/orchestration/fixtures/iteration-state/patch-high.json
  - src/skills/ts-deliver-router/references/sub-agents.md
  - scripts/generate-manifest.mjs
  - scripts/ring0-check.mjs
  - src/agents/ts-event-storming-facilitator.md
  - src/skills/ts-project-planner/references/commands.md
  - tests/orchestration/fixtures/iteration-state/chore-mid.json
  - tests/orchestration/fixtures/iteration-state/hotfix-high.json
  - tests/orchestration/fixtures/iteration-state/ops-low.json
  - scripts/dogfood.mjs
  - src/skills/ts-md-improve/references/delegation-templates.md
  - src/skills/ts-md-improve/references/judgment-checklist.md
  - tests/orchestration/fixtures/iteration-state/spike-low.json
  - .agents/ts-deliver-router/artifacts/EPIC-DUAL-TRACK-ORCHESTRATION/think/capabilities.md
  - scripts/pilot.mjs
tests:
  - src/tests/unit/hook-output.test.ts
  - src/tests/unit/phase-routing.test.ts
  - src/tests/unit/gate-enforcement.test.ts
  - src/tests/unit/state-schema.test.ts
  - src/tests/unit/spine-consistency.test.ts
-->