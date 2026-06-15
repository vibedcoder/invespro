import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@vibedcoder/invespro-core': fileURLToPath(
        new URL('../core/src/index.ts', import.meta.url),
      ),
      '@vibedcoder/invespro-types': fileURLToPath(
        new URL('../types/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
  },
});
