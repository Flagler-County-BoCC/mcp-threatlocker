import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
      include: ['src/**/*.ts'],
      exclude: [
        'src/stdio.ts',
        'src/server.ts',
        'src/index.ts',
        'src/**/*.types.ts',
        'src/**/*.schema.ts',
      ],
    },
    pool: 'forks',
    forks: { singleFork: true },
  },
});
