# Changelog

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
