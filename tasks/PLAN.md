# Audit + Skill Distribution Design — agenticToolset

## Context

Repo is a framework for authoring Claude Code skills/plugins/MCP artifacts. Current
milestone focus: software development workflow. Authored skills live in `src/skills/*`
as docs-first bundles (`SKILL.md` + reference dirs).

**Problem observed:** there is no easy, repeatable way for users to install/update the
repo's *own* skills. Today:
- Own skills are reachable only via local `.claude/skills/` symlinks → `src/skills/*`
  (works on this machine, not portable to consumers).
- Third-party skills (caveman, spectra) were pulled with the `skills` npx CLI
  (`npx skills add <owner/repo>`), tracked in `skills-lock.json` (github source + SHA256).
- No `marketplace.json`, no root `skills/`, no `bin`, no npm publish, no git tags, no VERSION, no CI.

**The blocker:** `npx skills add <repo>` (and `/plugin marketplace`) expect skills at
**`skills/<name>/SKILL.md` at repo root**. This repo keeps them at `src/skills/*`, so a
one-line `npx skills add chingchangtw/agentic_toolset` cannot resolve them.

**Freeze constraint (user):** `.claude/`, `.github/`, and project config must not be
changed by the agent during development until explicitly instructed. This design keeps
authoring in `src/skills/` and touches none of those — all distribution artifacts are
*generated* into new, non-frozen locations.

**Decisions (confirmed):**
- Layout → **release build copies `src/skills/*` → root `skills/`** on publish/tag.
- Channels → **`npx skills add` (cross-platform)** + **documented post-install setup commands**.
  (Native `/plugin marketplace` deferred — not selected.)
- Timing → **plan only this milestone**; build later.

This document is the deliverable. No code is written now.

---

## Audit Findings (structural)

Healthy:
- Clear src boundaries (`core/`, `types/`, `skills/`, `plugins/`, `mcp/`, `utils/`), path aliases, ESM/strict TS.
- Spec-driven flow intact (`openspec/specs`, `openspec/changes`), governance docs present.
- Self-contained skills, no cross-skill imports (matches Hard Rules).

Gaps relevant to distribution:
1. No root `skills/` → CLI/marketplace can't discover own skills.
2. No release/versioning surface: no `VERSION`, no git tags, no `CHANGELOG`, `package.json` lacks `bin`/`files`/publish.
3. No CI (`.github/workflows/` absent) to gate/publish releases.
4. `skills-lock.json` only tracks *inbound* third-party skills, not *outbound* publishing.
5. Post-install setup steps (commands/agents/hooks a skill registers) are undocumented for consumers.

Out of scope (do not touch): `.claude/`, `.github/`, `package.json`/`tsconfig.json` config,
`dist/`, `.env`.

---

## Recommended Approach — "release-build" distribution

Author in `src/skills/`; generate a consumer-standard layout at release time. Consumers
install with the same `npx skills add` flow already used for third-party skills.

### 1. Release build script (new, future)
`scripts/build-skills-dist.mjs` (Node ESM, zero new deps):
- Reads each `src/skills/<name>/` (and `src/skills/ondemand/<name>/`).
- Copies each skill bundle (SKILL.md + reference dirs) → root **`skills/<name>/`**.
- Validates every skill has `SKILL.md` with `name` + `description` frontmatter (fail loud if missing).
- Generates **`skills/manifest.json`** (or `marketplace.json` later): list of `{name, description, version, path, setup?}`.
- Pure copy + validate; idempotent; root `skills/` is generated output (gitignore-or-commit decision below).

### 2. Publishing channel
Consumers run:
```
npx skills@latest add chingchangtw/agentic_toolset
# cross-platform: npx skills add chingchangtw/agentic_toolset -a github-copilot
```
The CLI resolves `skills/<name>/SKILL.md` at repo root → records source+hash in *their*
`skills-lock.json` (same mechanism this repo already uses). Updates = re-run `skills add`,
which re-pins the hash.

### 3. Versioning surface (new, future)
- Add a `VERSION` file + git tags (`vX.Y.Z`) so installs are pinnable/reproducible.
- Each skill carries `version:` in its `SKILL.md` frontmatter → flows into `manifest.json`.
- `CHANGELOG.md` per release (what changed per skill).

### 4. Documented post-install setup (new, future)
`docs/INSTALL.md` (extends existing `docs/project_init.md` style):
- Per-skill: the `npx skills add` line **plus** any setup command the skill needs
  (mirrors caveman `--with-init`, matt-pocock `/setup-...`). Skills that register
  commands/agents/hooks list their exact post-install step.
- README "Install" section links here.

### 5. Commit-vs-generate decision (needs confirmation at build time)
- **Option A (recommended): commit generated `skills/`** so `npx skills add` works off a
  plain clone with no build step on the consumer side. Add a CI/pre-publish check that
  `skills/` matches `src/skills/` (drift guard).
- Option B: keep `skills/` gitignored, publish via tagged release artifact only.

---

## Files to create (LATER — not this milestone)
- `scripts/build-skills-dist.mjs` — generator/validator.
- `skills/` (generated) + `skills/manifest.json`.
- `VERSION`, `CHANGELOG.md`.
- `docs/INSTALL.md`; README "Install" section.
- `package.json` script `"build:skills"` — **deferred**: editing package.json is config; only with explicit go-ahead.
- CI workflow under `.github/workflows/` — **deferred**: `.github/` is frozen; only with explicit go-ahead.

None of these touch `.claude/`, `.github/`, or existing config without a separate instruction.

## Verification (when built)
1. Run `node scripts/build-skills-dist.mjs` → assert root `skills/<name>/SKILL.md` exists for every `src/skills/*`, frontmatter valid, `manifest.json` lists all.
2. From a scratch dir: `npx skills@latest add chingchangtw/agentic_toolset` (against a test branch/tag) → confirm skills land + `skills-lock.json` pins hashes.
3. Re-run to confirm idempotent update (hash unchanged).
4. Diff guard: `skills/` regenerates byte-identical from `src/skills/` (no manual drift).

## Open items for build phase
- Confirm Option A vs B (commit generated dir vs release artifact).
- Confirm explicit go-ahead before any `package.json`/`.github` edits (currently frozen).



####################################



# Revised Plan: Align claudemd-patterns.md with canonical template

## Goal
Align `src/skills/ondemand/ts-project-init-advisor/references/claudemd-patterns.md` with the canonical template (`src/project_root_structure/CLAUDE.md`) and golden rules (`.claude/CLAUDE.md` + `goverance_CLAUDE.md`). Pattern library should teach MINIMAL project CLAUDE.md structure only. Remove all content that duplicates golden files or contradicts the canonical template.

## Source of Truth Hierarchy
1. **Canonical template**: `src/project_root_structure/CLAUDE.md` — defines what sections a project CLAUDE.md must contain
2. **Universal rules**: `src/project_root_structure/.claude/CLAUDE.md` — universal agent behavior, not to be repeated in project CLAUDE.md
3. **Governance**: `src/project_root_structure/.claude/goverance_CLAUDE.md` — DoD, registries, agents — not to be in project CLAUDE.md

## Canonical Template Sections (what user CLAUDE.md must have)
From `project_root_structure/CLAUDE.md`:
- Project (overview + context)
- Stack
- **Commands** ← MISSING from patterns library
- Specs
- Architecture Map
- Project File Structure
- **Hard Rules** (project-scoped, ≤15) ← patterns uses "Behavior Rules" (wrong name + wrong examples)
- Workflow (pointer to goverance — one line only)
- Out of Scope
- Maintenance Checklist

## Precise Changes to `claudemd-patterns.md`

### Section 1: Required Sections (lines 16-33)

**Update table**:
- Rename "Behavior Rules" → "Hard Rules"; purpose = "Project-specific prohibitions and conventions (≤15 rules)"
- Remove "Tool Permissions" from required (belongs in `.claude/settings.json` + Hard Rules)
- Move "MCP / Tool References" to Optional (not in canonical template)
- Add "Commands" as required: "Dev/build/test/lint commands" → "Agent uses wrong commands"

**Update optional list** (lines 29-32):
- Remove: Sub-agent Contracts, Compaction Strategy, Memory Anchors
- Add: MCP Tool References (project-specific MCPs only)

### Section 2: Templates (lines 36-180)

**Add Commands template** (after Tech Stack, ~line 62):
Matches canonical template format with placeholders for dev/build/test/lint/types.

**Rename + refactor Behavior Rules → Hard Rules** (lines 63-83):
- Remove: generic "Always" items (write tests, follow style, keep changes minimal) — all in `.claude/CLAUDE.md` Core Principles
- Remove: generic "Never" items (Modify .env, Run destructive bash, Push to main) — in `.claude/CLAUDE.md` Commit & PR Hygiene + Anti-Slop Discipline
- Keep/replace: numbered format matching canonical template with project-specific examples

**Remove Tool Permissions template** (lines 85-103):
- Not in canonical template
- Replace with: "Tool permissions → `.claude/settings.json`. Project prohibitions → Hard Rules."

**Keep Architecture Notes template** (lines 105-123): unchanged.

**Simplify MCP / Tool References** (lines 125-142):
- Keep template but mark as optional
- Add scoping note: "Only project-specific MCP usage. Do NOT duplicate `.claude/CLAUDE.md` behavior."

**Remove Sub-agent Contracts** (lines 144-162):
- Belongs in `goverance_CLAUDE.md` Agents Registry
- Replace with: "Agents registry → `.claude/goverance_CLAUDE.md`."

**Remove Compaction Strategy** (lines 164-179):
- Not in canonical template or golden files

### Section 3: Anti-Patterns (lines 183-235)

No changes — all anti-patterns are project-scoped evaluation guidance with no golden rule overlap.

### Section 4: Scoring Rubric (lines 238-258)

**Update rows**:
- "Behavior rules" → rename "Hard rules"; score 2 = "≤15 project-specific rules with rationale"
- "Tool permissions" → remove
- "Sub-agent contracts" → remove
- Add "Commands" row: 0 = missing, 1 = partial, 2 = all commands present

**Update max score** (16 → 12):
- 0–3: Major gaps → generate new CLAUDE.md from scratch
- 4–7: Moderate gaps → targeted additions
- 8–10: Good → minor refinements only
- 11–12: Excellent → no action needed

### Section 5: Complete Good Example (lines 261-321)

- Remove Sub-agents block (lines 315-317)
- Remove Compaction block (lines 319-320)
- Rename "Behavior Rules" → "Hard Rules" in example
- Keep all other content (project-specific examples are fine)

## Expected Outcome
322 → ~230 lines. Pattern library aligns with canonical template structure. No duplication of `.claude/CLAUDE.md` or `goverance_CLAUDE.md` content.
