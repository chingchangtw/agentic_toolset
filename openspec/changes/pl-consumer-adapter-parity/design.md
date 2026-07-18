## Context

Phase A ships deterministic kernel commands and golden fixture outputs. Its design explicitly defers host parity to Phase B. Current Phase B inventory names Codex and Claude Code templates, agents, cards, optional generated tooling, and fixture-only installation, but it does not define an executable contract proving both host entry paths preserve kernel results.

Host prompts and command files are especially drift-prone because they are prose artifacts. If either adapter restates rule conditions, expected rule ids, or exit semantics, two hosts can disagree while each appears locally valid. Phase B therefore needs one executable conformance layer before broader cards, agents, and installer work can claim portability.

Constraints: all implementation stays below `src/*`; no dependency changes; no live host configuration; no dogfood activation; Phase A kernel commands and diagnostic schema remain canonical.

## Goals / Non-Goals

**Goals:**

- Prove Codex and Claude Code host entry paths produce identical normalized outputs for identical fixture cases.
- Keep every PLDD rule, rule id, diagnostic field, and exit-code decision inside Phase A kernel commands.
- Make parity failure identify host, fixture case, command, and differing field.
- Keep adapter installation reversible and isolated to temporary fixture projects.

**Non-Goals:**

- Running real Codex or Claude Code binaries in tests.
- Activating hooks, commands, registries, or PLDD configuration in `agenticToolset`.
- Changing Phase A rule behavior or diagnostic schema.
- Generating dependency-cruiser or ESLint configuration; those remain later Phase B slices.
- Claiming real-project usability or dogfood readiness from fixture parity.

## Decisions

### Use one host-neutral invocation module

Create one portable invocation module that selects a Phase A kernel command, supplies normalized project-relative arguments, captures stdout/stderr and exit code, and returns a versioned observation. Codex and Claude Code templates call this module; they do not call kernel scripts with independently maintained argument logic.

Alternative rejected: one executable wrapper per host. Separate wrappers create two code paths whose equivalence must be inferred and invite rule or argument drift.

### Model host adapters as invocation and display descriptors

Each host adapter is a small versioned descriptor containing host id, template entry path, supported display mode, and the shared invocation identifier. Descriptors contain no `PL-*` rule ids, layer rules, diagnostic expectations, or exit-code mapping. Host templates may explain how to invoke and display results, but normative behavior links to the kernel contract.

Alternative rejected: copy complete commands into each host template. That duplicates semantics in prose and makes source review the only parity mechanism.

### Drive both hosts from one fixture manifest

One fixture manifest lists case id, kernel command, fixture root, arguments, and expected observation reference. The conformance runner expands each case across both host descriptors. Host-specific fixture copies and expected files are forbidden.

Alternative rejected: separate Codex and Claude fixture directories. Equal-looking copies can diverge and do not prove both adapters consumed identical inputs.

### Compare normalized observation envelopes

Every run yields `{version, host, case_id, command, exit_code, stdout, stderr}`. Normalization converts path separators to `/`, requires project-relative diagnostic paths, parses JSON stdout where the command promises JSON, and sorts only fields whose kernel contract declares order-insensitive. Parity comparison excludes `host` and compares all other fields byte-for-byte after normalization.

Expected results remain Phase A golden outputs plus expected exit codes. The adapter suite does not create host-specific golden results.

### Fail closed on adapter boundary violations

Conformance includes a structural check over adapter descriptors and templates. Embedded `PL-*` literals, host-specific expected output files, unknown descriptor versions, unsupported invocation ids, missing shared fixtures, or unparseable promised JSON fail with exit code 2. Behavioral differences between valid host runs fail with exit code 1 and emit a stable `PL-ADAPTER-PARITY` harness diagnostic. Harness-only diagnostics do not redefine kernel rule outcomes.

### Keep installation fixture-only and reversible

Tests install both adapter templates into separate temporary consumer roots generated from one source fixture, record generated paths, run parity, then remove recorded paths and assert baseline restoration. No test writes `.claude/*`, `.codex/*`, `.agents/*`, root package files, or registries in the repository workspace.

## Implementation Contract

Behavior:

- `pl-adapter-conformance` loads the shared fixture manifest and both descriptors, installs adapters into isolated temporary roots, executes every case through both host entry paths, normalizes observations, and compares them.
- A compliant case exits 0 through both paths with identical empty diagnostics.
- A planted rule violation exits 1 through both paths and preserves the same ordered rule ids and normalized diagnostic objects.
- Invalid input and unsupported syntax exit 2 through both paths with identical normalized diagnostics or identical stderr when failure occurs before structured kernel output.
- Structural adapter checks reject any embedded kernel rule id or host-specific golden output.
- Human-facing host templates render kernel output but never translate exit codes or substitute rule-specific advice.

Interfaces and data shapes:

- Adapter descriptor: `{version: "1", host: "codex"|"claude-code", invocation: "pl-kernel", entry: <project-relative path>, display: "passthrough"}`.
- Fixture manifest: `{version: "1", cases: [{id, command, fixture, args, expected}]}` with unique non-empty case ids and paths contained by the shared fixture root.
- Observation: `{version: "1", host, case_id, command, exit_code, stdout, stderr}`. Structured stdout is stored as parsed JSON; text output remains a normalized string.
- Harness diagnostic: `{version: "1", rule_id: "PL-ADAPTER-PARITY", severity: "error", host, case_id, field, message}`.

Failure modes:

- Descriptor, manifest, containment, installation, or normalization errors exit 2 and name the invalid input.
- Valid executions that differ by exit code, stdout, stderr, rule-id sequence, or diagnostic content exit 1 and emit `PL-ADAPTER-PARITY` with exact differing field.
- Missing host entry path or a host template that bypasses shared invocation fails before parity can pass.
- Cleanup runs after success or failure; incomplete rollback fails the test and lists residual generated paths.

Acceptance criteria:

- One parameterized test runs the same manifest cases for Codex and Claude Code.
- Cases cover exit 0, exit 1, and exit 2, including at least architecture violation, contract-id violation, invalid manifest, and unsupported syntax.
- For every case, normalized observations excluding `host` are identical; rule ids and exit codes match expected Phase A goldens.
- A mutation fixture that changes one adapter exit code or diagnostic proves parity detection fails.
- A template fixture containing a `PL-*` literal proves boundary checking fails.
- Fixture installation records generated files, rollback removes them, and baseline hashes match after cleanup.
- Repository scope verification finds implementation changes only under `src/*`.

Scope boundaries: conformance runner, descriptors, host templates, shared fixtures, tests, and `ts-pl` documentation are in scope. Live host execution, root installers, dependency configuration generation, registry activation, router changes, and dogfood are out of scope.

## Risks / Trade-offs

- [Simulated host entry paths miss real CLI behavior] → State evidence narrowly as adapter-contract parity; reserve real-host and dogfood claims for later approved validation.
- [Normalization hides meaningful differences] → Normalize only path separators and contract-declared order-insensitive fields; compare every other field exactly.
- [Boundary scan mistakes documentation examples for rules] → Keep normative rule-id catalogs outside host templates; allow no `PL-*` literals in adapter-owned files.
- [One invocation module makes host tests trivially identical] → Execute distinct host descriptors and installed templates, then include mutation tests proving descriptor and display-path divergence is detected.
- [Cleanup failure leaves fixture residue] → Install only under temporary roots, use generated-file manifests, and assert baseline restoration in `finally` cleanup.


