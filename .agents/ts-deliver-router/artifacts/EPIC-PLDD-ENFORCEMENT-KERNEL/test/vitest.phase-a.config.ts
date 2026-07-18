import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    include: [
      'src/tests/unit/contracts.test.ts',
      'src/tests/unit/gen-scenarios.test.ts',
      'src/tests/unit/pl-arch-check.test.ts',
      'src/tests/unit/pl-contract-check.test.ts',
      'src/tests/unit/pl-scope-guard.test.ts',
    ],
  },
});
