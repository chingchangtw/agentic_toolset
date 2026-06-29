# Agentic Toolset

A distribution framework for Claude Code skills, hooks, and project scaffold templates. Build reusable AI agent components and ship them to developer machines via a GitHub Releases installer.

![version](https://img.shields.io/badge/version-0.1.1-blue)
![license](https://img.shields.io/badge/license-MIT-green)

---

## Overview

Agentic Toolset has two concerns:

1. **Authoring** — develop and maintain skills, hooks, and scaffold templates in `src/`
2. **Distribution** — package and publish artifacts via `scripts/build-release.mjs` and GitHub Releases

There is no runtime server. Everything runs locally inside the user's Claude Code session.

→ **End-user workflow guide:** [`USER_GUIDE.md`](USER_GUIDE.md)

---

## Features

- **5 Claude Code skills** — ts-deliver-router, ts-project-planner, ts-project-scaffolder, ts-acpl, ts-project-init-advisor
- **Session guard hook** — warns when message count or context usage exceeds thresholds
- **Statusline bridge** — displays context percentage in the Claude Code status bar (Python + PowerShell)
- **Project scaffold template** — standard workspace layout copied into new projects at install time
- **Slash-command docs** — reference docs for custom slash commands (e.g., `load-skill`)
- **One-command installer** — bash and PowerShell installers that download, extract, and wire up everything

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Claude Code](https://claude.ai/code) CLI
- Python 3.x (for Linux/macOS hooks)
- PowerShell 7+ / `pwsh` (for Windows hooks)

For release publishing:
- [GitHub CLI](https://cli.github.com/) (`gh`)

---

## Installation

### End-user install (from GitHub Releases)

**Windows (PowerShell):**
```powershell
irm https://github.com/chingchangtw/agentic_toolset/releases/latest/download/install.ps1 | iex
```

**macOS / Linux:**
```bash
curl -fsSL https://github.com/chingchangtw/agentic_toolset/releases/latest/download/install.sh | bash
```

Both installers:
1. Download `release.zip` from GitHub Releases
2. Extract and copy skills → `~/.claude/skills/`
3. Copy hooks → `~/.claude/hooks/`
4. Patch `~/.claude/settings.json` with hook registrations

### Developer setup (from source)

```bash
git clone https://github.com/chingchangtw/agentic_toolset.git
cd agentic_toolset
npm install
```

---

## Usage

### Development commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm test` | Run all tests |
| `npm test -- <path>` | Run a specific test file |
| `npm run test:watch` | Watch mode |
| `npm run lint` | Lint source |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run type-check` | TypeScript type check (run after every code change) |

### Building a release

```bash
node scripts/build-release.mjs
```

Produces `dist/release.zip` bundling skills, hooks, commands, and scaffold template.

### Publishing a release

```bash
git tag vX.Y.Z && git push origin vX.Y.Z
gh release create vX.Y.Z dist/release.zip release/install.sh release/install.ps1 \
  --title "vX.Y.Z" --notes-file release/CHANGELOG.md
```

---

## Project Structure

```
agenticToolset/
├── src/
│   ├── skills/          — Claude Code skill modules
│   ├── hook/            — Hook scripts (UserPromptSubmit + StatusLine)
│   ├── commands/        — Slash-command reference docs
│   ├── scripts/         — PowerShell helper scripts
│   ├── project_root_structure/  — Scaffold template
│   ├── core/            — TypeScript framework base (stub)
│   ├── types/           — Shared TypeScript types (stub)
│   ├── utils/           — Reusable TypeScript helpers (stub)
│   ├── mcp/             — MCP server implementations (stub)
│   └── plugins/         — Plugin modules (stub)
├── scripts/
│   └── build-release.mjs  — Builds dist/release.zip
├── release/
│   ├── install.sh         — Linux/macOS installer
│   ├── install.ps1        — Windows installer
│   └── CHANGELOG.md       — Release notes
├── dist/                  — Build output (gitignored)
├── openspec/              — Spectra change proposals and specs
└── tests/                 — Vitest test suite
```

See `docs/architecture.md` for full architecture, skill catalogue, hook data flow, and build pipeline details.

---

## Configuration

No `.env` required for core functionality. Hook thresholds are configurable at the top of each hook script in `src/hook/`.

> `.env` is gitignored. Copy `.env.example` if it exists, or create `.env` for any local overrides.

---

## Adding Skills

1. Create a directory under `src/skills/<skill-name>/`
2. Add a `SKILL.md` — the prompt loaded by Claude Code when the skill is invoked
3. Skills must be self-contained: no cross-skill imports, no shared state files

The build script validates that every skill directory has a `SKILL.md` and aborts if one is missing.

---

## Contributing

[TODO] Contribution guidelines not yet written. In the meantime:

- Follow existing TypeScript conventions (strict mode, ESM, path aliases)
- Run `npm run type-check` and `npm test` before committing
- One logical change per PR; use Conventional Commits format for commit messages

---

## License

MIT — see [LICENSE](LICENSE) for details.
