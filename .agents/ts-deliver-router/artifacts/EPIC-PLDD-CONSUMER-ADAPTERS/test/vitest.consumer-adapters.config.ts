import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    include: [
      'src/tests/unit/pl-adapter-conformance.test.ts',
      'src/tests/unit/ts-pl-skill.test.ts',
    ],
  },
});
