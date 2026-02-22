#!/usr/bin/env node
/**
 * Version Sync Script
 *
 * Reads the version from root package.json and updates the core trio packages:
 * - packages/dsl-analyzer/package.json
 * - packages/dsl-lsp-server/package.json
 * - packages/dsl-data/package.json
 * - vscode-extension/package.json
 *
 * Tools (template-lint, dsl-spec) version independently.
 *
 * Usage:
 *   node scripts/sync-versions.js
 *   node scripts/sync-versions.js --check  (dry-run, exits 1 if out of sync)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');

// Read root version
const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const targetVersion = rootPkg.version;

// Packages that share the root version
const syncTargets = [
  'packages/dsl-analyzer/package.json',
  'packages/dsl-lsp-server/package.json',
  'packages/dsl-data/package.json',
  'vscode-extension/package.json',
];

let outOfSync = false;

for (const relPath of syncTargets) {
  const fullPath = path.join(ROOT, relPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`  skip  ${relPath} (not found)`);
    continue;
  }

  const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const currentVersion = pkg.version;

  if (currentVersion === targetVersion) {
    console.log(`  ok    ${relPath} @ ${currentVersion}`);
    continue;
  }

  outOfSync = true;

  if (CHECK_ONLY) {
    console.log(`  DIFF  ${relPath}: ${currentVersion} -> ${targetVersion}`);
  } else {
    pkg.version = targetVersion;

    // Also update internal dependency versions if they reference core packages
    const internalDeps = ['@newo-dsl/analyzer', '@newo-dsl/lsp-server', '@newo-dsl/data'];
    for (const depName of internalDeps) {
      if (pkg.dependencies?.[depName]) {
        pkg.dependencies[depName] = `^${targetVersion}`;
      }
    }

    fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`  sync  ${relPath}: ${currentVersion} -> ${targetVersion}`);
  }
}

console.log(`\nRoot version: ${targetVersion}`);

if (CHECK_ONLY && outOfSync) {
  console.log('\nVersions are out of sync. Run "npm run version:sync" to fix.');
  process.exit(1);
} else if (!outOfSync) {
  console.log('All versions in sync.');
}
