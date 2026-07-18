## 1. Shared Invocation and Adapter Boundaries

- [ ] 1.1 Implement **Use one host-neutral invocation module** in `src/scripts/pl-adapter-conformance.mjs`: dispatch only the existing architecture, contract, and scenario kernel commands; capture stdout, stderr, and exit code without translating results; verify direct unit cases preserve exit codes 0, 1, and 2.
- [ ] 1.2 Implement **Model host adapters as invocation and display descriptors** under `src/skills/ts-pl/references/templates/codex/` and `src/skills/ts-pl/references/templates/claude-code/`: both descriptors use version `1`, invocation `pl-kernel`, and display `passthrough`; verify descriptor-schema tests reject unknown versions, hosts, invocation ids, and display modes.
- [ ] 1.3 Enforce **one portable kernel owns all rules** and **host adapters contain invocation and display logic only** by scanning adapter-owned descriptors and templates for `PL-*` literals, exit-code remapping, and rule-specific expectations; verify a planted duplicated-rule template fails with exit code 2 and names its file.

## 2. Shared Fixture Contract

- [ ] 2.1 Implement **Drive both hosts from one fixture manifest** at `src/tests/fixtures/pl-adapter-parity/manifest.json`: define unique cases for compliant architecture, forbidden import, invalid manifest, unsupported syntax, contract-id violation, and ownership failure; verify manifest validation rejects duplicate ids, path escape, missing expected references, and host-specific fixture or golden paths.
- [ ] 2.2 Satisfy **both hosts run one shared fixture manifest** by expanding each manifest case across Codex and Claude Code descriptors with the exact same fixture root, arguments, and Phase A expected output; verify one parameterized test records exactly two observations per case and no duplicated host fixture tree exists.
- [ ] 2.3 Implement **Compare normalized observation envelopes** as versioned `{host, case_id, command, exit_code, stdout, stderr}` records: normalize path separators and contract-declared order-insensitive fields only; verify Windows-style and POSIX-style paths normalize identically while changed diagnostic order or content remains detectable.

## 3. Executable Parity and Failure Proof

- [ ] 3.1 Implement **normalized rule ids diagnostics and exit codes match** in the conformance comparison: exclude only `host`, compare every other normalized field, and emit `PL-ADAPTER-PARITY` with host, case id, and field on difference; verify all shared cases pass and a one-host exit-code mutation fails with exit code 1.
- [ ] 3.2 Implement **Fail closed on adapter boundary violations**: invalid descriptor, invalid manifest, missing entry path, unsupported invocation, unparseable promised JSON, or fixture containment failure exits 2 before a parity success; verify table-driven negative tests assert the named invalid input and no kernel execution where preconditions fail.
- [ ] 3.3 Add `src/tests/unit/pl-adapter-conformance.test.ts` proving both host entry paths preserve Phase A golden rule ids, complete diagnostics, stdout/stderr policy, and exits 0/1/2; verify repeated runs produce byte-identical normalized observations and `npm test -- src/tests/unit/pl-adapter-conformance.test.ts` passes.

## 4. Isolation, Rollback, and Handoff

- [ ] 4.1 Implement **Keep installation fixture-only and reversible** using separate temporary consumer roots and generated-file manifests; cleanup runs after success or failure and reports residue; verify pre-install and post-cleanup baseline hashes match for both hosts.
- [ ] 4.2 Satisfy **fixture installation is isolated and reversible** with a scope test that rejects writes outside temporary roots and a repository-diff assertion that implementation changes stay below `src/*`; verify live `.agents/*`, hooks, registries, router, root package files, lockfile, and dogfood configuration remain unchanged.
- [ ] 4.3 Document the adapter contract and evidence limits in `src/skills/ts-pl/references/host-adapters.md`, `src/skills/ts-pl/SKILL.md`, and `src/skills/ts-pl/SKILL_caveman.md`: state fixture parity, one-kernel ownership, no real-host claim, and separate Dogfood Activation approval; verify content tests keep normal and caveman variants semantically aligned.
- [ ] 4.4 Run `npm run type-check`, `npm test -- src/tests/unit/pl-adapter-conformance.test.ts`, existing Phase A kernel tests, `spectra validate pl-consumer-adapter-parity`, and the src-only scope guard; record exact commands and results in change notes so Phase B closure evidence is reproducible.

