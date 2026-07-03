## ADDED Requirements

### Requirement: Validator extracts skill-local relative file references from SKILL.md

`scripts/lib/validate-refs.mjs` SHALL export a function `findBrokenRefs(skillDir)` that reads `<skillDir>/SKILL.md`, extracts candidate references, and returns an array of `{ ref, reason }` objects for references that do not resolve. A candidate reference is a backtick-quoted token in the SKILL.md body that (a) contains at least one `/`, (b) ends in a file extension of 1-5 alphanumeric characters, (c) does not start with a URL scheme (`http://`, `https://`), `~`, `$`, `/`, `.agents/`, `.claude/`, `.ai/`, or a glob character, and (d) does not contain whitespace. Tokens inside fenced code blocks SHALL be ignored; only inline backtick spans count.

#### Scenario: Broken reference detected

- **WHEN** a SKILL.md contains the inline span referencing `references/patterns.md` and no file exists at `<skillDir>/references/patterns.md`
- **THEN** `findBrokenRefs` returns an entry with `ref: "references/patterns.md"` and `reason: "missing"`

#### Scenario: Valid reference passes

- **WHEN** a SKILL.md references `references/phases.md` and the file exists at `<skillDir>/references/phases.md`
- **THEN** `findBrokenRefs` returns no entry for that reference

#### Scenario: Non-file tokens ignored

- **WHEN** a SKILL.md contains backtick spans for a URL, a workspace runtime path, a glob, or a bare command name
- **THEN** none of them appear in the returned array

##### Example: token classification

| Token | Classified as | Why |
| ----- | ------------- | --- |
| `references/patterns.md` | candidate | relative, has /, has extension |
| `glama.ai/mcp/servers/w1z9fju964` | skipped | no file extension on final segment |
| `.agents/ts-deliver-router/state.json` | skipped | workspace runtime path prefix |
| `https://example.com/a.md` | skipped | URL scheme |
| `scripts/setup-layout.sh` | candidate | relative, has /, has extension |
| `npm run dogfood` | skipped | contains whitespace |
| `references/*.md` | skipped | glob character |

### Requirement: References into never-shipped directories are errors

`findBrokenRefs` SHALL report a reference whose first path segment is one of `rawfiles`, `raw`, `ideas`, or `node_modules` with `reason: "excluded-from-package"`, even when the file exists on disk, because the packaging exclusion filter (`scripts/lib/exclusions.mjs`) removes those directories from every shipped artifact. References whose first segment is `registry` SHALL be validated for existence only, because the ts-deliver-router skill legitimately references registry content that ships via its own manifest handling.

#### Scenario: Reference into rawfiles flagged despite existing

- **WHEN** a SKILL.md references `rawfiles/SKILL.md` and that file exists on disk
- **THEN** `findBrokenRefs` returns an entry with `reason: "excluded-from-package"`

### Requirement: Release build fails on broken references

`scripts/build-release.mjs` SHALL run `findBrokenRefs` for every skill entry in `scripts/release-manifest.json` before creating the zip. When any skill returns a non-empty result, the build SHALL print one line per broken reference in the form `<skill name>: <ref> (<reason>)` and exit with a non-zero status without producing `dist/release.zip`.

#### Scenario: Build blocked by broken reference

- **WHEN** any manifest skill's SKILL.md contains a reference that does not resolve
- **THEN** `node scripts/build-release.mjs` exits non-zero and `dist/release.zip` is not written

#### Scenario: Clean tree builds normally

- **WHEN** every manifest skill's SKILL.md references resolve
- **THEN** `node scripts/build-release.mjs` exits zero and produces `dist/release.zip` exactly as before the gate existed

### Requirement: Source tree passes the gate at change completion

At completion of this change the three known violations SHALL be fixed so the gate passes: the ts-acpl reference directory SHALL be named `references` (plural) matching its SKILL.md, the ts-deliver-router SKILL.md first-use pointer SHALL read `references/on-first-use.md`, and the ts-project-scaffolder SKILL.md SHALL NOT reference `scripts/setup-layout.sh`.

#### Scenario: Full release build green

- **WHEN** `npm run release` executes on the completed change
- **THEN** it exits zero and the build log contains no broken-reference lines
