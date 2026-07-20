# Mutation Evidence

Date: 2026-07-15

Status: FAIL.

Dependency diagnosis showed the prior installs were slow rather than deadlocked: an earlier successful `npm ci` required about 43 minutes. `npm ci --offline --ignore-scripts --no-audit --no-fund` was therefore allowed to finish and restored 246 packages in 21 minutes. Focused Vitest then passed 35/35 and `tsc --noEmit` passed.

Scoped Stryker configuration mutates all five Phase-A executables and runs the five directly associated test files. Initial dry run passed 38 tests. Stryker generated 1,433 mutants and completed in 24 minutes:

- Mutation score: **57.50%** (required: 85%)
- Covered mutation score: 70.31%
- Killed: 770
- Timed out: 54
- Survived: 348
- No coverage: 261
- Errors: 0

Per-file scores:

- `src/scripts/gen-scenarios.mjs`: 52.07%
- `src/scripts/pl-arch-check.mjs`: 57.08%
- `src/scripts/pl-contract-check.mjs`: 59.71%
- `src/scripts/pl-scope-guard.mjs`: 67.86%
- `src/utils/contracts.ts`: 91.67%

Full machine-readable evidence is in `mutation-report.json`. Survivor output shows missing assertions for diagnostic messages/order and uncovered CLI branches, plus behavioral survivors in architecture, contract, and scenario logic. These require test hardening; threshold must not be lowered or mutation scope narrowed to manufacture a pass.

G2 MUST NOT be signed until surviving mutants are reviewed, focused tests are hardened, and score is at least 85%.
