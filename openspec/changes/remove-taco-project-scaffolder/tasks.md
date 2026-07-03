## 1. Remove the skill source

- [x] 1.1 Delete src/skills/taco-project-scaffolder/ so the deliverable tree contains exactly one scaffolder skill. Verify: ls src/skills/ lists ts-project-scaffolder but no taco-project-scaffolder, and git status shows the deletion staged.

## 2. Propagate through tooling

- [x] 2.1 Regenerate the release manifest so no packaging entry references the deleted source: run node scripts/generate-manifest.mjs. Verify: grep taco scripts/release-manifest.json returns no matches, and node scripts/build-release.mjs exits zero with no SKIP (missing) warning for taco.
- [x] 2.2 Prune the dogfood mirror copy at .claude/skills/taco-project-scaffolder/: run npm run dogfood and check whether the directory is gone; if the sync does not prune directories absent from the manifest, remove it explicitly (git rm -r if git ls-files reports it tracked, plain rm -r otherwise). Verify: .claude/skills/ contains no taco-project-scaffolder directory and git status is clean of unexpected leftovers.

## 3. Amend the open skill-reference-validation-gate change

- [x] 3.1 Remove taco-project-scaffolder mentions from openspec/changes/skill-reference-validation-gate/proposal.md (Why paragraph, prerequisite-fixes bullet, Impact Modified list) so the gate change's scope matches a tree where taco no longer exists. Verify: grep taco on that file returns no matches and spectra validate skill-reference-validation-gate passes.
- [x] 3.2 Restore the completion requirement in openspec/changes/skill-reference-validation-gate/specs/skill-reference-validation/spec.md and the prerequisite task 1.3 in its tasks.md to single-scaffolder wording (only ts-project-scaffolder SHALL NOT reference scripts/setup-layout.sh). Verify: grep taco across the skill-reference-validation-gate change directory returns no matches and spectra validate skill-reference-validation-gate passes.

## 4. Regression check

- [x] 4.1 Confirm removal breaks nothing: npm run type-check, npm test, and node scripts/build-release.mjs all exit zero, and unzip -l dist/release.zip lists no taco-project-scaffolder entries. Verify: command exit codes and zip listing.
