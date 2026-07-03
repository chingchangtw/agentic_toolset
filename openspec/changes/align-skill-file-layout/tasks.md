## 1. Registry relocation (fixes the packaging gap)

- [x] 1.1 Move all nine files from src/skills/ts-deliver-router/registry/ into src/skills/ts-deliver-router/references/ using git mv per file, preserving filenames, so registry content joins the directory category that actually ships in release builds. Verify: ls src/skills/ts-deliver-router/references/ lists all nine registry-*.md filenames, and ls src/skills/ts-deliver-router/registry/ fails with "No such file or directory" after the directory is removed.
- [x] 1.2 Delete the now-empty src/skills/ts-deliver-router/registry/ directory. Verify: test -d src/skills/ts-deliver-router/registry/ returns false.
- [x] 1.3 Update the four registry/ path mentions in src/skills/ts-deliver-router/SKILL.md (the two LOAD INDEX table rows referencing registry/registry-index.md and registry/registry-<P>.md, plus the routing-logic line "DIAL + types + recipe → registry/registry-index.md. Rows → registry/registry-<phase>.md.") to reference references/ instead, so the skill's own instructions match the new file locations. Verify: grep -c "registry/" src/skills/ts-deliver-router/SKILL.md returns 0, and grep -c "references/registry-" src/skills/ts-deliver-router/SKILL.md returns 4.
- [x] 1.4 Confirm the packaging behavior change is real: run node scripts/build-release.mjs and verify the resulting dist/release.zip contains the nine registry-*.md files under skills/ts-deliver-router/references/ (they were previously absent under skills/ts-deliver-router/registry/ because registry is in EXCLUDED_DIRS). Verify: unzip -l dist/release.zip | grep registry lists all nine files under the references/ path.

## 2. README relocation

- [x] 2.1 Move src/skills/ts-deliver-router/README.md to src/skills/ts-deliver-router/references/README.md using git mv, so it stops triggering skill-validator's "unexpected file at root" warning. Verify: skill-validator validate structure src/skills/ts-deliver-router/ -o json (or equivalent check command) no longer reports "unexpected file at root: README.md" among its warnings, and the file exists at the new path.
- [x] 2.2 Confirm the move does not change shipping status: run node scripts/build-release.mjs and check that dist/release.zip does NOT contain README.md anywhere under skills/ts-deliver-router/ (EXCLUDED_FILES matches by basename regardless of directory). Verify: unzip -l dist/release.zip | grep -i "ts-deliver-router.*README" returns no matches.

## 3. PROJECT_SETUP.md consolidation into ts-project-init-advisor

- [x] 3.1 Add a new "## ts-deliver-router CLAUDE.md Template" section to src/skills/ondemand/ts-project-init-advisor/SKILL.md, placed immediately before the existing "## Reference Files" section, containing the full markdown code block content of src/skills/ts-deliver-router/PROJECT_SETUP.md verbatim (the "## ts-deliver-router — Project Instructions" block covering Workflow Hub, Core 4, Agents, Required External Dependencies, Build Phase — ACPL Code Generation Rules, Discovery Feedback Hook, Security Gates, Plugin Stack, MCPs Active, Harvested Skills, Sub-Agents, Commands, and Design Principles), so ts-project-init-advisor becomes the single source for this setup template. Verify: grep -A2 "ts-deliver-router CLAUDE.md Template" src/skills/ondemand/ts-project-init-advisor/SKILL.md finds the new section, and diffing the copied code block content against the original PROJECT_SETUP.md content (excluding the PROJECT_SETUP.md-specific preamble sentence) shows no textual differences.
- [x] 3.2 Delete src/skills/ts-deliver-router/PROJECT_SETUP.md now that its content lives in ts-project-init-advisor/SKILL.md. Verify: test -f src/skills/ts-deliver-router/PROJECT_SETUP.md returns false, and grep -rn "PROJECT_SETUP" src/ scripts/ returns no matches (confirms no dangling reference existed or remains).

## 4. Dead backup file removal

- [x] 4.1 Delete src/skills/ts-deliver-router/SKILL.original.md and src/skills/ts-deliver-router/SKILL_caveman.md, since neither is referenced by SKILL.md or any script and both are already excluded from every release build. Verify: ls src/skills/ts-deliver-router/ shows neither file, and node scripts/build-release.mjs still exits zero (confirms no build step depended on their presence).

## 5. Regression check

- [x] 5.1 Confirm the full skill still functions end to end after all relocations: node scripts/type-check equivalent (npm run type-check), npm run dogfood, and node scripts/build-release.mjs all exit zero, and skill-validator check src/skills/ts-deliver-router/ shows zero errors with the registry/, PROJECT_SETUP.md, SKILL.original.md, and SKILL_caveman.md warnings gone from its output compared to a pre-change baseline run. Verify: command exit codes and diffed skill-validator warning list (before vs. after).
