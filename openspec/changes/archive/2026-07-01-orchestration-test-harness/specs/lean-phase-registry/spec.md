## ADDED Requirements

### Requirement: registry-lean.md documents Think→Build→Ship for bugfix work type
`src/skills/ts-deliver-router/references/registry-lean.md` SHALL document the lean phase profile for `bugfix` epic type: ordered phase list `["Think", "Build", "Ship"]`, no G1 gate required, no G2 gate required.

#### Scenario: lean profile specifies 3-phase spine
- **WHEN** a developer reads registry-lean.md
- **THEN** the file lists exactly 3 phases: Think, Build, Ship — with no Plan, Review, Test, or Reflect phases

#### Scenario: lean profile documents gate exclusions
- **WHEN** a developer reads registry-lean.md
- **THEN** the file explicitly states "G1 not required for bugfix lean path" and "G2 not required for bugfix lean path"

### Requirement: lean registry format matches existing ts-deliver-router references
The file format SHALL be consistent with existing reference files in `src/skills/ts-deliver-router/references/` (same heading structure, same phase table format as phases.md).

#### Scenario: format is consistent with phases.md
- **WHEN** registry-lean.md and phases.md are compared
- **THEN** both use the same markdown heading levels and phase table structure
