# Source Code Directory

## Structure

- **skills/** — Agent skill implementations. Each skill is self-contained with its own logic, types, and tests.
- **plugins/** — Plugin modules that extend functionality. Plugins can hook into various lifecycle events.
- **mcp/** — MCP (Model Context Protocol) server implementations and artifacts.
- **core/** — Core framework code, base classes, interfaces, and common utilities.
- **utils/** — Reusable helper functions and utility modules.
- **types/** — TypeScript type definitions, interfaces, and constants.

## Development Guidelines

- Each skill/plugin should be independently deployable.
- Export types alongside implementations for better IDE support.
- Use path aliases (@skills/*, @plugins/*, @mcp/*, @utils/*, @types/*) for imports.
