# Changelog

## v0.1.6 — Skill directory hygiene: fix broken references and orphaned files

- fix(skills): rename ts-acpl/reference to references — matches every other skill's plural convention; SKILL.md already pointed at references/*.md, only the directory was out of sync
- refactor(skills): move ts-deliver-router registry/*.md into references/ — registry/ was excluded from every release build, so SKILL.md's own LOAD INDEX table pointed agents at files that were never shipped; now they ship
- refactor(skills): move ts-deliver-router and ts-project-planner README.md into references/ — resolves skill-authoring warnings; shipping status unchanged (README.md is excluded by filename regardless of directory)
- refactor(skills): consolidate ts-deliver-router's PROJECT_SETUP.md into ts-project-init-advisor/SKILL.md as a reusable CLAUDE.md template, then remove the standalone file
- chore(skills): delete dead weight shipped in every prior release — ts-deliver-router/rawfiles/ (20-file duplicate staging copy), SKILL.original.md, SKILL_caveman.md; ts-project-planner/raw/ (9-file stale draft snapshot); orphaned project-init-advisor-PRD.md

## v0.1.5 — Fix broken python3 resolution in install.sh

- fix(install): probe for a working python3 interpreter instead of trusting bare `python3` on PATH — a broken/mismatched-arch interpreter earlier on PATH (e.g. stale x86_64 miniconda under Rosetta) got SIGKILL'd with no diagnostics, surfacing as a silent UserPromptSubmit hook failure in Claude Code
- fix(install): hook idempotency check now matches by script path instead of exact command string, preventing duplicate hook registrations across re-installs

## v0.1.2 — Dual-track orchestration, inject-workflow-state hook, .agents/ workspace

- feat(skill): add ts-orchestrate — dual-track orchestrator, session entry point for all WORK_TYPEs
- feat(hook): add inject-workflow-state.sh — injects [WORKFLOW STATE] + [NEXT] into every prompt turn
- refactor: rename end-user workspace root from .ai/ to .agents/ across all skills, hooks, docs
- refactor(scaffold): rename scaffold/.agent/ to .agents/ for consistency
- docs(readme): rewrite with dual-track model, 4-layer orchestration table, corrected skill count (6)
- fix: add empty export{} to stub modules (src/core, src/types) to fix TS2306 build error

## v0.1.1 — Bugfixes and release pipeline cleanup

- fix(hook): repair ts-statusline bridge silent failures (null context_window, token fallback)
- fix(hook): BOM-free JSON write on Windows (UTF8Encoding without BOM)
- fix(hook): port statusline hooks to PowerShell, fix pipe format
- fix(hook): drop USERPROFILE workaround, use Path.home() consistently
- build: add src/commands/ to release bundle, fix hook filenames in build script
- refactor(release): move install scripts to release/, build output to dist/
- docs: add docs/architecture.md as single source of truth for repo layout and pipeline

## v0.1.0 — Initial release

- Skills: ts-deliver-router, ts-project-planner, ts-project-scaffolder, ts-acpl, ts-project-init-advisor
- Hooks: ts-session-guard, ts-statusline bridge (Python + PowerShell), ts-statusline wrapper
- Scaffold: project root structure template
- Commands: load-skill
- Installers: install.sh (Linux/macOS), install.ps1 (Windows)
