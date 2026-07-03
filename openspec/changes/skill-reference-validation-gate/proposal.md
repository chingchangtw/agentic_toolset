## Why

The release build validates only that each skill has a SKILL.md — it never checks that paths referenced *inside* SKILL.md resolve on disk. Three broken-reference defects shipped in every release to date without detection: ts-acpl's SKILL.md points at `references/` (plural) while the directory on disk is `reference/` (singular, 7 occurrences), ts-deliver-router's SKILL.md line 16 points at `reference/on-first-use.md` (file lives at `references/on-first-use.md`), and ts-project-scaffolder's SKILL.md instructs running `scripts/setup-layout.sh`, which does not exist anywhere in the repository. End users receive skills whose instructions reference missing files, and the model executing the skill silently fails or improvises. The audit that found these is recorded in tasks/src-skills-reference-audit.md.

## What Changes

- New validation module `scripts/lib/validate-refs.mjs`: given a skill directory, extracts skill-local relative file references from its SKILL.md and returns a list of references that do not resolve to an existing file.
- `scripts/build-release.mjs` calls this validator for every manifest skill entry before zipping, and exits non-zero listing every broken reference (skill name, referenced path) when any is found. Same failure pattern as the existing missing-SKILL.md check.
- References that point into packaging-excluded directories (per `scripts/lib/exclusions.mjs`: rawfiles, raw, ideas, registry, node_modules) are also reported as errors, because those paths never ship even when they exist locally. Exception: `registry/` is excluded from packaging but IS referenced legitimately by ts-deliver-router's SKILL.md load index — the validator resolves existence against the source tree, and only the four never-shipped directories (rawfiles, raw, ideas, node_modules) are treated as reference errors.
- Prerequisite fixes so the gate lands green (path-only corrections, no content rewrites):
  - Rename directory src/skills/ts-acpl/reference to src/skills/ts-acpl/references (matches the plural convention used by every other skill).
  - Correct the single-occurrence typo in src/skills/ts-deliver-router/SKILL.md line 16 from reference/on-first-use.md to references/on-first-use.md.
  - Remove the sentence referencing the nonexistent scripts/setup-layout.sh from src/skills/ts-project-scaffolder/SKILL.md, replacing it with an instruction to create the directories directly as agent actions.

## Non-Goals

- No fix for the mid-sentence truncation at the end of ts-project-scaffolder/SKILL.md beyond completing the one sentence the setup-layout.sh removal touches — a content rewrite of that skill is separate work.
- No changes to .claude/skills/ or .github/skills/ mirror copies — dogfood sync (npm run dogfood) propagates src changes to .claude/; the .github/skills drift question is explicitly deferred.
- No orphaned-file detection (files on disk never referenced by SKILL.md) — the gate only checks the reverse direction (referenced but missing). Orphan cleanup is covered by the existing packaging exclusion filter.
- No validation of references inside non-SKILL.md files (references/*.md cross-links) — first iteration validates the entry-point contract only.
- Rejected: warn-only mode. A warning in build output was already effectively available (the defects were visible in the zip listing) and was never noticed. The gate must fail the build to work.
- Rejected: allowlist for known-broken references. Leaves defects shipping indefinitely; the three current violations are trivially fixable in this change.

## Capabilities

### New Capabilities

- `skill-reference-validation`: build-time gate ensuring every skill-local relative file reference in each packaged SKILL.md resolves to an existing file that will be present in the shipped package.

### Modified Capabilities

(none — release-encapsulation and release-manifest requirements are unchanged; the gate is additive and runs before packaging)

## Impact

- Affected specs: new `skill-reference-validation` capability spec.
- Affected code:
  - New: scripts/lib/validate-refs.mjs, tests/unit/validate-refs.test.ts
  - Modified: scripts/build-release.mjs, src/skills/ts-deliver-router/SKILL.md, src/skills/ts-project-scaffolder/SKILL.md
  - Renamed: src/skills/ts-acpl/reference/ directory becomes src/skills/ts-acpl/references/ (three files move with it)
  - Removed: (none)
