import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'web',
    globals: true,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
