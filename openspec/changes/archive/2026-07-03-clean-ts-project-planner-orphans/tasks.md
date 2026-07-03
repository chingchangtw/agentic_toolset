> **Applied retroactively** — this change was archived unimplemented, then
> the described work landed outside the normal apply workflow (concurrent
> session), committed as `b2e53a4`. Tasks below verified true against the
> current tree and marked complete after the fact.

## 1. Delete the stale raw/ staging copy

- [x] 1.1 Delete src/skills/ts-project-planner/raw/SKILL.md and the eight files under src/skills/ts-project-planner/raw/references/ (agents.md, commands.md, discovery-kanban.md, discovery-state.md, iteration-schema.md, router-integration.md, work-unit-profiles.md, workspace-spec.md), then remove the now-empty raw/ and raw/references/ directories, so the skill package no longer ships a stale duplicate staging copy. Verify: test -d src/skills/ts-project-planner/raw/ returns false, and ls src/skills/ts-project-planner/ shows references/, SKILL.md only (no raw/).
- [x] 1.2 Confirm the deletion has no build-time side effect: run node scripts/generate-manifest.mjs && node scripts/build-release.mjs and check both exit zero. Verify: command exit codes, and unzip -l dist/release.zip | grep -c "ts-project-planner/raw" returns 0.

## 2. Relocate README.md

- [x] 2.1 Move src/skills/ts-project-planner/README.md to src/skills/ts-project-planner/references/README.md using git mv, so it stops triggering skill-validator's "not needed in a skill" root-file warning. Verify: skill-validator validate structure src/skills/ts-project-planner/ -o json no longer reports a message containing "README.md is not needed in a skill" among its warnings, and the file exists at the new path.
- [x] 2.2 Confirm the move does not change shipping status: run node scripts/build-release.mjs and check that dist/release.zip does NOT contain README.md anywhere under skills/ts-project-planner/ (EXCLUDED_FILES matches by basename regardless of directory). Verify: unzip -l dist/release.zip | grep -i "ts-project-planner.*README" returns no matches.

## 3. Regression check

- [x] 3.1 Confirm the skill still functions end to end after both changes: npm run type-check, npm run dogfood, and node scripts/build-release.mjs all exit zero, and skill-validator check src/skills/ts-project-planner/ shows zero errors with the raw/ unknown-directory and README.md unnecessary-file warnings gone from its output. Verify: command exit codes and the specific warning messages absent from skill-validator's JSON output.
