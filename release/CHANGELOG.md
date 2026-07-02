# Changelog

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
