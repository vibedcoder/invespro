import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
  },
  resolve: {
    conditions: ['import', 'require', 'default'],
  },
});