# Host Adapters (Codex, Claude Code)

Fixture-only conformance proof that Codex and Claude Code host entry paths
invoke the same portable PLDD kernel and produce identical results. This is
an adapter-contract parity proof, not a claim that either host is installed,
active, or dogfood-ready in any real project.

## What's proven

- One host-neutral invocation module (`src/scripts/pl-adapter-conformance.mjs`)
  dispatches the existing `pl-arch-check`, `pl-contract-check`, and
  `gen-scenarios` kernel commands — it does not reimplement or translate them.
- Each host adapter is a small versioned descriptor
  (`{version, host, invocation, entry, display}`) plus a template file. Neither
  contains a `PL-*` rule id, a layer rule, or a host-specific expected output —
  a structural boundary check (`checkAdapterBoundary`) fails any file that does.
- One shared fixture manifest (`src/tests/fixtures/pl-adapter-parity/manifest.json`)
  drives both hosts through the same cases: compliant architecture, forbidden
  import, invalid manifest, unsupported syntax, contract-id violation, and
  ownership failure — covering kernel exit codes 0, 1, and 2.
- Both hosts' normalized observations (`{version, host, case_id, command,
  exit_code, stdout, stderr}`) are compared field-by-field, excluding only
  `host`. A mismatch emits `PL-ADAPTER-PARITY` naming the case and field.
- Adapter installation happens only inside temporary, per-case consumer roots
  created by the test/CLI caller; every generated file and directory is
  recorded and removed on rollback. No test or CLI run in this suite writes
  `.claude/*`, `.codex/*`, `.agents/*`, root package files, or registries in
  the real repository.

## What's not proven

- Real Codex or Claude Code binaries were not run. The conformance suite
  drives the same descriptor/template files a real host would load, through
  the shared invocation module, but does not exercise either vendor's actual
  CLI or agent runtime.
- No claim of dogfood readiness or real-project usability follows from this
  fixture parity. Activating either adapter inside `agenticToolset` itself is
  a separate, explicitly-approved step tracked outside this suite.
- Dependency-cruiser/ESLint config generation, install scaffolding, cards, and
  broader agent contracts are separate Phase B work, not covered here.

## Running it

```
node src/scripts/pl-adapter-conformance.mjs \
  --manifest src/tests/fixtures/pl-adapter-parity/manifest.json \
  --descriptor src/skills/ts-pl/references/templates/codex/descriptor.json \
  --descriptor src/skills/ts-pl/references/templates/claude-code/descriptor.json \
  --templates-root src/skills/ts-pl/references/templates \
  --format json
```

Exit 0: no parity or boundary violations. Exit 1: a valid pair of host runs
disagreed on a normalized field. Exit 2: a structural problem (bad descriptor,
bad manifest, boundary violation, or install/rollback failure) before parity
could even be evaluated.
