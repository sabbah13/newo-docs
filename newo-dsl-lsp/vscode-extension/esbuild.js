const esbuild = require('esbuild');
const path = require('path');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * Build configuration for the VS Code extension client
 */
const extensionConfig = {
  entryPoints: ['./src/extension.ts'],
  bundle: true,
  outfile: './dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: !production,
  minify: production,
  treeShaking: true,
};

/**
 * Build configuration for the LSP server
 * Server is bundled separately and runs as a separate Node process
 */
const serverConfig = {
  entryPoints: ['../packages/dsl-lsp-server/src/server.ts'],
  bundle: true,
  outfile: './dist/server.js',
  external: [],
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  sourcemap: !production,
  minify: production,
  treeShaking: true,
  // Resolve workspace packages from source
  alias: {
    '@newo-dsl/analyzer': path.resolve(__dirname, '../packages/dsl-analyzer/src/index.ts'),
    '@newo-dsl/data': path.resolve(__dirname, '../packages/dsl-data/src/index.ts'),
  },
};

async function build() {
  try {
    if (watch) {
      // Watch mode for development
      const extensionCtx = await esbuild.context(extensionConfig);
      const serverCtx = await esbuild.context(serverConfig);

      await Promise.all([
        extensionCtx.watch(),
        serverCtx.watch(),
      ]);

      console.log('[watch] Build started - watching for changes...');
    } else {
      // Production build
      const startTime = Date.now();

      await Promise.all([
        esbuild.build(extensionConfig),
        esbuild.build(serverConfig),
      ]);

      const duration = Date.now() - startTime;
      console.log(`[build] Build completed in ${duration}ms`);
      console.log(`[build] Extension: dist/extension.js`);
      console.log(`[build] Server: dist/server.js`);
    }
  } catch (err) {
    console.error('[build] Build failed:', err);
    process.exit(1);
  }
}

build();
