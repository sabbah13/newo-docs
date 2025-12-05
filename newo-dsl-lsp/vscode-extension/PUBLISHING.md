# Publishing Guide for Newo DSL Extension

This guide explains how to publish the Newo DSL extension to VS Code Marketplace and Open VSX Registry.

## Prerequisites

```bash
# Install publishing tools globally
npm install -g @vscode/vsce ovsx
```

## Setup

### 1. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your actual tokens
```

### 2. Get Your Tokens

#### VS Code Marketplace Token (VSCE_PAT)

1. Go to https://dev.azure.com
2. Sign in with your Microsoft account
3. Click your profile icon → **Personal access tokens**
4. Click **"+ New Token"**
5. Configure:
   - **Name**: `vscode-marketplace`
   - **Organization**: All accessible organizations
   - **Expiration**: Choose duration (max 1 year)
   - **Scopes**: Custom defined → **Marketplace** → Check **"Manage"**
6. Click **Create** and copy the token

#### Open VSX Token (OVSX_PAT)

1. Go to https://open-vsx.org
2. Sign in with Eclipse Foundation account
3. Go to https://open-vsx.org/user-settings/tokens
4. Click **"Generate New Token"**
5. Copy the token

## Publishing Commands

### Local Development (Install from Source)

```bash
# Build and package
npm run build
vsce package

# Install locally for testing
code --install-extension newo-dsl-0.1.0.vsix
```

### Publish to VS Code Marketplace Only

```bash
# Load environment variables
source .env

# Option 1: Using token directly
vsce publish -p $VSCE_PAT

# Option 2: Login first (interactive)
vsce login Newo
vsce publish
```

### Publish to Open VSX Only

```bash
# Load environment variables
source .env

# Publish
ovsx publish -p $OVSX_PAT
```

### Publish to Both Marketplaces

```bash
# Load environment variables
source .env

# Package first
vsce package

# Publish to VS Code Marketplace
vsce publish -p $VSCE_PAT

# Publish to Open VSX
ovsx publish -p $OVSX_PAT
```

## Version Management

### Increment Version and Publish

```bash
# Patch version: 0.1.0 → 0.1.1
vsce publish patch -p $VSCE_PAT
ovsx publish -p $OVSX_PAT

# Minor version: 0.1.0 → 0.2.0
vsce publish minor -p $VSCE_PAT
ovsx publish -p $OVSX_PAT

# Major version: 0.1.0 → 1.0.0
vsce publish major -p $VSCE_PAT
ovsx publish -p $OVSX_PAT

# Specific version
vsce publish 1.2.3 -p $VSCE_PAT
ovsx publish -p $OVSX_PAT
```

## Quick Publish Script

Add this to your shell profile or run directly:

```bash
#!/bin/bash
# publish.sh - Publish to both marketplaces

set -e

# Load tokens
source .env

# Get version type (patch, minor, major) or default to patch
VERSION_TYPE=${1:-patch}

echo "📦 Packaging extension..."
vsce package

echo "🚀 Publishing to VS Code Marketplace..."
vsce publish $VERSION_TYPE -p $VSCE_PAT

echo "🚀 Publishing to Open VSX..."
ovsx publish -p $OVSX_PAT

echo "✅ Published to both marketplaces!"
```

Usage:
```bash
chmod +x publish.sh
./publish.sh patch   # or minor, major
```

## Marketplace URLs

| Marketplace | URL |
|-------------|-----|
| VS Code Marketplace | https://marketplace.visualstudio.com/items?itemName=Newo.newo-dsl |
| Open VSX Registry | https://open-vsx.org/extension/Newo/newo-dsl |

## Management Portals

| Portal | URL |
|--------|-----|
| VS Code Marketplace Admin | https://marketplace.visualstudio.com/manage/publishers/Newo |
| Open VSX User Settings | https://open-vsx.org/user-settings/namespaces |

## Troubleshooting

### "Publisher not found" Error
- Ensure the `publisher` field in `package.json` matches your publisher ID exactly
- Check case sensitivity (e.g., `Newo` vs `newo`)

### Token Expired
- VS Code tokens expire (max 1 year) - regenerate at dev.azure.com
- Open VSX tokens don't expire by default

### Verification Pending
- New extensions take 5-30 minutes to verify on VS Code Marketplace
- Open VSX publishes instantly

### Version Already Exists
- You cannot republish the same version
- Increment the version number before publishing

## Pre-publish Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` with changes
- [ ] Build and test locally: `npm run build && vsce package`
- [ ] Test the .vsix file: `code --install-extension newo-dsl-X.Y.Z.vsix`
- [ ] Ensure all required files exist: README.md, LICENSE, CHANGELOG.md, icon.png
- [ ] Verify tokens are valid and not expired
