# pl-dogfood-activation Specification

## Purpose

TBD - created by archiving change 'pl-dogfood-activation'. Update Purpose after archive.

## Requirements

### Requirement: Activation snapshots every target before any write

`pl-dogfood-activate.mjs` SHALL, given a fixed target-list, copy every
target's current bytes (or record that the target did not previously exist)
into a timestamped snapshot directory before writing any new content, and
SHALL NOT begin the apply phase until the snapshot phase has completed for
every listed target.

#### Scenario: snapshot completes before any write

- **WHEN** activation runs against a fixture target-tree containing three
  existing files and one not-yet-existing file
- **THEN** the snapshot directory contains an exact byte copy of each of the
  three existing files and a recorded "did not exist" marker for the fourth
  **THEN** none of the four targets are modified until all four snapshot
  entries are recorded

#### Scenario: snapshot failure aborts before any apply

- **WHEN** a snapshot copy fails for any target (e.g. permission error)
- **THEN** activation exits non-zero and no target has been modified


<!-- @trace
source: pl-dogfood-activation
updated: 2026-07-20
code:
  - .agents/iteration.json
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/think/slice2-think.md
  - README.md
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/test-slice2/mutation-report.json
  - tasks/TASK.md
  - src/scripts/pl-dogfood-activate.mjs
  - src/scripts/pl-dogfood-target-list.json
  - src/scripts/pl-dogfood-rollback.mjs
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/test-slice2/stryker.dogfood-activation.conf.json
  - src/scripts/pl-scope-guard.mjs
  - .agents/ts-deliver-router/history.jsonl
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/review-slice2/report.md
  - src/skills/ts-pl/references/host-adapters.md
  - .agents/ts-deliver-router/state.json
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/test-slice2/vitest.dogfood-activation.config.ts
tests:
  - src/tests/unit/pl-dogfood-rollback.test.ts
  - src/tests/unit/pl-scope-guard.test.ts
  - src/tests/unit/pl-dogfood-activate.test.ts
-->

---
### Requirement: Activation applies atomically per target

`pl-dogfood-activate.mjs` SHALL write each target's new content to a
temporary path and rename it into place (write tmp → rename), matching the
router's own `state.json` atomic-write pattern, for every target in its
fixed list, and SHALL emit a JSON manifest recording `{path, existed_before,
snapshot_path, new_hash}` for every target.

#### Scenario: manifest enumerates every applied target

- **WHEN** activation completes against a fixture target-tree with four
  targets
- **THEN** the emitted manifest lists exactly four entries, each with a
  `path`, `existed_before` boolean, `snapshot_path`, and `new_hash`

##### Example: manifest shape

- **GIVEN** targets `a.json` (existed) and `b/c.txt` (did not exist)
- **WHEN** activation completes
- **THEN** the manifest contains two entries: `{path: "a.json",
  existed_before: true, snapshot_path: "<snap>/a.json", new_hash: "<sha>"}`
  and `{path: "b/c.txt", existed_before: false, snapshot_path: "<snap>/b/c.txt",
  new_hash: "<sha>"}`


<!-- @trace
source: pl-dogfood-activation
updated: 2026-07-20
code:
  - .agents/iteration.json
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/think/slice2-think.md
  - README.md
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/test-slice2/mutation-report.json
  - tasks/TASK.md
  - src/scripts/pl-dogfood-activate.mjs
  - src/scripts/pl-dogfood-target-list.json
  - src/scripts/pl-dogfood-rollback.mjs
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/test-slice2/stryker.dogfood-activation.conf.json
  - src/scripts/pl-scope-guard.mjs
  - .agents/ts-deliver-router/history.jsonl
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/review-slice2/report.md
  - src/skills/ts-pl/references/host-adapters.md
  - .agents/ts-deliver-router/state.json
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/test-slice2/vitest.dogfood-activation.config.ts
tests:
  - src/tests/unit/pl-dogfood-rollback.test.ts
  - src/tests/unit/pl-scope-guard.test.ts
  - src/tests/unit/pl-dogfood-activate.test.ts
-->

---
### Requirement: Rollback restores the pre-activation state exactly

`pl-dogfood-rollback.mjs` SHALL, given a manifest produced by
`pl-dogfood-activate.mjs`, restore every listed target to its pre-activation
state — restoring exact snapshot bytes for targets that existed before, and
deleting targets that did not exist before — using the same atomic
tmp-then-rename pattern, and SHALL exit non-zero naming the first
mismatching path if the restored tree diffs non-empty against the recorded
snapshot.

#### Scenario: rollback produces an empty diff

- **WHEN** rollback runs against a manifest from a completed activation
- **THEN** every target's restored content is byte-identical to its
  pre-activation snapshot (or absent, for targets that did not exist before)
- **THEN** rollback exits 0

#### Scenario: rollback detects a mismatch

- **WHEN** a restored target's bytes differ from its recorded snapshot
  (e.g. a concurrent external write happened after activation)
- **THEN** rollback exits non-zero and names the mismatching path


<!-- @trace
source: pl-dogfood-activation
updated: 2026-07-20
code:
  - .agents/iteration.json
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/think/slice2-think.md
  - README.md
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/test-slice2/mutation-report.json
  - tasks/TASK.md
  - src/scripts/pl-dogfood-activate.mjs
  - src/scripts/pl-dogfood-target-list.json
  - src/scripts/pl-dogfood-rollback.mjs
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/test-slice2/stryker.dogfood-activation.conf.json
  - src/scripts/pl-scope-guard.mjs
  - .agents/ts-deliver-router/history.jsonl
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/review-slice2/report.md
  - src/skills/ts-pl/references/host-adapters.md
  - .agents/ts-deliver-router/state.json
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/test-slice2/vitest.dogfood-activation.config.ts
tests:
  - src/tests/unit/pl-dogfood-rollback.test.ts
  - src/tests/unit/pl-scope-guard.test.ts
  - src/tests/unit/pl-dogfood-activate.test.ts
-->

---
### Requirement: Scope guard allows only the declared activation targets outside src/

`pl-scope-guard.mjs`'s `checkPhaseAScope` SHALL accept an optional
`allowedPaths` parameter (default: empty array) and SHALL treat a path
outside `src/` as compliant only if it exactly matches or is nested under an
entry in `allowedPaths`; the zero-argument (default `allowedPaths = []`)
behavior SHALL remain unchanged from today's unconditional `src/`-only
check.

#### Scenario: default behavior unchanged for existing callers

- **WHEN** `checkPhaseAScope` is called with no `allowedPaths` argument
- **THEN** any path outside `src/` (excluding the existing
  `scripts/release-manifest.json` exception) is flagged as a violation,
  identical to current behavior

#### Scenario: declared activation target is permitted

- **WHEN** `checkPhaseAScope` is called with `allowedPaths` containing
  `.agents/ts-deliver-router/registry.json`
- **THEN** that exact path is not flagged as a violation
- **THEN** any other path outside `src/` not in `allowedPaths` is still
  flagged as a violation

<!-- @trace
source: pl-dogfood-activation
updated: 2026-07-20
code:
  - .agents/iteration.json
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/think/slice2-think.md
  - README.md
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/test-slice2/mutation-report.json
  - tasks/TASK.md
  - src/scripts/pl-dogfood-activate.mjs
  - src/scripts/pl-dogfood-target-list.json
  - src/scripts/pl-dogfood-rollback.mjs
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/test-slice2/stryker.dogfood-activation.conf.json
  - src/scripts/pl-scope-guard.mjs
  - .agents/ts-deliver-router/history.jsonl
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/review-slice2/report.md
  - src/skills/ts-pl/references/host-adapters.md
  - .agents/ts-deliver-router/state.json
  - .agents/ts-deliver-router/artifacts/EPIC-PLDD-CONSUMER-ADAPTERS/test-slice2/vitest.dogfood-activation.config.ts
tests:
  - src/tests/unit/pl-dogfood-rollback.test.ts
  - src/tests/unit/pl-scope-guard.test.ts
  - src/tests/unit/pl-dogfood-activate.test.ts
-->