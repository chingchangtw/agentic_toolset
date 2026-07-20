import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    include: [
      'src/tests/unit/pl-dogfood-activate.test.ts',
      'src/tests/unit/pl-dogfood-rollback.test.ts',
      'src/tests/unit/pl-scope-guard.test.ts',
    ],
  },
});
