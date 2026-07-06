## 1. Fix path mismatch

- [x] 1.1 In `scripts/run-scenario.sh`, replace the 4 `.ai/` path segments with `.agents/` (test workspace dir creation, fixture copy destination, state.json write, and the two `jq` read paths against `iteration.json`), so the runner satisfies "run-scenario.sh is the single source of FIXTURE_MAP" — verify with `grep -n '\.ai/' scripts/run-scenario.sh` returning no matches.
- [x] 1.2 Run `bash scripts/run-scenario.sh S1` through `bash scripts/run-scenario.sh S9` locally and confirm each prints TAP output with zero `not ok` lines — verify by checking each command's exit code is 0.
- [x] 1.3 Confirm `npm test` (vitest) still passes unchanged after the edit, since this script is independent of the vitest suite — verify with `npx vitest run` reporting all existing test files green.
