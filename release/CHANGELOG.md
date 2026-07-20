# Changelog

## v0.1.8 — Dual-track orchestration, PLDD reflect-close, command frontmatter

- feat(agents): ship `ts-event-storming-facilitator` and `ts-ddd-tactical-validator` as sub-agents (`src/agents/`), packaged via a new `agents[]` release-manifest category, installed to `<project>/.claude/agents/` by both installers
- feat(routing): add `feature`/`hotfix`/`chore`/`patch`/`spike`/`ops` work-type phase spines to `phase-routing.ts`, alongside existing `bugfix`/`refactor`/`epic`
- feat(ts-orchestrate): SKILL.md gets a Workflow Routing table (9 end-user work types, both tracks named inline) and a Workflow Guidance table (per-state guidance, both tracks)
- feat(hook): `inject-workflow-state.sh` now emits Discovery-track `[NEXT]` guidance (focus-idea priority: validating > exploring > idea > ready)
- feat(commands): add YAML frontmatter `description` to all `ts-deliver`/`ts-discover`/`ts-iteration`/`ts-project` command stubs so sub-commands show meaningful text in `/help` and command pickers
- docs(planner): wire the two new sub-agents into `/ts-discover explore|validate|decide` gates; slim planner's Workflow Routing section to point at ts-orchestrate as canonical
- docs: require `jq` for `.json`/`.jsonl` content instead of grep/cat/sed — text match breaks on nested/multi-line JSON and false-positives on substrings; scoped to `.agents/*.json*` state files
- test: add spine-consistency test asserting `phase-routing.ts` and `work-unit-profiles.md` stay in lockstep for the 6 new work types
- fix(hook-tests): `.ai` → `.agents` fixture paths (pre-existing test breakage, unrelated to `.agents/` rename already shipped)
- fix(pilot): assert `manifest.agents` entries land on disk post-install (was previously unchecked)
- fix(hook): `inject-workflow-state.sh` Ship-gate check read `gates["sec-review"]` but `state.json` keys the gate `G2` — the `[BLOCKED]` check was dead code, never fired against real state
- fix(hook): `reflect` `[NEXT]` guidance didn't branch on `spike` work type despite `SKILL.md` documenting the clause — hook never read `epic.type`
- fix(hook): `ts-session-guard.py`/`.ps1` counted messages by checking `entry.type == "message"`, a value that never occurs in real transcripts (`user`/`assistant` only) — the TURNS warning never fired in either port
- fix(docs): README cheat-sheet link pointed at stale `docs/solution_cheat_sheet.html`, now `docs/dual-track-workflow.html`
- refactor(hook): restructure `inject-workflow-state.sh` as a direct transcription of `SKILL.md`'s Workflow Guidance table — named guard functions, flat per-track case tables, one case arm per table row; byte-identical output, 24 existing tests unedited
- chore(ts-deliver): close reflect phase for EPIC-PLDD-CONSUMER-ADAPTERS — router transitions reflect → idle; retro adds a `cli-mutation-coverage` rec row to `registry-build.md`
- docs(user-guide): bump `USER_GUIDE.md` version badge and changelog to v0.1.8

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
