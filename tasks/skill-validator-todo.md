# skill-validator adoption — follow-up

## Context
Investigated github.com/agent-ecosystem/skill-validator (Go CLI, v1.5.6, MIT,
actively maintained) as a replacement for the custom scripts/lib/validate-refs.mjs
module originally specced in the (now-deleted) skill-reference-validation-gate
change. Installed via `go install github.com/agent-ecosystem/skill-validator/cmd/skill-validator@latest`
and ran `skill-validator check src/skills/` against this repo.

## Finding: it does not catch our actual bug class
skill-validator's internal link validation only resolves markdown link syntax
`[text](path)`. Our three known broken-reference bugs (dead
`scripts/setup-layout.sh` in the scaffolder skills, `reference/` vs
`references/` mismatch in ts-acpl, `on-first-use.md` typo in
ts-deliver-router) are all prose/backtick mentions —
`` Run the `scripts/setup-layout.sh` `` — never real markdown links.
Confirmed directly: `skill-validator validate structure src/skills/ts-project-scaffolder/ -o json`
returns `"passed": true, "errors": 0, "warnings": 0"` despite the dead
reference still being present.

## What skill-validator IS good for (confirmed via `check src/skills/`)
- Orphan-file detection via reachability graph (transitive, follows SKILL.md →
  referenced file → its references) — genuinely more sophisticated than
  anything we had planned.
- Non-standard directory warnings — flagged `rawfiles/`, `raw/`, `ideas/`,
  `registry/`, `reference/` (singular) across ts-deliver-router, ts-acpl,
  ts-project-planner.
- Extraneous root file detection — flagged `README.md`, `SKILL.original.md`,
  `SKILL_caveman.md`, `PROJECT_SETUP.md` in ts-deliver-router.
- Frontmatter validation, token budgets, contamination analysis.
- 13 warnings, 0 errors across 5/6 skills scanned (ondemand/ts-project-init-advisor
  wasn't picked up — nested one level deeper under src/skills/ondemand/, needs
  `src/skills/ondemand/` scanned separately or check if the tool supports
  recursive discovery).

## Decision (deferred — not yet implemented)
Chosen direction: restore the custom skill-reference-validation-gate change
(it was deleted in commit 6f46ad0 on this branch — `git revert 6f46ad0` or
recreate from that commit's diff) since it's the only thing that catches the
prose-reference bug class. Adopt skill-validator alongside it, scoped to what
it's actually good at (orphan detection, non-standard directory warnings,
token budgets) rather than as a full replacement.

## Open questions for when this is picked up
- Restore skill-reference-validation-gate change via `git revert 6f46ad0`,
  then continue with `/spectra-apply` from where it left off (0/9 tasks were
  implemented before it was deleted).
- Decide whether skill-validator becomes a pre-commit hook, a CI step, or a
  manual `npm run` script — Go binary dependency in a Node/TS release
  pipeline needs a decision on how it's invoked (vendored binary vs.
  `go install` in CI vs. Homebrew tap).
- Decide whether to reorganize skill directories to match skill-validator's
  recognized structure (`scripts/`, `references/`, `assets/`) to silence the
  non-standard-directory warnings for `registry/`, `rawfiles/`, `raw/`,
  `ideas/`, `reference/` — or use `--allow-dirs` to suppress them, or ignore.
- The extraneous-file warnings (README.md, SKILL.original.md, SKILL_caveman.md,
  PROJECT_SETUP.md, ideas/) overlap with the packaging exclusion filter in
  scripts/lib/exclusions.mjs — worth checking whether skill-validator's checks
  make that filter redundant, or whether they serve different purposes
  (dev-time warning vs. build-time packaging exclusion).