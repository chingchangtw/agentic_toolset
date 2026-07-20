## ADDED Requirements

### Requirement: one portable kernel owns all rules

Codex and Claude Code adapters SHALL invoke the same host-neutral invocation module, and adapter-owned descriptors and templates SHALL NOT define PLDD rule conditions, kernel rule ids, diagnostic schemas, or exit-code mappings.

#### Scenario: both adapters select shared invocation

- **WHEN** adapter descriptors are validated
- **THEN** Codex and Claude Code both reference invocation id `pl-kernel`
- **THEN** the invocation resolves to Phase A kernel commands without a host-specific rule layer

#### Scenario: duplicated rule id is rejected

- **WHEN** an adapter descriptor or host template contains a `PL-*` rule-id literal
- **THEN** structural conformance fails with exit code 2
- **THEN** the failure names the adapter-owned file containing duplicated rule content

### Requirement: both hosts run one shared fixture manifest

The conformance runner SHALL expand every case in one versioned fixture manifest across both host adapters. Codex-specific and Claude-Code-specific fixture inputs or golden outputs SHALL NOT satisfy conformance.

#### Scenario: fixture case runs through both hosts

- **WHEN** the manifest contains case `architecture-forbidden-import`
- **THEN** the runner executes that exact fixture root and argument list once through Codex and once through Claude Code
- **THEN** both observations reference the same case id and expected Phase A golden output

#### Scenario: host-specific golden is rejected

- **WHEN** an adapter references a host-specific expected-output path
- **THEN** manifest validation fails with exit code 2
- **THEN** no parity result is reported

### Requirement: normalized rule ids diagnostics and exit codes match

For every valid fixture case, the conformance runner SHALL produce a versioned observation containing host, case id, command, exit code, stdout, and stderr. After excluding host and applying contract-limited normalization, Codex and Claude Code observations SHALL be identical.

#### Scenario: planted violation matches

- **WHEN** both adapters run a planted architecture violation
- **THEN** both observations exit with code 1
- **THEN** both observations contain the same ordered `PL-ARCH-FORBIDDEN-IMPORT` diagnostic with project-relative paths

#### Scenario: invalid input matches

- **WHEN** both adapters run an invalid manifest fixture
- **THEN** both observations exit with code 2
- **THEN** normalized stdout and stderr are identical

#### Scenario: parity drift is detected

- **WHEN** one adapter observation differs in exit code, stdout, stderr, rule-id sequence, or diagnostic content
- **THEN** conformance exits with code 1
- **THEN** it emits `PL-ADAPTER-PARITY` naming host, case id, and differing field

### Requirement: host adapters contain invocation and display logic only

Host adapters SHALL limit behavior to selecting the shared invocation, passing caller arguments, and displaying returned output without translating rule ids, changing exit codes, or adding rule-specific remediation.

#### Scenario: passthrough preserves kernel result

- **WHEN** a host adapter receives kernel stdout, stderr, and exit code
- **THEN** it preserves each channel and exit code in the observation envelope
- **THEN** host display text does not alter structured diagnostic content

#### Scenario: unsupported adapter version fails closed

- **WHEN** an adapter descriptor has an unknown version or invocation id
- **THEN** conformance exits with code 2
- **THEN** no kernel command executes for that adapter

### Requirement: fixture installation is isolated and reversible

Adapter installation SHALL occur only in temporary consumer roots, SHALL record every generated path, and SHALL restore the fixture baseline after successful or failed conformance runs.

#### Scenario: rollback restores baseline

- **WHEN** both host adapters are installed, exercised, and removed from temporary fixture roots
- **THEN** generated-file manifests contain every created path
- **THEN** post-cleanup baseline hashes equal pre-install baseline hashes

#### Scenario: repository activation is absent

- **WHEN** change scope is verified
- **THEN** implementation changes exist only below `src/*`
- **THEN** no live hook, registry, router, `.agents/*`, root package, lockfile, or dogfood configuration is modified

