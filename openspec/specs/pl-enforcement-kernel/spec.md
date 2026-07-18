# pl-enforcement-kernel Specification

## Purpose

TBD - created by archiving change 'pl-enforcement-kernel-phase-a'. Update Purpose after archive.

## Requirements

### Requirement: Phase A remains isolated

Phase A implementation SHALL modify only files below `src/*` plus the exact packaging exception `scripts/release-manifest.json`, SHALL add no npm dependency, and SHALL NOT activate PLDD through live workflow configuration.

#### Scenario: implementation scope is checked

- **WHEN** Phase A verification inspects implementation changes
- **THEN** any implementation path outside `src/*` and `scripts/release-manifest.json` fails verification
- **THEN** changes to root dependency files, live `.agents/*`, hooks, router, or registries fail verification

#### Scenario: release packaging stays inactive

- **WHEN** Phase A registers `src/skills/ts-pl` in `scripts/release-manifest.json`
- **THEN** the manifest contains only skill packaging source and destination metadata for `ts-pl`
- **THEN** no hook, router, live registry, consumer adapter, or dogfood activation is added

---
### Requirement: layer manifest is canonical and unambiguous

The architecture checker SHALL consume one versioned `layers.map.json`, SHALL assign every scanned internal file to exactly one layer, and SHALL evaluate imports using only manifest rules.

#### Scenario: overlapping layers fail closed

- **WHEN** one source file matches two layer globs
- **THEN** the checker emits `PL-ARCH-AMBIGUOUS-LAYER`
- **THEN** the checker exits with code 2

#### Scenario: unmatched internal file fails closed

- **WHEN** a scanned internal source file matches no layer glob
- **THEN** the checker emits `PL-ARCH-UNMATCHED-LAYER`
- **THEN** the checker exits with code 2

---
### Requirement: import syntax support is explicit

The architecture checker SHALL support static imports, side-effect imports, re-exports with module specifiers, string-literal dynamic imports, and string-literal CommonJS requires across TypeScript and JavaScript source extensions. It SHALL NOT silently skip unsupported import-like syntax.

#### Scenario: supported forms produce dependencies

- **WHEN** fixture files use each supported import form
- **THEN** the checker resolves every module specifier into the dependency graph

##### Example: supported forms

| Form | Example |
| ----- | ------- |
| static | `import {x} from "./x"` |
| side effect | `import "./setup"` |
| re-export | `export {x} from "./x"` |
| dynamic literal | `import("./x")` |
| CommonJS literal | `require("./x")` |

#### Scenario: unsupported dynamic expression fails closed

- **WHEN** source contains `import(moduleName)` or `require(prefix + name)`
- **THEN** the checker emits `PL-ARCH-UNSUPPORTED-SYNTAX`
- **THEN** the checker exits with code 2

---
### Requirement: paths stay inside project root

The architecture checker SHALL canonicalize resolved internal paths, SHALL reject traversal or symlink escape, and SHALL resolve only relative imports and aliases explicitly declared in the layer manifest.

#### Scenario: path escape is rejected

- **WHEN** an import resolves outside canonical project root
- **THEN** the checker emits `PL-ARCH-PATH-ESCAPE`
- **THEN** the checker exits with code 2

---
### Requirement: forbidden imports are deterministic violations

The architecture checker SHALL emit one stable diagnostic for each import forbidden by the source layer's declared layer-import allowlist.

#### Scenario: domain imports infrastructure

- **WHEN** a domain fixture imports an infrastructure fixture
- **THEN** the checker emits `PL-ARCH-FORBIDDEN-IMPORT` with both project-relative paths
- **THEN** the checker exits with code 1

---
### Requirement: diagnostic and exit contracts are stable

All Phase A commands SHALL emit versioned diagnostics derived from `{version, rule_id, severity, file, dependency, message}` objects. Exit code 0 SHALL mean compliant, 1 SHALL mean rule violation, and 2 SHALL mean invalid input or unsupported syntax.

#### Scenario: repeated JSON output is deterministic

- **WHEN** the same fixture command runs twice
- **THEN** normalized JSON diagnostics are identical
- **THEN** diagnostics contain only project-relative paths

##### Example: stable forbidden-import diagnostic

- **GIVEN** `src/domain/Order.ts` imports `src/infra/SqlOrder.ts`
- **WHEN** `pl-arch-check` runs twice with JSON output
- **THEN** both runs emit the same `PL-ARCH-FORBIDDEN-IMPORT` object with project-relative paths and exit code 1

---
### Requirement: contracts use stable identities

The contract utility SHALL expose `requires`, `ensures`, and `invariant` with `(condition, id, message)`. The contract checker SHALL compare declaration ids with violation-test ids and SHALL NOT use assertion counts as evidence of parity.

#### Scenario: missing violation test is identified

- **WHEN** source declares contract id `TIMESHEET-HOURS-CAPACITY` and no violation test names that id
- **THEN** the checker emits `PL-CONTRACT-MISSING-TEST`
- **THEN** the checker exits with code 1

#### Scenario: duplicate contract id is rejected

- **WHEN** two contract declarations use the same id
- **THEN** the checker emits `PL-CONTRACT-DUPLICATE-ID`
- **THEN** the checker exits with code 1

---
### Requirement: ownership relations are additive and complete

Scenario compilation SHALL preserve legacy `domain_events[]`, `commands[]`, and `aggregates[]` string arrays and SHALL consume `ownership_relations_v1[]` entries containing exact command, aggregate, and event names.

#### Scenario: complete relations compile scenarios

- **WHEN** exploration input contains ten commands, ten events, and ten valid ownership relations
- **THEN** compilation emits exactly ten `#### Scenario:` skeletons
- **THEN** every legacy command and event remains unchanged in input data

#### Scenario: ambiguous ownership fails closed

- **WHEN** a command or event occurs in zero or two ownership relations
- **THEN** compilation emits `PL-SCENARIO-OWNERSHIP`
- **THEN** compilation exits with code 2

---
### Requirement: scenario event coverage is complete

The scenario compiler SHALL accept optional `--scenarios <spec.md>` completed OpenSpec text and SHALL verify that every legacy domain event appears in at least one `THEN` clause. Without `--scenarios`, it SHALL generate skeletons from valid ownership relations; it SHALL NOT treat generated skeletons as evidence that completed scenario coverage was checked.

#### Scenario: missing event assertion is a violation

- **WHEN** `--scenarios <spec.md>` is supplied and one legacy domain event appears in no completed scenario `THEN` clause
- **THEN** compilation emits `PL-SCENARIO-MISSING-EVENT`
- **THEN** compilation exits with code 1

#### Scenario: completed event coverage passes

- **WHEN** `--scenarios <spec.md>` is supplied and every legacy domain event appears in at least one completed scenario `THEN` clause
- **THEN** coverage checking emits no diagnostics
- **THEN** coverage checking exits with code 0
