# Contributing to Newo NSL Language Server

This project is maintained by the Newo AI engineering team. Contributions are limited to authorized team members.

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- VS Code or Cursor (for extension development)

### Getting Started

```bash
git clone https://github.com/newo-ai/newo-nsl-lsp.git
cd newo-nsl-lsp
npm install
npm run build
```

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `feature/*` | New features and enhancements |
| `fix/*` | Bug fixes |
| `chore/*` | Maintenance and tooling updates |

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(analyzer): add support for nested skill calls
fix(lsp-server): resolve completion crash on empty files
docs(readme): update architecture diagram
chore(deps): bump typescript to 5.4
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `refactor` | Code restructuring without behavior change |
| `test` | Adding or updating tests |
| `chore` | Tooling, dependencies, configuration |
| `perf` | Performance improvement |

### Scopes

Use the package name as scope: `analyzer`, `lsp-server`, `template-lint`, `dsl-spec`, `vscode-ext`, `deps`.

## Pull Request Process

1. Create a feature or fix branch from `main`
2. Make your changes with clear, descriptive commits
3. Ensure `npm run build` succeeds with no errors
4. Run `npm run lint:templates` against sample projects
5. Test the VS Code extension manually if UI-related
6. Open a PR against `main` with a clear description
7. Request review from a code owner

## Code Style

- TypeScript for all new packages (avoid plain JS for new code)
- Strict TypeScript - no `any` unless absolutely necessary
- Use the shared `tsconfig.json` as a base
- Follow existing patterns in each package

## Testing

```bash
# Run all tests
npm test

# Lint templates
npm run lint:templates -- ./path/to/templates

# Manual extension testing
cd vscode-extension
# Press F5 in VS Code to launch Extension Development Host
```

## Release Process

### Version Bumping

1. Update the version in root `package.json`
2. Run `npm run version:sync` to propagate to all core packages
3. Commit: `chore(deps): bump version to X.Y.Z`

### Creating a Release

1. Ensure all tests pass: `npm test`
2. Build production extension: `npm run build`
3. Tag the release: `git tag v0.3.0` (or `v0.3.0-beta.1` for pre-releases)
4. Push the tag: `git push origin v0.3.0`
5. The `release.yml` workflow will automatically:
   - Build and test
   - Package the VSIX
   - Create a GitHub Release with the VSIX attached
   - Publish to VS Code Marketplace (if `VSCE_PAT` secret is set)
   - Publish to Open VSX (if `OVSX_PAT` secret is set)

### Repository Secrets

For automated publishing, configure these secrets in the repository settings:

| Secret | Purpose | How to Obtain |
|--------|---------|---------------|
| `VSCE_PAT` | VS Code Marketplace publishing | [Create a PAT](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token) |
| `OVSX_PAT` | Open VSX Registry publishing | [Create a token](https://open-vsx.org/user-settings/tokens) |

Both secrets are optional. Without them, the workflow will still create GitHub releases with VSIX artifacts.

## Questions?

Reach out to the SuperAgent team on Slack or open an issue in this repository.
