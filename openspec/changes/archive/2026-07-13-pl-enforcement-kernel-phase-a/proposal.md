## Why

PLDD needs an executable foundation before cards, agents, templates, or production-line state can depend on it. Phase A must prove architecture and contract checks through portable commands while leaving the current dual-track workflow and root configuration unchanged; `scripts/release-manifest.json` is the sole non-`src/*` packaging exception.

## What Changes

- Add a self-contained Node enforcement kernel under `src/*` that validates layer placement and forbidden imports from a project-owned layer manifest.
- Define an explicit zero-dependency parser subset for TypeScript/JavaScript imports; unsupported syntax fails closed with a stable diagnostic.
- Add stable machine-readable diagnostics and decisive exit codes for later Codex and Claude Code adapters.
- Add contract identifiers and an identity-based checker pairing contract declarations with named violation tests.
- Add deterministic scenario compilation from additive `ownership_relations_v1`, plus optional completed OpenSpec scenario coverage checking, while preserving legacy Discovery string arrays.
- Add isolated fixture-driven tests, including planted architecture, contract, relation, and parser failures.
- Register the host-neutral `ts-pl` skill in the release manifest for packaging only; do not add hooks, router entries, live registry entries, or dogfood activation.

## Non-Goals

- No consumer scaffold templates, dependency-cruiser/ESLint adapters, role-card agents, prompt templates, or Build station checklist; Phase B owns them.
- No root `package.json`, lockfile, live `.agents/*`, hooks, router, live registry, or project-configuration changes beyond the packaging-only `scripts/release-manifest.json` entry.
- No PLDD activation against `agenticToolset`; Dogfood Activation requires separate later approval.
- No persistent production-line state.

## Capabilities

### New Capabilities

- `pl-enforcement-kernel`: Portable, zero-new-dependency architecture, contract, and scenario enforcement for end-user TypeScript/JavaScript projects.

### Modified Capabilities

(none)

## Impact

- Affected specs: pl-enforcement-kernel
- Affected code:
  - New: src/scripts/pl-arch-check.mjs
  - New: src/scripts/pl-contract-check.mjs
  - New: src/scripts/gen-scenarios.mjs
  - New: src/utils/contracts.ts
  - New: src/skills/ts-pl/SKILL.md
  - New: src/skills/ts-pl/SKILL_caveman.md
  - New: src/skills/ts-pl/references/layers-map.md
  - New: src/skills/ts-pl/references/contracts.md
  - New: src/skills/ts-pl/references/scenario-compile.md
  - New: src/tests/unit/pl-arch-check.test.ts
  - New: src/tests/unit/pl-contract-check.test.ts
  - New: src/tests/unit/gen-scenarios.test.ts
  - New: src/tests/fixtures/pl-sample-app/
  - Modified: scripts/release-manifest.json (packaging registration only)
- Dependencies: no new npm dependencies
- Workflow configuration: unchanged
- Activation: none; all checks run directly against isolated fixtures

