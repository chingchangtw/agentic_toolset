# Think — Framing: EPIC-GOLDEN-TEMPLATES

## Problem

`ts-project-init-advisor` generates `PROJECT_INIT_PLAN.md` to set up Claude Code
for a target project, but has no concept of the maintainer's own five
agent-context files (`CLAUDE.md`, `AGENTS.md`, `.claude/CLAUDE.md`,
`.claude/goverance_CLAUDE.md`, `.github/copilot-instructions.md`, authored in
`src/project_root_structure/`). Today these only reach an end user via
`install.sh SCAFFOLD=y`, a blind copy-if-absent that most users never invoke
and that has no MODIFY path for projects that already have partial context
files.

## Why now

Three pivots this session (copy/merge → recommend-only → recommend
ADD-or-MODIFY with a direct-create carve-out) converged on a design with
almost no H-risk left: absent files are safe to create directly (nothing to
clobber), and existing files only ever get a recommendation, never a write.
The remaining open question is delivery mechanism, which the user resolved
today: golden templates ship inside the advisor skill package
(`assets/golden/`), synced at build time from `src/project_root_structure/`,
with a parity gate that fails the release build on drift.

## Problem Frame classification

**Information Display + Commanded Behaviour** (per Discovery
`exploration_output.acpl_pattern_group`, idea-001):
- Information Display: scanning the target project and reporting
  gaps/deviations against the golden set.
- Commanded Behaviour: the two write paths — direct-create (absent files,
  unconditional once the guard passes) and MODIFY-task emission (existing
  files, always human-approved via `PROJECT_INIT_PLAN.md` task execution).

No Workpiece frame applies — the advisor never edits an existing file's
content in place; it either creates whole or recommends a task a human
approves and something else (the human, or a future task executor) applies.

## Scope boundary

**In scope:** golden template packaging (build-time sync + parity gate),
advisor-side gap detection, direct-create for absent files, MODIFY-task
emission for existing files.

**Out of scope** (per `plan.json` epic notes and Discovery Non-Goals):
merge/patch logic that edits an existing file's content automatically;
changes to `install.sh SCAFFOLD=y` beyond documenting its coexistence
posture; any change to the four other `src/project_root_structure/` files
not in the golden set (`.claude/settings.json`, `settings.local.json`,
`docs/`, `tasks/`, the stack-specific `.github/*.instructions.md` stubs).
