import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

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
  },
});
