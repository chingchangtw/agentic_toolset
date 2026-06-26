---
name: ts-project-scaffolder
description: "Scaffold a new project with architecture and conventions."
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
   - NEVER overwrite or modify existing `CLAUDE.md`, `.claude/CLAUDE.md`, `AGENTS.md`, or `.ai/vision.md` files during a standard scaffolding run.
   - If these files are missing during a fresh initialization, prompt the user for permission to create them *once*. Otherwise, ignore them to preserve manual edits.
   - `.ai/vision.md` is write-once by convention: scaffold it empty on Day 0, never regenerate or overwrite it on a re-run.

2. **Vision Scaffold**:
   - On fresh initialization, create `.ai/vision.md` with this template:
     ```markdown
     # Vision — [Project Name]
     # Write-once. Treat as read-only after G1 sign-off.
     # Complete all sections before Think phase exits.

     ## product_purpose
     <!-- One sentence: what problem does this solve and for whom? -->

     ## definition_of_done
     <!-- Bullet list: observable conditions that confirm the project is complete.
          These become the acceptance targets for G2 and ts-project-planner release_exit_criteria. -->

     ## out_of_scope
     <!-- Explicit list: what this project deliberately does NOT do. -->
     ```
   - ts-deliver-router's `vision-check` gate (`registry-think.md`) blocks G1 if this file is missing or empty.

3. **Structure Generation**:
   Create the following directory hierarchy based on the standard project tree:
   - **.claude/**: Setup `commands/`, `skills/`, `agents/`, and `plugins/` subdirectories. [1]
   - **.ai/**: Create `logs/`, `sessions/`, `plans/`, `tasks/` for AI interaction history. [1]
   - **src/**: Initialize `components/`, `services/`, `frontend/`, `backend/`, `scripts/` and any source codes whatever frontend/backend/scripts etc. [1]
   - **Support Folders**: Build `utils/`, `types/`, `tests/` (unit/integration/e2e), `docs/`, and `scripts/`. [1]

4. **Boilerplate Creation**:
   - Generate standard root-level configurations: `package.json`, `tsconfig.json`, `.env.example`, `.gitignore`, `Dockerfile`, and `README.md`. [1]

5. **Verification**:
   - Once the structure is generated, use the `ls -R` or `tree` equivalent to confirm the layout matches the visual standard.

## Operational Workflow
- **Elicitation**: Before building, ask the user for the primary tech stack (e.g., React/Next.js, Python, Node.js).
- **Execution**: Run the `scripts/setup-layout.sh` to create the folders.
- **Reporting**: Provide a summary of created directories and note that prot