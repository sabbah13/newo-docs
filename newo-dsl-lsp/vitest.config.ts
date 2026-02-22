import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: [
      'packages/*/test/**/*.test.{ts,js}',
      'tools/*/test/**/*.test.{ts,js}',
    ],
    exclude: [
      'vscode-extension/**',
      'node_modules/**',
    ],
    coverage: {
      provider: 'v8',
      include: [
        'packages/*/src/**',
        'tools/*/src/**',
      ],
      exclude: [
        'vscode-extension/**',
        '**/*.test.*',
        '**/dist/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@newo-dsl/analyzer': path.resolve(__dirname, 'packages/dsl-analyzer/src/index.ts'),
      '@newo-dsl/data': path.resolve(__dirname, 'packages/dsl-data/src/index.ts'),
    },
  },
});
