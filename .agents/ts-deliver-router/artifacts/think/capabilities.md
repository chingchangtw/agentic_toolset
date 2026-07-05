# Think — Capabilities: EPIC-GOLDEN-TEMPLATES

## New capabilities this epic delivers

1. **golden-template-sync** — build-time step (extends `scripts/build-release.mjs`
   or a new `scripts/sync-golden-templates.mjs`) that copies the 5 files from
   `src/project_root_structure/` into `src/skills/ondemand/ts-project-init-advisor/assets/golden/`,
   preserving relative subpaths (`.claude/`, `.github/`).

2. **golden-template-parity-gate** — release build fails if
   `assets/golden/` differs from `src/project_root_structure/` sources at
   build time (guards against a stale sync being hand-edited or skipped).

3. **advisor-golden-gap-scan** — new advisor SKILL.md phase/step: for each of
   the 5 golden files, check target-project presence:
   - **Absent** → direct-create from `assets/golden/<file>`, byte-identical.
   - **Present** → gap-analysis vs golden content, emit a MODIFY task into
     `PROJECT_INIT_PLAN.md` (never auto-write).

4. **install.sh coexistence documentation** — explicit statement of how
   `SCAFFOLD=y` and the new advisor path relate (candidates: advisor
   supersedes it for the 5 golden files while `SCAFFOLD=y` keeps covering the
   rest of `src/project_root_structure/`; or `SCAFFOLD=y` is deprecated
   entirely in favor of the advisor path — decision deferred to Plan).

## Non-capabilities (explicitly not built)

- No automated content merge/patch for existing files — MODIFY is always a
  human-approved task, never an automatic edit.
- No new user-facing command — the gap scan runs as part of the advisor's
  existing plan-generation flow, not a separate invocation.
- No template versioning UI — parity is enforced at build time only; there
  is no runtime "check for template updates" feature.
