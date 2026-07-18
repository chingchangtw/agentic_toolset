## 1. Test Harness and Scope Guard

- [x] 1.1 Implement **Phase A remains isolated** verification that permits only `src/*` plus exact packaging exception `scripts/release-manifest.json`, and rejects all other implementation paths plus changes to root dependencies or live workflow configuration; verify with unit fixtures containing allowed `src/*`, allowed manifest, and forbidden changed-path sets.
- [x] 1.2 Create `src/tests/fixtures/pl-sample-app/` golden inputs and normalized expected diagnostics for compliant, architecture-failing, contract-failing, ownership-failing, and unsupported-syntax cases; verify fixture discovery through an existing Vitest test.

## 2. Architecture Enforcement

- [x] 2.1 Implement **Use one canonical layer manifest** and **layer manifest is canonical and unambiguous** validation in `src/scripts/pl-arch-check.mjs`, including version, `*`/`**` glob subset, layers, `may_import`, aliases, and external policy; verify unmatched, overlapping, unknown-version, and unsupported-glob fixtures emit their specified rule ids with exit code 2.
- [x] 2.2 Implement **Use a deterministic fail-closed lexical scanner** and **import syntax support is explicit** for `.ts`, `.tsx`, `.js`, `.jsx`, `.mts`, `.cts`, `.mjs`, and `.cjs`; verify all five supported import forms plus comment/string/multiline cases and non-literal dynamic import/require failures in `pl-arch-check.test.ts`.
- [x] 2.3 Implement **Resolve paths within an explicit project boundary** and **paths stay inside project root**, supporting relative imports and manifest aliases while rejecting traversal, symlink escape, and unresolved internal aliases; verify `PL-ARCH-PATH-ESCAPE` and successful in-root resolution fixtures.
- [x] 2.4 Implement **forbidden imports are deterministic violations** from exact layer ownership and `may_import`; verify a domain-to-infrastructure fixture emits `PL-ARCH-FORBIDDEN-IMPORT`, both project-relative paths, and exit code 1.
- [x] 2.5 Implement **Separate violations from invalid input** and **diagnostic and exit contracts are stable** using versioned diagnostic objects and exit codes 0/1/2; verify two identical runs produce identical normalized JSON with no absolute paths.

## 3. Contract Enforcement

- [x] 3.1 Implement `ContractViolation`, `requires`, `ensures`, and `invariant` in `src/utils/contracts.ts` so **contracts use stable identities** through `(condition, id, message)` and remain always on; verify each violation kind throws a message containing its kind and id.
- [x] 3.2 Implement **Match contracts by stable identity** in `src/scripts/pl-contract-check.mjs`, lexically comparing declaration ids with violation-test ids and reporting duplicate, missing, and orphan ids without count heuristics; verify `PL-CONTRACT-MISSING-TEST` and `PL-CONTRACT-DUPLICATE-ID` fixtures exit 1.

## 4. Scenario Enforcement

- [x] 4.1 Implement **Preserve legacy Discovery arrays** and **ownership relations are additive and complete** in `src/scripts/gen-scenarios.mjs`, validating exact legacy string references and one relation per command/event; verify ten valid relations emit ten scenario skeletons while duplicate/missing ownership emits `PL-SCENARIO-OWNERSHIP` with exit code 2.
- [x] 4.2 Implement **scenario event coverage is complete** through `gen-scenarios --input <exploration.json> --scenarios <spec.md>`, checking completed OpenSpec `THEN` clauses separately from generation; verify a missing legacy event emits `PL-SCENARIO-MISSING-EVENT` with exit code 1, complete coverage exits 0, and generation without `--scenarios` does not claim completed coverage.

## 5. Host-Neutral Packaging and Verification

- [x] 5.1 Implement **Keep Phase A host-neutral** documentation in `src/skills/ts-pl/SKILL.md`, `SKILL_caveman.md`, and kernel references so both variants expose identical command, schema, rule-id, and no-activation contracts; verify dual-file parity with content tests and confirm no Phase-B adapter instructions appear.
- [x] 5.2 Implement **Register packaging without activation** by adding the `ts-pl` skill source/destination entry to existing `scripts/release-manifest.json`, then run focused unit tests, full existing tests, type-check, Spectra validation, and the scope guard; verify golden outputs are deterministic, no hooks/router/live-registry/dogfood activation is added, and implementation paths remain under `src/*` except this exact manifest.
