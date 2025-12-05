#!/bin/bash
# Publish Newo DSL extension to VS Code Marketplace and Open VSX Registry
# Usage: ./publish.sh [patch|minor|major]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Create .env from .env.example and add your tokens"
    exit 1
fi

# Check tokens
if [ -z "$VSCE_PAT" ] || [ "$VSCE_PAT" = "your_azure_devops_personal_access_token_here" ]; then
    echo -e "${YELLOW}Warning: VSCE_PAT not configured. Skipping VS Code Marketplace.${NC}"
    SKIP_VSCE=true
fi

if [ -z "$OVSX_PAT" ] || [ "$OVSX_PAT" = "your_open_vsx_token_here" ]; then
    echo -e "${YELLOW}Warning: OVSX_PAT not configured. Skipping Open VSX.${NC}"
    SKIP_OVSX=true
fi

# Get version increment type
VERSION_TYPE=${1:-patch}

echo -e "${GREEN}📦 Building extension...${NC}"
npm run build

echo -e "${GREEN}📦 Packaging extension...${NC}"
vsce package

# Get the generated vsix filename
VSIX_FILE=$(ls -t *.vsix | head -1)
echo -e "${GREEN}✓ Created: $VSIX_FILE${NC}"

# Publish to VS Code Marketplace
if [ "$SKIP_VSCE" != true ]; then
    echo -e "${GREEN}🚀 Publishing to VS Code Marketplace...${NC}"
    vsce publish $VERSION_TYPE -p $VSCE_PAT
    echo -e "${GREEN}✓ Published to VS Code Marketplace${NC}"
else
    echo -e "${YELLOW}⏭ Skipped VS Code Marketplace${NC}"
fi

# Publish to Open VSX
if [ "$SKIP_OVSX" != true ]; then
    echo -e "${GREEN}🚀 Publishing to Open VSX Registry...${NC}"
    ovsx publish $VSIX_FILE -p $OVSX_PAT
    echo -e "${GREEN}✓ Published to Open VSX Registry${NC}"
else
    echo -e "${YELLOW}⏭ Skipped Open VSX Registry${NC}"
fi

echo ""
echo -e "${GREEN}✅ Publishing complete!${NC}"
echo ""
echo "Marketplace URLs:"
echo "  VS Code: https://marketplace.visualstudio.com/items?itemName=Newo.newo-dsl"
echo "  Open VSX: https://open-vsx.org/extension/Newo/newo-dsl"
