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
