# Agentic Toolset

A development framework for building and hosting AI agent skills, plugins, and MCP (Model Context Protocol) artifacts.

## Project Structure

```
src/
├── skills/        # Agent skills implementations
├── plugins/       # Plugin modules
├── mcp/          # MCP server implementations
├── core/         # Core utilities and framework
├── utils/        # Helper functions
└── types/        # TypeScript type definitions

tests/
├── unit/         # Unit tests
└── integration/  # Integration tests

.claude/         # Agent workflow configuration
.ai/            # AI interaction history and logs
docs/           # Documentation
scripts/        # Build and utility scripts
```

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
