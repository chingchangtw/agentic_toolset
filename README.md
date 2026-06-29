# Agentic Toolset

Starter framework for AI-agent-enabled TypeScript projects. Clone it to get `src/skills/`,
`src/plugins/`, and `src/mcp/` pre-wired for Claude Code skill development — with a
built-in Spectra spec-driven development workflow for managing changes as you evolve it.

## What You Get

`src/` contains the deliverable — the skill implementations, plugin modules, and MCP
servers that form the core of your project:

```
src/
├── skills/        # Claude Code skill implementations
├── plugins/       # Plugin modules extending core functionality
├── mcp/           # MCP server implementations
├── core/          # Base classes and framework interfaces
├── utils/         # Helper functions
└── types/         # Shared TypeScript definitions
```

The `.agents/` and `.claude/` directories are this project's own development
environment (ts-deliver-router 7-phase workflow + Spectra SDD + caveman skills).
They're included as a working example of the meta-layer pattern — not part of what
you'd ship to your users.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Type checking**:
   ```bash
   npm run type-check
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Build**:
   ```bash
   npm run build
   ```

## Development

- `npm run dev` — Start development
- `npm run lint` — Run linter
- `npm run lint:fix` — Fix linting issues

## Adding Skills/Plugins

Place skill and plugin implementations in their respective `src/skills/` and `src/plugins/` directories.

For MCP artifacts, use `src/mcp/` with appropriate server implementations.

## Configuration

Copy `.env.example` to `.env` and fill in required values.
