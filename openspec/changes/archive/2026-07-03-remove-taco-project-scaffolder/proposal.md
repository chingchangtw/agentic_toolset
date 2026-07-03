## Summary

Delete the taco-project-scaffolder skill from the deliverable tree — it is a byte-identical duplicate of ts-project-scaffolder (only frontmatter name and description differ) that was never shipped in any published release.

## Motivation

Two copies of the same scaffolder skill inflate the release package, double the maintenance surface (both carry the same dead scripts/setup-layout.sh reference and the same truncated final sentence), and confuse skill routing — Claude Code lists both and neither is distinguishable by behavior. The latest published release (v0.1.5) contains six skills and does not include taco-project-scaffolder, so no installed end user depends on it; removal is free now and gets more expensive after the next release ships it.

## Proposed Solution

Delete the source directory, let the existing tooling propagate the removal: the manifest generator (node scripts/generate-manifest.mjs) drops entries whose source no longer exists, and the dogfood mirror sync (npm run dogfood) uses delete-before-copy semantics against manifest entries. Verify the .claude/skills/taco-project-scaffolder mirror copy is pruned; if the dogfood sync does not prune directories absent from the manifest, remove the mirror copy explicitly (git rm if tracked, plain delete if untracked — commit fce8815 untracked dogfood mirrors, one git ls-files check settles it). Amend the open skill-reference-validation-gate change artifacts (proposal.md, specs/skill-reference-validation/spec.md, tasks.md) to drop their taco-project-scaffolder mentions, since deleting the skill supersedes fixing its dead reference. This change SHALL be applied before skill-reference-validation-gate.

## Non-Goals

- No changes to ts-project-scaffolder — its dead setup-layout.sh reference and truncation are fixed by the skill-reference-validation-gate change, not here.
- No release cut — removal rides along with the next scheduled release.
- No edits to historical records: the archived change 2026-07-03-dogfood-zoning-release-encapsulation and tasks/src-skills-reference-audit.md keep their taco mentions as accurate history.

## Alternatives Considered

- Keep taco as a personalized variant: rejected — the body is byte-identical, so the "variant" is only a name; personalization can be recreated from ts-project-scaffolder if ever actually needed.
- Bundle removal into skill-reference-validation-gate: rejected — mixes deletion with feature work, and both changes would touch the same files; one problem per change.

## Impact

- Affected specs: none — no existing capability spec names taco-project-scaffolder; release-manifest requirements are generator-behavior rules that already handle dropped sources.
- Affected code:
  - Removed: src/skills/taco-project-scaffolder/SKILL.md (and its directory), .claude/skills/taco-project-scaffolder/SKILL.md (mirror copy, via dogfood sync or explicit removal)
  - Modified: scripts/release-manifest.json (regenerated, taco entry dropped), openspec/changes/skill-reference-validation-gate/proposal.md, openspec/changes/skill-reference-validation-gate/specs/skill-reference-validation/spec.md, openspec/changes/skill-reference-validation-gate/tasks.md
  - New: (none)
