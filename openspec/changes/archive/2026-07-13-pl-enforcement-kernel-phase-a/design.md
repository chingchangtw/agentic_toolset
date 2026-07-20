## Context

PLDD needs executable constraints before guidance artifacts can depend on them. Current workflow validates phase/gate state but does not mechanically constrain layer placement, imports, local contracts, or Event Storm ownership coverage. Phase A establishes a host-neutral kernel under `src/*`; Phase B will later wrap it with inactive Codex/Claude and consumer-project adapters. `scripts/release-manifest.json` is the sole non-`src/*` exception and registers packaging content without workflow activation.

Constraints: zero new npm dependencies, no root configuration changes other than the packaging-only release-manifest entry, no live workflow activation, no source evaluation, and no dogfood changes. Discovery validated additive `ownership_relations_v1` with legacy arrays preserved.

## Goals / Non-Goals

**Goals:**

- Detect layer-placement and forbidden-import violations deterministically.
- Fail closed for unsupported TypeScript/JavaScript import syntax.
- Emit stable JSON diagnostics and exit codes.
- Enforce stable contract-id to violation-test identity.
- Compile one scenario skeleton per command from versioned ownership relations and check event coverage.
- Produce golden fixture outputs that Phase B host adapters must reproduce.

**Non-Goals:**

- Consumer scaffolds, dependency-cruiser/ESLint integration, agent cards, templates, or production-line orchestration.
- Live registry/hook/router changes or activation against `agenticToolset`.
- Full TypeScript semantic analysis, runtime module resolution, or source evaluation.
- Dogfood activation or persistent station state.

## Decisions

### Use one canonical layer manifest

`layers.map.json` is the sole source for layer globs, allowed imports, configured internal aliases, and external-package policy. Diagnostics and future generated adapters reference manifest rule ids; prose never duplicates import rules.

Alternative rejected: hand-maintained dependency-cruiser config. It creates a second source of truth and belongs to Phase B generation.

### Use a deterministic fail-closed lexical scanner

The architecture checker scans `.ts`, `.tsx`, `.js`, `.jsx`, `.mts`, `.cts`, `.mjs`, and `.cjs` as text without evaluation. Supported forms are static `import ... from`, side-effect `import`, `export ... from`, string-literal `import()`, and string-literal `require()`. The scanner skips comments and ordinary string/template contents while preserving module-specifier literals. Non-literal dynamic import/require, malformed tokens, or unsupported import-like syntax returns `PL-ARCH-UNSUPPORTED-SYNTAX` and exit code 2.

Alternative rejected: regex-only parsing. Comments, strings, multiline imports, and template expressions make silent bypass likely. Alternative deferred: TypeScript compiler API or dependency-cruiser, because Phase A cannot add dependencies.

### Resolve paths within an explicit project boundary

The checker canonicalizes project root and resolved files, rejects traversal/symlink escape, supports relative imports plus aliases declared in `layers.map.json`, and classifies undeclared bare specifiers as external. Every scanned internal file must match exactly one layer; zero or multiple matches fail configuration/input validation.

### Separate violations from invalid input

Exit code 0 means compliant, 1 means valid input with rule violations, and 2 means invalid manifest/input or unsupported syntax. JSON diagnostics use `{version, rule_id, severity, file, dependency, message}` with project-relative paths. Text output derives from the same diagnostic objects.

### Match contracts by stable identity

`requires`, `ensures`, and `invariant` accept `(condition, id, message)`. `pl-contract-check` scans an explicit file set or project fixture and compares declared contract ids with violation tests containing the same ids. Duplicate contract ids, missing test ids, or test ids without declarations are named separately; raw assertion counts never decide compliance.

### Preserve legacy Discovery arrays

`domain_events[]`, `commands[]`, and `aggregates[]` remain string arrays. `ownership_relations_v1[]` adds `{command, aggregate, event}` entries and `external_adapters_v1[]` adds explicit external boundaries. Every command and event must appear in exactly one ownership relation; unknown relation versions fail closed.

`gen-scenarios --input <exploration.json>` runs generation mode and emits one skeleton per valid relation. Adding `--scenarios <spec.md>` selects coverage mode: it reads completed OpenSpec text and verifies each legacy event appears in a `THEN` clause. Coverage mode is separate because valid ownership necessarily makes generated skeletons complete; checking generated output could never reveal a missing completed assertion.

### Keep Phase A host-neutral

Phase A produces deterministic golden fixture inputs/outputs. It does not claim Codex/Claude adapter parity. Phase B adapters must invoke the same commands and reproduce those outputs byte-for-byte apart from normalized path separators.

### Register packaging without activation

The existing `scripts/release-manifest.json` receives the `ts-pl` skill entry so release builds can carry Phase-A documentation. This is packaging metadata only: Phase A adds no hooks, router entries, live `.agents/*` registry entries, consumer adapters, or dogfood sync. The scope guard permits this exact file and rejects every other non-`src/*` implementation path.

## Implementation Contract

Behavior:

- `pl-arch-check` accepts project root, layer manifest, and output format; it returns exit 0/1/2 per the decision above.
- `pl-contract-check` accepts source/test file sets and returns missing, duplicate, and orphan contract-id diagnostics.
- `gen-scenarios --input <exploration.json>` emits one OpenSpec `#### Scenario:` skeleton per ownership relation. Optional `--scenarios <spec.md>` checks completed scenario `THEN` clauses instead of generating skeletons.

Data shapes:

- Layer manifests contain version, layers with glob and `may_import`, optional aliases, and external policy.
- Diagnostics contain stable versioned fields and project-relative paths.
- Ownership relations reference exact names present in legacy arrays.

Failure modes:

- Invalid/ambiguous layer mapping, path escape, unknown manifest version, unsupported syntax, unknown ownership version, or malformed relations exit 2.
- Valid architecture/contract/event-coverage violations exit 1.
- Missing completed-scenario events emit `PL-SCENARIO-MISSING-EVENT` with the missing event names; complete coverage exits 0.
- No checker evaluates source code, imports executable configuration, modifies caller files, or suppresses unknown syntax.

Acceptance criteria:

- Fixture tests cover every supported import form and at least one unsupported form.
- Planted layer, contract-id, ownership, and event-coverage violations assert stable rule ids and exit codes.
- Repeated runs produce deterministic normalized JSON.
- Repository diff for implementation contains only `src/*` paths plus the exact packaging exception `scripts/release-manifest.json`.
- Release-manifest registration names only the `ts-pl` skill source/destination and creates no activation path through hooks, routers, live registries, or dogfood configuration.

Scope boundaries: only proposal/design/spec/task artifacts, Phase-A `src/*` implementation files listed in the proposal, and `scripts/release-manifest.json` are in scope. Phase B and Phase C artifacts are excluded.

## Risks / Trade-offs

- [Scanner subset rejects valid advanced syntax] → fail with precise unsupported-syntax location; expand only through a spec/test change or use Phase B tooling.
- [Alias resolution differs from TypeScript] → aliases are explicit manifest data; undeclared aliases fail rather than guess.
- [Glob implementation becomes a hidden parser] → support only `*` and `**`; reject other metacharacters.
- [Contract-id scanner reports false matches] → reuse lexical scanning boundaries and require contract-call/test-call contexts.
- [Golden outputs mask host differences] → Phase A states host-neutral determinism only; Phase B owns adapter parity.
- [Scope leaks into live workflow] → final verification permits only `src/*` plus `scripts/release-manifest.json`, checks root dependency files unchanged, and rejects hooks/router/live-registry/dogfood changes.
