# Publishing Guide

Instructions for publishing the Newo DSL extension to VS Code Marketplace and Open VSX Registry.

## Prerequisites

```bash
npm install -g @vscode/vsce ovsx
```

## Setup

### 1. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual tokens
```

### 2. Get Tokens

#### VS Code Marketplace (VSCE_PAT)

1. Go to [Azure DevOps](https://dev.azure.com)
2. Sign in with your Microsoft account
3. Profile icon -> **Personal access tokens** -> **+ New Token**
4. Configure:
   - **Name**: `vscode-marketplace`
   - **Organization**: All accessible organizations
   - **Expiration**: up to 1 year
   - **Scopes**: Custom defined -> **Marketplace** -> **Manage**
5. Copy the token

#### Open VSX (OVSX_PAT)

1. Go to [Open VSX](https://open-vsx.org)
2. Sign in with Eclipse Foundation account
3. Go to [Token Settings](https://open-vsx.org/user-settings/tokens)
4. **Generate New Token** and copy it

## Publishing

### Build and Test Locally

```bash
npm run build:prod
npm run package
code --install-extension newo-dsl-*.vsix
```

### Publish to Both Marketplaces

```bash
source .env
./publish.sh patch    # or: minor, major
```

### Publish Individually

```bash
source .env

# VS Code Marketplace
vsce publish -p $VSCE_PAT

# Open VSX
ovsx publish -p $OVSX_PAT
```

## Version Management

```bash
# Increment and publish
vsce publish patch -p $VSCE_PAT   # 0.2.0 -> 0.2.1
vsce publish minor -p $VSCE_PAT   # 0.2.0 -> 0.3.0
vsce publish major -p $VSCE_PAT   # 0.2.0 -> 1.0.0
```

## Marketplace Links

| Resource | URL |
|----------|-----|
| VS Code Marketplace | https://marketplace.visualstudio.com/items?itemName=Newo.newo-dsl |
| Open VSX Registry | https://open-vsx.org/extension/Newo/newo-dsl |
| VS Code Admin | https://marketplace.visualstudio.com/manage/publishers/Newo |
| Open VSX Settings | https://open-vsx.org/user-settings/namespaces |

## Pre-publish Checklist

- [ ] Version updated in `package.json`
- [ ] `CHANGELOG.md` updated with changes
- [ ] Build and test locally: `npm run build:prod && npm run package`
- [ ] Test the `.vsix` file in VS Code/Cursor
- [ ] Required files present: `README.md`, `LICENSE`, `CHANGELOG.md`, `icon.png`
- [ ] Tokens are valid and not expired

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Publisher not found" | Ensure `publisher` in `package.json` matches your publisher ID (case-sensitive) |
| Token expired | Regenerate at dev.azure.com (max 1 year expiry) |
| Verification pending | New extensions take 5-30 min on VS Code Marketplace; Open VSX is instant |
| Version exists | Cannot republish same version - increment first |
