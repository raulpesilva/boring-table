import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    clearMocks: true,
    globals: false,
    projects: [
      {
        test: {
          name: 'core',
          environment: 'node',
          include: ['packages/boring-table-core/test/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'react',
          environment: 'happy-dom',
          include: ['packages/react-boring-table/test/**/*.test.ts?(x)'],
        },
      },
    ],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/*/src/example/**'],
      thresholds: {
        statements: 70,
        branches: 55,
        functions: 60,
        lines: 70,
      },
    },
  },
});
