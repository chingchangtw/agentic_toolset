# src/skills/* reference audit — findings report

## Context
Review of `src/skills/*` for broken references (SKILL.md pointing at files
that don't exist) and orphaned files (files that exist but nothing links to
them). Report-only pass — no fixes applied. Two follow-up scoping questions
(staging-copy cleanup, missing-script handling) were deferred by the user for
manual review.

## Findings by skill

### `ondemand/ts-project-init-advisor/`
- Broken references: none.
- Orphaned: `references/project-init-advisor-PRD.md` — exists, never mentioned in SKILL.md.

### `taco-project-scaffolder/`
- Broken reference: SKILL.md:33 points at `scripts/setup-layout.sh` — file does not exist anywhere in the repo.
- SKILL.md is truncated mid-sentence at line 33 ("note that prot...").
- No orphaned files (dir only contains SKILL.md).

### `ts-acpl/`
- Broken references (7 occurrences): SKILL.md consistently writes `references/*.md` (plural) but the actual directory on disk is `reference/` (singular) — `patterns.md`, `problem-frame-map.md`, `mutation-guide.md` all affected. Content exists, path in prose is wrong.
- Orphaned: `.DS_Store` (macOS artifact, harmless).

### `ts-deliver-router/`
- Broken reference: SKILL.md:16 says `reference/on-first-use.md` (singular, missing "s") — actual file is `references/on-first-use.md`, which is correctly referenced elsewhere in the same SKILL.md (line 53 LOAD INDEX).
- Orphaned files: `references/registry-lean.md`, `README.md`, `PROJECT_SETUP.md`, `ideas/DISCUSSION_code_graph_registry.md`, `ideas/initIdeas.md`, `SKILL_caveman.md`, `SKILL.original.md`, and the entire `rawfiles/` subtree (20 files — a full parallel copy of `references/` + `registry/` + `SKILL.md`, unlinked from the canonical SKILL.md).

### `ts-orchestrate/`
- No broken references.
- Borderline/orphaned: `commands/next.md`, `commands/start.md`, `commands/status.md` — never referenced by literal path in SKILL.md, only implied via slash-command names (`/ts-orchestrate:start` etc.). Likely an implicit runtime convention, not a real gap.

### `ts-project-planner/`
- No broken references (all 10 `references/*.md` links resolve).
- Orphaned: `README.md` (skill-root, unreferenced) and the entire `raw/` subtree (9 files — parallel staging copy of `references/` + `SKILL.md`, unlinked).

### `ts-project-scaffolder/`
- Same defect as `taco-project-scaffolder/`: broken `scripts/setup-layout.sh` reference (SKILL.md:33) and identical mid-sentence truncation. The two SKILL.md files are byte-for-byte duplicates.

## Cross-cutting observations
- `taco-project-scaffolder` and `ts-project-scaffolder` ship the exact same broken/truncated SKILL.md — one defect, two locations.
- `ts-acpl`'s `reference/` vs `references/` mismatch is the same class of bug as the earlier `.ai/`→`.agents/` stale-path issue: prose that no longer matches what's on disk.
- `ts-deliver-router/rawfiles/` and `ts-project-planner/raw/` are the largest source of orphaned files — full duplicate reference sets shipped into `release.zip` with nothing pointing at them.

## Deferred decisions (for manual review)
- Whether to delete `ts-deliver-router/rawfiles/` and `ts-project-planner/raw/` (staging copies) or keep them.
- Whether to remove the dangling `scripts/setup-layout.sh` reference in the two scaffolder skills, or actually create the script.
