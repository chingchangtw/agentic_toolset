import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Scoped to what stryker.conf.json actually mutates (src/**/*.ts,
// scripts/lib/golden-templates.mjs) — excludes the shell-hook tests
// (hook-output, gate-enforcement) that fail in this environment
// independent of any source change, which would otherwise fail
// Stryker's initial dry run before a single mutant is even tried.
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@skills': resolve(__dirname, 'src/skills'),
      '@plugins': resolve(__dirname, 'src/plugins'),
      '@mcp': resolve(__dirname, 'src/mcp'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },
  test: {
    globals: false,
    exclude: [
      '**/node_modules/**',
      'src/tests/unit/hook-output.test.ts',
      'src/tests/unit/gate-enforcement.test.ts',
    ],
  },
});
