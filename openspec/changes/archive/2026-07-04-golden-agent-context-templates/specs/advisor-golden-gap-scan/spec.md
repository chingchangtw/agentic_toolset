## ADDED Requirements

### Requirement: Advisor creates absent golden files directly

When ts-project-init-advisor generates PROJECT_INIT_PLAN.md, it SHALL check the target project for each of the 5 golden files at its target-relative path (derived from the file's subpath under `assets/golden/`). For any golden file absent from the target project, the advisor SHALL emit a task that creates the file with content byte-identical to the packaged `assets/golden/<relpath>` copy. This task SHALL NOT require approval before the create action executes, because no existing file is at risk.

#### Scenario: Absent CLAUDE.md is created directly

- **WHEN** the target project has no `CLAUDE.md` at its root and the advisor runs
- **THEN** PROJECT_INIT_PLAN.md SHALL contain a create task for `CLAUDE.md` using the packaged `assets/golden/CLAUDE.md` content
- **THEN** executing that task SHALL produce a target `CLAUDE.md` byte-identical to `assets/golden/CLAUDE.md`

### Requirement: Advisor never writes to an existing golden-file target

The advisor SHALL NOT write directly to any of the 5 golden-file target paths that already exist in the target project, under any autonomy or approval setting.

#### Scenario: Existing file is never auto-overwritten

- **WHEN** the target project already has a `.claude/CLAUDE.md` file and the advisor runs
- **THEN** the advisor SHALL NOT modify `.claude/CLAUDE.md` directly as part of generating PROJECT_INIT_PLAN.md

### Requirement: Diverging existing files get a diff-only MODIFY task

For any golden file present in the target project whose content is not byte-identical to the corresponding `assets/golden/<relpath>` content, the advisor SHALL emit a MODIFY task in PROJECT_INIT_PLAN.md containing the file's target path and a content comparison between the target's current content and the golden content. The advisor SHALL NOT classify which side of the diff represents intentional customization versus a missing update, and SHALL NOT propose or perform an automatic merge.

#### Scenario: Diverging AGENTS.md produces a diff task, not a merge

- **WHEN** the target project's `AGENTS.md` differs from `assets/golden/AGENTS.md` and the advisor runs
- **THEN** PROJECT_INIT_PLAN.md SHALL contain exactly one MODIFY task for `AGENTS.md` containing a content comparison between the two versions
- **THEN** that task SHALL NOT contain a pre-computed merged version of the file

### Requirement: Byte-identical existing files produce no task

For any golden file present in the target project whose content is byte-identical to the corresponding `assets/golden/<relpath>` content, the advisor SHALL NOT emit any task for that file.

#### Scenario: Already-aligned file is silent

- **WHEN** the target project's `.github/copilot-instructions.md` is byte-identical to `assets/golden/.github/copilot-instructions.md` and the advisor runs
- **THEN** PROJECT_INIT_PLAN.md SHALL contain no task referencing `.github/copilot-instructions.md`
