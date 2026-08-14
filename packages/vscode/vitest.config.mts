import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'vscode',
    globals: true,
    environment: 'jsdom',
  },
});
