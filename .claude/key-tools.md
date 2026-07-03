# Key Tools

Toolchain for authoring, validating, and distributing the `src/` deliverables.
Excludes the four core `ts-*` skills (they are the product — see `../CLAUDE.md` → End-User Workflow)
and the base stack (tsc/vitest/eslint — see `../CLAUDE.md` → Commands).

| Tool Name | Summary | Type | URL | Best Scope |
|---|---|---|---|---|
| `spectra` | Spec-driven development CLI. Manages change proposals and capability specs in `openspec/`; drives the discuss→propose→apply→archive workflow via `/spectra-*` skills. Single source of truth for what's being built and why. | Command (CLI) | <https://github.com/spectra-app/spectra> | Project |
| `skill-validator` | Validates `src/skills/*` before release: SKILL.md structure, frontmatter, orphan files (reachability graph), token budgets, contamination. Known gap: misses prose/backtick refs to missing files — only checks markdown-link syntax. See `tasks/skill-validator-todo.md`. | Command (CLI, Go) | <https://github.com/agent-ecosystem/skill-validator> | Project |
| `code-review-graph` | Knowledge graph over this repo's code. Callers, dependents, impact radius, risk-scored change detection. Use BEFORE Grep/Glob/Read when exploring — cheaper and structurally aware. Auto-updates via PostToolUse hooks. | MCP Server | <https://www.npmjs.com/package/@tirth8205/code-review-graph> | Project |
| `npm run release` | Regenerates `scripts/release-manifest.json` from `src/`, then packages skills/hooks/commands/scaffold into `dist/release.zip` with the shared exclusion filter (`scripts/lib/exclusions.mjs`). Fails on missing SKILL.md. | Script | `scripts/build-release.mjs` | Project |
| `npm run dogfood` | Manifest-driven mirror sync `src/` → this repo's `.claude/`, delete-before-copy, with ring0 safety checks and `--rollback`. Keeps dev environment identical to what end users install. Does NOT prune directories absent from manifest. | Script | `scripts/dogfood.mjs` | Project |
| `install.sh` / `install.ps1` | End-user installers: download `release.zip` from GitHub Releases, copy skills/hooks/commands, patch `settings.json` with pinned interpreter paths (v0.1.5 fix — never bare `python3`). | Script | `release/` | User |
| `gh` | GitHub CLI. Cuts releases (`gh release create` with three assets), inspects PRs/repos. Auth lives at machine level. | Command (CLI) | <https://cli.github.com> | User |
| `inject-workflow-state.sh` | UserPromptSubmit hook injecting `[WORKFLOW STATE]` + `[NEXT]` every turn so ts-orchestrate reads state without re-reading files. | Hook | `src/hook/` | Project |
| `caveman` | Token-compression plugin (~75% output reduction, technical substance preserved). Active in this repo's dev sessions; not part of the deliverable. | Plugin | <https://github.com/JuliusBrussee/caveman> | User |

**Scope column**: where the tool is installed/configured — `User` (machine-level: `~/.claude`, global binary, plugin) vs `Project` (repo-local: `.claude/settings.json`, npm scripts, `openspec/`).
