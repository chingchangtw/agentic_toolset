## Why

Phase A proves deterministic kernel behavior, but Codex and Claude Code adapters still lack an executable cross-host conformance contract. Without shared fixture execution, host-specific commands can duplicate rules and drift in rule ids, normalized diagnostics, or exit codes.

## What Changes

- Add inactive Codex and Claude Code adapter templates that invoke one portable PLDD kernel and contain only invocation and display behavior.
- Add one shared fixture matrix covering compliant input, rule violations, invalid input, and unsupported syntax.
- Add a conformance runner that executes every fixture through both host entry paths and compares normalized rule ids, diagnostics, stdout/stderr channel policy, and exit codes.
- Add structural adapter-boundary checks that reject embedded PLDD rule definitions or host-specific expected outputs.
- Keep all installation and execution fixture-only; no live hooks, registries, router state, package configuration, or dogfood activation changes.

## Capabilities

### New Capabilities

- `pl-consumer-adapter-parity`: Inactive Codex and Claude Code adapters invoke the same enforcement kernel and prove identical normalized behavior through one shared fixture suite.

### Modified Capabilities

(none)

## Impact

- Affected specs: new `pl-consumer-adapter-parity` capability; existing `pl-enforcement-kernel` remains canonical and unchanged.
- Affected code:
  - New: `src/scripts/pl-adapter-conformance.mjs`, `src/skills/ts-pl/references/host-adapters.md`, `src/skills/ts-pl/references/templates/codex/`, `src/skills/ts-pl/references/templates/claude-code/`, `src/tests/fixtures/pl-adapter-parity/`, `src/tests/unit/pl-adapter-conformance.test.ts`
  - Modified: `src/skills/ts-pl/SKILL.md`, `src/skills/ts-pl/SKILL_caveman.md`
  - Removed: none
- Dependencies: no new npm dependencies.
- Systems: fixture-only Codex and Claude Code consumer entry paths; no live host configuration.

