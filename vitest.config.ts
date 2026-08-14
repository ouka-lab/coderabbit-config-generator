import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      thresholds: {
        statements: 80,
      },
      exclude: [
        '**/dist/**',
        'docs/**',
        'vendor/**',
        'packages/core/scripts/**',
        'packages/core/src/examples/generated/**',
        'packages/core/src/index.ts',
        'packages/ui/src/index.ts',
        'packages/web/src/main.tsx',
        'packages/web/src/vite-env.d.ts',
        '**/*.config.{ts,mjs}',
      ],
    },
  },
});
