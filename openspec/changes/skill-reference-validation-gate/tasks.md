## 1. Prerequisite path fixes (make the source tree gate-clean)

- [ ] 1.1 Rename directory src/skills/ts-acpl/reference to src/skills/ts-acpl/references using git mv so history follows, delivering the contract that every path written in ts-acpl SKILL.md resolves on disk. Verify: run a shell check that each of the three files patterns.md, problem-frame-map.md, mutation-guide.md exists under src/skills/ts-acpl/references/, and grep confirms SKILL.md contains no remaining singular-form references.
- [ ] 1.2 Correct the first-use pointer in src/skills/ts-deliver-router/SKILL.md so line-16 prose reads references/on-first-use.md (plural), delivering a SKILL.md whose every inline path reference resolves. Verify: grep for "reference/on-first-use" (singular) in that file returns no matches, and the file at src/skills/ts-deliver-router/references/on-first-use.md exists.
- [ ] 1.3 Remove the instruction referencing the nonexistent scripts/setup-layout.sh from src/skills/ts-project-scaffolder/SKILL.md, replacing the Execution bullet with an instruction to create the Core Directives directory hierarchy directly as agent actions, and complete the truncated final sentence of the file ("note that prot...") so the document ends cleanly. Verify: grep for "setup-layout" in src/skills/ returns no matches, and manual read confirms the file's final sentence is complete.

## 2. Validator module

- [ ] 2.1 Implement scripts/lib/validate-refs.mjs exporting findBrokenRefs(skillDir), satisfying requirement "Validator extracts skill-local relative file references from SKILL.md": inline-backtick tokens with a slash and a 1-5 char alphanumeric file extension are candidates; tokens with URL schemes, leading ~ $ / .agents/ .claude/ .ai/, glob characters, or whitespace are skipped; fenced code blocks are ignored; unresolved candidates return { ref, reason: "missing" }. Verify: unit test file tests/unit/validate-refs.test.ts covers each row of the token-classification example table from the spec and passes via npm test -- tests/unit/validate-refs.test.ts.
- [ ] 2.2 Implement the never-shipped-directory rule in findBrokenRefs, satisfying requirement "References into never-shipped directories are errors": refs whose first segment is rawfiles, raw, ideas, or node_modules return reason "excluded-from-package" even when the target exists; refs whose first segment is registry are existence-checked only. Verify: unit tests in tests/unit/validate-refs.test.ts assert both behaviors (rawfiles ref flagged despite existing fixture; registry ref passes when fixture exists) and pass.

## 3. Build integration

- [ ] 3.1 Wire findBrokenRefs into scripts/build-release.mjs before zip creation, satisfying requirement "Release build fails on broken references": every manifest skill is validated, each broken ref prints one line as "<skill name>: <ref> (<reason>)", and the process exits non-zero without writing dist/release.zip when any ref is broken. Verify: temporarily inject a bogus ref into a scratch copy test (unit or manual), confirm non-zero exit and absent zip, then confirm reverted state builds green.
- [ ] 3.2 Prove the completed tree satisfies requirement "Source tree passes the gate at change completion": full pipeline runs clean end to end. Verify: npm run release exits zero, build log contains no broken-reference lines, and unzip -l dist/release.zip shows references/ (plural) paths for ts-acpl and no rawfiles/ entries.

## 4. Regression safety

- [ ] 4.1 Confirm the gate does not alter packaged content for already-clean skills: byte-compare the zip entry list before and after the gate commit for all skills except ts-acpl (whose rename is intentional). Verify: unzip -l listings diff shows only the ts-acpl reference-to-references path changes and no other additions or removals.
- [ ] 4.2 Run existing checks to confirm no collateral damage: npm run type-check and npm test both exit zero on the completed change. Verify: command exit codes.
