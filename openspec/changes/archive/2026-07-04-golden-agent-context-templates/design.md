## Context

ts-project-init-advisor (src/skills/ondemand/ts-project-init-advisor/) generates PROJECT_INIT_PLAN.md for a target project via a four-phase flow (Context Gathering, CLAUDE.md Analysis, Build Recommendation Set, Generate PROJECT_INIT_PLAN.md). This epic adds a fifth concern: recommending five golden agent-context files this repo itself authors in src/project_root_structure/. Two existing mechanisms already touch src/project_root_structure/: scripts/build-release.mjs's scaffold step (cp(scaffoldSrc, scaffoldDest) into dist/release.zip's scaffold/ directory), and release/install.sh's SCAFFOLD=y flag (blind copy-if-absent into the end user's project root when they opt in at install time). This epic adds a third path that the advisor drives from inside its own skill package, independent of whether the user ever ran SCAFFOLD=y.

## Goals / Non-Goals

**Goals:**
- Give the advisor its own canonical copy of the five golden files, packaged inside its skill directory, so recommending them does not depend on the installer's scaffold/ directory being present or SCAFFOLD=y ever having been used.
- Guarantee that copy cannot silently go stale relative to src/project_root_structure/ by the time a release ships.
- Make the MODIFY recommendation mechanically simple and honest: show the human what differs, never guess at semantic intent.

**Non-Goals:**
- Auto-classifying whether a difference between an existing file and the golden version represents intentional customization versus an accidental gap. This epic does not attempt that classification (see Decisions — MODIFY task content).
- Changing what SCAFFOLD=y does. This epic documents how the two paths relate; it does not alter install.sh's existing behavior.
- A live "check upstream for updates" feature at advisor-run time. Parity is a build-time, not runtime, concern.

## Decisions

### D1 — assets/golden/ is git-tracked, not generated fresh on every build

assets/golden/ content is committed to the repository like every other file inside src/skills/ondemand/ts-project-init-advisor/. A developer who edits src/project_root_structure/ runs a sync script to update assets/golden/ and commits both together. This is the only design where "the release build fails if assets/golden/ differs from src/project_root_structure/ sources" is a meaningful, failable gate — if the sync script instead ran unconditionally at every build and overwrote assets/golden/ before packaging, parity would be guaranteed by construction and there would be nothing for a gate to catch. The gate exists specifically to catch the case where src/project_root_structure/ was edited but the developer forgot to run sync and commit the result.

### D2 — sync and parity-check share one comparison function

New module scripts/lib/golden-templates.mjs exports two functions built on the same core comparison: `syncGoldenTemplates()` (copies the 5 files from src/project_root_structure/ into src/skills/ondemand/ts-project-init-advisor/assets/golden/, preserving subpaths, overwriting assets/golden/ unconditionally) and `checkGoldenParity()` (returns an array of {file, reason: "missing"|"content-mismatch"} for any of the 5 files where assets/golden/<relpath> does not byte-match src/project_root_structure/<relpath>, or does not exist). `npm run sync-golden` (new script) calls syncGoldenTemplates() for developer use. scripts/build-release.mjs calls checkGoldenParity() before zipping (not sync) and exits non-zero listing every mismatch when the array is non-empty, mirroring the existing validateSkill() missing-SKILL.md failure pattern already in that file.

### D3 — dotted subpaths are preserved, not flattened

The five golden files map into assets/golden/ preserving their src/project_root_structure/-relative subpath: `CLAUDE.md` → `assets/golden/CLAUDE.md`, `AGENTS.md` → `assets/golden/AGENTS.md`, `.claude/CLAUDE.md` → `assets/golden/.claude/CLAUDE.md`, `.claude/goverance_CLAUDE.md` → `assets/golden/.claude/goverance_CLAUDE.md`, `.github/copilot-instructions.md` → `assets/golden/.github/copilot-instructions.md`. The subpath after `assets/golden/` is the exact target-project-relative path the advisor writes to or diffs against (e.g. `assets/golden/.claude/CLAUDE.md` maps to `<target-project>/.claude/CLAUDE.md`). This makes the mapping self-documenting from the directory structure alone — no separate manifest file is needed to record source-to-target correspondence. cpSync with recursive:true already handles dotfile-prefixed subdirectories correctly (confirmed: scripts/build-release.mjs's existing scaffold step already ships .claude/settings.json this way).

### D4 — MODIFY task content is a mechanical diff, never a semantic merge decision

When a golden file's target already exists and its content differs from the golden version, the advisor emits a PROJECT_INIT_PLAN.md task containing: the file path, a diff between the target's current content and the golden content, and instruction text directing the human to review and manually reconcile — the advisor does not attempt to classify which side of the diff is "customization" versus "gap" and does not propose an auto-merge. This directly resolves the top M-risk carried from Discovery (idea-001: "gap analysis distinguishing intentional user customization from missing golden content") by not attempting that classification at all — the human sees the actual diff and decides, which is strictly safer than a heuristic that could misclassify in either direction. If content is byte-identical, no task is emitted (already-aligned, per capability #3's RecommendationSet state).

**Diff generation mechanism (plan-review finding, resolved):** the advisor is a SKILL.md — agent instructions executed by an end user's own Claude Code session at install time, not compiled Node code running in this repository. No diff library dependency is introduced. The advisor reads both the target file and the packaged `assets/golden/<relpath>` file directly and produces the comparison itself (agent-native file comparison, the same capability the advisor already uses in Phase 1-2 to read a target project's existing files). This was confirmed against the actual state of the repo: `package.json` currently declares zero runtime `dependencies` (only devDependencies for the TS/build toolchain), and no diff-generation code exists anywhere in the codebase — adding one would be this project's first runtime dependency and would introduce a Node-execution step into what is otherwise a pure-prose skill. Rejected: adding the `diff` npm package for deterministic unified-diff formatting — solves a determinism problem that hasn't surfaced yet, at the cost of a new dependency and an added moving part for every end-user install, not just this repository's own build.

### D5 — SCAFFOLD=y coexistence posture

install.sh's SCAFFOLD=y remains unchanged and continues to copy-if-absent the entire src/project_root_structure/ tree (all files, not just the golden 5) into a target project at install time, for users who want the full scaffold immediately without running the advisor. The advisor's golden-file recommendations are additive and idempotent with respect to SCAFFOLD=y: a project that already ran SCAFFOLD=y will have all 5 golden files present, so the advisor's gap-scan naturally falls into the "present, diff" path (D4) rather than direct-create, and if content matches exactly, no task is emitted. No installer code changes; this posture is documented in src/skills/ondemand/ts-project-init-advisor/SKILL.md so future maintainers understand why both paths exist.

## Implementation Contract

**Behavior observed by an end user running the advisor:**
- Running ts-project-init-advisor on a project with none of the 5 golden files present results in PROJECT_INIT_PLAN.md task entries that, when executed, create all 5 files with content byte-identical to this repository's src/project_root_structure/ sources at release time.
- Running the advisor on a project where a golden-file target already exists and matches golden content byte-for-byte results in no task for that file.
- Running the advisor on a project where a golden-file target exists and differs results in exactly one MODIFY task per differing file, containing a unified diff; the advisor process itself never writes to that file.

**Interface / data shape:**
- `scripts/lib/golden-templates.mjs` exports `GOLDEN_FILES: string[]` (the 5 relative subpaths), `syncGoldenTemplates(): void`, `checkGoldenParity(): Array<{file: string, reason: "missing" | "content-mismatch"}>`.
- `npm run sync-golden` → `node scripts/sync-golden-templates.mjs` → calls `syncGoldenTemplates()`.
- `scripts/build-release.mjs` calls `checkGoldenParity()` before the zip step; on non-empty result, prints one line per entry as `golden template drift: <file> (<reason>)` and exits non-zero without writing dist/release.zip.
- Advisor SKILL.md gains a new step in Phase 3/4 (Build Recommendation Set / Generate PROJECT_INIT_PLAN.md) enumerating the 5 golden files, their target-relative paths, and the direct-create-if-absent / diff-task-if-present branching from D2/D4.

**Failure modes:**
- Missing golden file in assets/golden/ (never synced) → checkGoldenParity reports reason "missing"; build fails.
- Golden file present but stale (src/project_root_structure/ edited, sync not re-run) → checkGoldenParity reports reason "content-mismatch"; build fails.
- Target project file unreadable/permission-denied during advisor scan → surfaced to the human as a setup gap, same pattern as other advisor-detected environment issues; not silently skipped.

**Acceptance criteria:**
- `npm run sync-golden` followed by `node scripts/build-release.mjs` exits zero with assets/golden/ matching src/project_root_structure/ sources.
- Reverting one character in a single assets/golden/ file (without re-running sync) makes `node scripts/build-release.mjs` exit non-zero with a `content-mismatch` line naming that exact file.
- `unzip -l dist/release.zip` lists all 5 files under `skills/ondemand/ts-project-init-advisor/assets/golden/`, subpaths preserved.

**Scope boundaries:** in scope — the sync script, the parity gate, the advisor's gap-scan and task-emission logic, the SKILL.md documentation of coexistence posture. Out of scope — any change to install.sh's SCAFFOLD=y implementation, any semantic merge/patch logic, any of the other src/project_root_structure/ files not in the 5-file golden set.

## Risks / Trade-offs

- **Golden set drift between releases is still possible if a maintainer forgets `npm run sync-golden` before committing** — the parity gate catches this at build time (before shipping), not at commit time. A pre-commit hook could catch it earlier; deferred as follow-up, not required for this epic's exit criteria.
- **Diff-only MODIFY tasks put reconciliation work on the human** rather than attempting an automated merge — this is the deliberate trade-off from D4 and the Discovery pivot history; it trades convenience for safety (no risk of the advisor silently discarding intentional customization).
- **assets/golden/ duplicates content already in src/project_root_structure/** within the repository — accepted duplication, same pattern the project already uses for other skill-local reference content; the parity gate is the mechanism that keeps duplication from becoming drift.
