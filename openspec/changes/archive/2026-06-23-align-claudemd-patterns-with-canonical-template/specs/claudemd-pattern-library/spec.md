## ADDED Requirements

### Requirement: Required section checklist matches canonical template

The pattern library SHALL define the following sections as required in every project CLAUDE.md:
- Project
- Stack
- Commands
- Specs
- Architecture Map
- Project File Structure
- Hard Rules (≤15, project-scoped)
- Workflow (single pointer line to goverance_CLAUDE.md)
- Out of Scope
- Maintenance Checklist

The section "Behavior Rules" SHALL NOT appear as a required section name in the pattern library; "Hard Rules" is the canonical name.

The section "Tool Permissions" SHALL NOT appear as a required section; tool permissions belong in `.claude/settings.json`.

#### Scenario: Commands section is listed as required

- **WHEN** an advisor reads the Required Sections table in claudemd-patterns.md
- **THEN** "Commands" appears as a row with purpose "Dev/build/test/lint commands" and failure mode "Agent uses wrong commands"

#### Scenario: Hard Rules appears instead of Behavior Rules

- **WHEN** an advisor reads the Required Sections table
- **THEN** the row is named "Hard Rules" with purpose "Project-specific prohibitions and conventions (≤15 rules)"
- **THEN** no row named "Behavior Rules" exists in the table

#### Scenario: Tool Permissions is not a required section

- **WHEN** an advisor reads the Required Sections table
- **THEN** no row named "Tool Permissions" exists

### Requirement: Optional section list excludes golden-file content

The pattern library SHALL list the following as optional sections only:
- MCP / Tool References

The following items SHALL NOT appear as optional sections in the pattern library:
- Sub-agent Contracts (belongs in goverance_CLAUDE.md Agents Registry)
- Compaction Strategy (not in canonical template)
- Memory Anchors (not in canonical template)

#### Scenario: MCP references are optional not required

- **WHEN** an advisor reads the section classification
- **THEN** "MCP / Tool References" appears in the optional list, not the required list

#### Scenario: Sub-agent Contracts not in pattern library sections

- **WHEN** an advisor reads all section classifications (required + optional)
- **THEN** "Sub-agent Contracts" does not appear in either list

### Requirement: Hard Rules template contains only project-specific examples

The Hard Rules template in the pattern library SHALL contain numbered rules in the format matching the canonical template (`src/project_root_structure/CLAUDE.md`).

The Hard Rules template SHALL NOT contain generic "Always" or "Never" items that duplicate content from `.claude/CLAUDE.md` Core Principles, Anti-Slop Discipline, or Commit & PR Hygiene sections.

#### Scenario: Hard Rules template uses numbered format

- **WHEN** an advisor reads the Hard Rules template section
- **THEN** the template shows numbered rules (e.g., `1. Run npm run type-check after every change.`)
- **THEN** no "Always:" or "Never:" bullet blocks appear in the Hard Rules template

### Requirement: Commands section template present

The pattern library SHALL include a Commands section template with fill-in fields for:
- Dev command
- Build command
- Test file command
- Test all command
- Lint command
- Types command

#### Scenario: Commands template is findable in the document

- **WHEN** an advisor searches claudemd-patterns.md for a Commands section
- **THEN** a template with `<FILL IN>` placeholders for dev/build/test/lint/types commands exists

### Requirement: Scoring rubric uses 12-point scale aligned to required sections

The pattern library scoring rubric SHALL:
- Score exactly 6 rows × 2 points each = 12 points maximum
- Not include a "Tool Permissions" row
- Not include a "Sub-agent Contracts" row
- Include a "Commands" row
- Rename "Behavior rules" row to "Hard rules"
- Define score thresholds: 0–3 = Major gaps (generate new), 4–7 = Moderate gaps (additions), 8–10 = Good (minor refinements), 11–12 = Excellent (no action)

#### Scenario: Rubric max score is 12

- **WHEN** an advisor reads the Scoring Rubric section
- **THEN** the stated maximum score is 12 (not 16)
- **THEN** exactly 6 rows appear in the rubric table

#### Scenario: Rubric includes Commands row

- **WHEN** an advisor reads the Scoring Rubric
- **THEN** a row for "Commands" exists with scoring criteria

### Requirement: Good Example section contains no golden-file-only blocks

The Good Example in the pattern library SHALL NOT contain a Sub-agents block or a Compaction block.

The Good Example SHALL use "Hard Rules" (not "Behavior Rules") as the section heading.

#### Scenario: Good Example uses Hard Rules heading

- **WHEN** an advisor reads the Good Example section
- **THEN** the section heading reads "## Hard Rules" (not "## Behavior Rules")

#### Scenario: Good Example has no Sub-agents or Compaction blocks

- **WHEN** an advisor reads the Good Example section
- **THEN** no "## Sub-agents" or "## Compaction" heading appears
