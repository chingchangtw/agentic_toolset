## ADDED Requirements

### Requirement: Sync copies golden files preserving subpaths

`scripts/lib/golden-templates.mjs` SHALL export `syncGoldenTemplates()`, which SHALL copy each of the 5 files listed in `GOLDEN_FILES` from `src/project_root_structure/<relpath>` to `src/skills/ondemand/ts-project-init-advisor/assets/golden/<relpath>`, preserving the relative subpath including any leading dot-directory (`.claude/`, `.github/`), overwriting the destination unconditionally.

#### Scenario: Sync copies a nested dotted-directory file

- **WHEN** `syncGoldenTemplates()` runs and `src/project_root_structure/.claude/CLAUDE.md` exists
- **THEN** `src/skills/ondemand/ts-project-init-advisor/assets/golden/.claude/CLAUDE.md` SHALL exist with byte-identical content

#### Scenario: Sync overwrites stale destination content

- **WHEN** `syncGoldenTemplates()` runs and `assets/golden/AGENTS.md` already exists with content differing from `src/project_root_structure/AGENTS.md`
- **THEN** after the call, `assets/golden/AGENTS.md` SHALL be byte-identical to `src/project_root_structure/AGENTS.md`

### Requirement: npm run sync-golden invokes the sync

`package.json` SHALL define a `sync-golden` script that runs `node scripts/sync-golden-templates.mjs`, and that script SHALL call `syncGoldenTemplates()` from `scripts/lib/golden-templates.mjs`.

#### Scenario: Developer runs the sync command

- **WHEN** a developer runs `npm run sync-golden` after editing `src/project_root_structure/CLAUDE.md`
- **THEN** `src/skills/ondemand/ts-project-init-advisor/assets/golden/CLAUDE.md` SHALL reflect the edited content
