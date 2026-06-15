## Context

`ts-deliver-router` currently routes with a compact core document (`src/skills/ts-deliver-router/SKILL.md`) and lazy-loaded module docs under `src/skills/ts-deliver-router/modules/`. The secondary variant in `tasks/ts-deliver-router/` contains additional operational guidance that is currently absent from the PRIMARY router surface. Missing guidance creates drift in how operators and future agents interpret checks, setup gaps, phase exits, and traceability.

## Goals / Non-Goals

**Goals:**

- Backfill missing secondary guidance into PRIMARY using lazy-loaded references under `src/skills/ts-deliver-router/references/`.
- Preserve PRIMARY core shape: frontmatter, section hierarchy, phase spine, and primitive names.
- Keep DRY-RUN as primitive 3 while documenting PROJECT REGISTRY as a CHECKS REGISTRY extension.
- Add durable reference contracts for commands, setup gaps, phase exit examples, security checklist expansion, ACPL integration, GitHub MCP traceability, and workspace contract.

**Non-Goals:**

- No runtime code changes or new executable router logic.
- No Atlassian Rovo/Jira/Confluence lifecycle integration.
- No full migration of existing `modules/` content into `references/`.
- No cleanup of pre-existing old monolithic registry pointer beyond this change scope.

## Decisions

### Keep core router minimal and expand via new references
Use `references/` for backfilled capability and keep existing `modules/` in place. This keeps current routing behavior stable and allows additive documentation growth through LOAD INDEX pointers.

Alternative considered: merge all backfill content directly into `SKILL.md`. Rejected because it increases token cost and weakens progressive disclosure.

### Preserve primitive semantics and map project registry under CHECKS REGISTRY
PROJECT REGISTRY guidance is added as supporting model and file contract, but primitive identity remains `DIAL · CHECKS REGISTRY · DRY-RUN`.

Alternative considered: introduce PROJECT REGISTRY as a fourth primitive. Rejected because it changes established operator mental model and core router contract.

### Use template-vs-project split for registry source of truth
`modules/registry/registry-<phase>.md` remains the catalog of possible checks. Project registry content defines project-specific activation tiers, thresholds, lifecycle stage defaults, and setup-gap state.

Alternative considered: replace phase templates with single per-project registry source. Rejected because it removes reusable baseline and raises migration cost.

### Keep security gates terse in module, full detail in reference
`modules/security-gates.md` remains concise and links to `references/gate-checklists.md` for expanded STRIDE/OWASP/ACPL detail.

Alternative considered: move all checklist detail into module file. Rejected because gate module is runtime-critical lookup surface and should remain compact.

## Implementation Contract

- **Behavior:** Router documentation SHALL expose complete backfilled guidance through lazy-loading paths, without changing current phase flow or primitive naming.
- **Interface/data shapes:**
  - `src/skills/ts-deliver-router/SKILL.md` LOAD INDEX SHALL include new `references/*.md` rows for added capability areas.
  - CHECKS REGISTRY interface text SHALL include a pointer to project-registry reference semantics.
  - `references/phase-exit-contracts.md` examples SHALL conform to schema semantics documented in `modules/state.md` (`schema_version: "1"`, gates/checklist/results shape, ingest log shape).
  - Phase registry files SHALL include explicit new `rec` rows where ACPL, GitHub MCP, and sub-agent guidance is surfaced.
- **Failure modes:**
  - If a reference file path is listed but missing, routing guidance is incomplete and change is invalid.
  - If PROJECT REGISTRY wording implies new primitive identity, operator behavior may drift; wording SHALL explicitly preserve existing three primitives.
  - If exit-contract examples diverge from state schema v1, downstream edge/schema checks become inconsistent.
- **Acceptance criteria:**
  - `spectra analyze wise-snacking-fountain --json` has no Critical/Warning findings after fixes.
  - `spectra validate wise-snacking-fountain` succeeds.
  - Proposal/specs/tasks artifacts align on file paths and scope boundaries.
- **Scope boundaries:**
  - In scope: artifact updates under change directory and referenced router docs listed in proposal impact.
  - Out of scope: implementation code changes, Atlassian integration, broad registry cleanup beyond targeted references.

## Risks / Trade-offs

- **Mixed directory model (`modules/` + `references/`)** → Keep explicit notes in design/tasks so reviewers treat it as intentional transitional structure.
- **Over-specified references increase maintenance burden** → Limit core file edits to pointer lines and keep details in separate reference files.
- **Ambiguity in project-registry vs template-registry ownership** → State explicit ownership contract in project-registry and tasks acceptance checks.
