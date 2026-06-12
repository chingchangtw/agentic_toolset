---
name: taco-project-scaffolder
description: "Scaffold a new project with Tony's architecture and conventions."
compatibility: Requires spectra CLI.
metadata:
  author: Taco
  version: "1.0"
  generatedBy: "Taco"
---
## Purpose
Builds a modern, production-ready AI coding workspace layout as defined in the project architecture standards.

## Core Directives
1. **Protected Files Policy**: 
   - NEVER overwrite or modify existing `CLAUDE.md`, `.claude/CLAUDE.md`, or `AGENTS.md` files during a standard scaffolding run.
   - If these files are missing during a fresh initialization, prompt the user for permission to create them *once*. Otherwise, ignore them to preserve manual edits.

2. **Structure Generation**:
   Create the following directory hierarchy based on the standard project tree:
   - **.claude/**: Setup `commands/`, `skills/`, `agents/`, and `plugins/` subdirectories. [1]
   - **.ai/**: Create `logs/`, `sessions/`, `plans/`, `tasks/` for AI interaction history. [1]
   - **src/**: Initialize `components/`, `services/`, `frontend/`, `backend/`, `scripts/` and any source codes whatever frontend/backend/scripts etc. [1]
   - **Support Folders**: Build `utils/`, `types/`, `tests/` (unit/integration/e2e), `docs/`, and `scripts/`. [1]

3. **Boilerplate Creation**:
   - Generate standard root-level configurations: `package.json`, `tsconfig.json`, `.env.example`, `.gitignore`, `Dockerfile`, and `README.md`. [1]

4. **Verification**:
   - Once the structure is generated, use the `ls -R` or `tree` equivalent to confirm the layout matches the visual standard.

## Operational Workflow
- **Elicitation**: Before building, ask the user for the primary tech stack (e.g., React/Next.js, Python, Node.js).
- **Execution**: Run the `scripts/setup-layout.sh` to create the folders.
- **Reporting**: Provide a summary of created directories and note that prot