## ADDED Requirements

### Requirement: Backfill reference package SHALL preserve core router structure
The change SHALL introduce secondary guidance as lazy-loaded reference documents under `src/skills/ts-deliver-router/references/` while preserving existing PRIMARY core router structure, including frontmatter, section hierarchy, fixed phase spine, and primitive identity (`DIAL · CHECKS REGISTRY · DRY-RUN`).

#### Scenario: Core structure remains stable while references are added
- **WHEN** the backfill is applied
- **THEN** the core router document retains existing structural contract and only receives additive pointer/index updates for new references

### Requirement: Project registry semantics SHALL extend CHECKS REGISTRY without introducing a new primitive
The backfill SHALL define project registry semantics as project-specific activation and threshold metadata that extend CHECKS REGISTRY behavior, and SHALL NOT redefine primitive count or primitive names.

#### Scenario: Primitive identity remains unchanged
- **WHEN** an operator reads the updated primitive interfaces and related references
- **THEN** project registry appears as supporting model under CHECKS REGISTRY and not as primitive four

##### Example: Primitive set stability
- **GIVEN** primitive set in core router is `DIAL`, `CHECKS REGISTRY`, `DRY-RUN`
- **WHEN** project-registry guidance is added
- **THEN** primitive set remains exactly `DIAL`, `CHECKS REGISTRY`, `DRY-RUN`

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

### Requirement: Security and state guidance SHALL remain schema-aligned and token-efficient
The backfill SHALL keep `modules/security-gates.md` concise with a pointer to full checklist detail, and SHALL ensure phase-exit contract examples remain aligned with state schema v1 semantics documented in `modules/state.md`.

#### Scenario: Compact gate module with full-detail access
- **WHEN** an operator checks gate behavior in `modules/security-gates.md`
- **THEN** concise gate checklist contract is present and full-detail checklist content is reachable through explicit reference link

#### Scenario: Phase-exit examples align to state schema
- **WHEN** phase-exit examples are reviewed against state schema v1 fields
- **THEN** examples use compatible shape for current phase, gate checklist results, and ingest log contract
