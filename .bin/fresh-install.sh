#!/bin/bash

# Script to clean node_modules, .turbo, and dist folders from the monorepo

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting cleanup of node_modules, .turbo, and dist folders...${NC}"
echo ""

# Get the script's directory (workspace root)
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../"

# Count folders before deletion
NODE_MODULES_COUNT=$(find "$WORKSPACE_ROOT" -type d -name "node_modules" | wc -l | tr -d ' ')
TURBO_COUNT=$(find "$WORKSPACE_ROOT" -type d -name ".turbo" | wc -l | tr -d ' ')
DIST_COUNT=$(find "$WORKSPACE_ROOT" -type d -name "dist" | wc -l | tr -d ' ')

echo -e "Found:"
echo -e "  - ${YELLOW}$NODE_MODULES_COUNT${NC} node_modules folders"
echo -e "  - ${YELLOW}$TURBO_COUNT${NC} .turbo folders"
echo -e "  - ${YELLOW}$DIST_COUNT${NC} dist folders"
echo ""

# Ask for confirmation
read -p "Do you want to delete these folders? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Cleanup cancelled.${NC}"
    exit 0
fi

echo -e "${GREEN}Deleting folders...${NC}"
echo ""

# Delete node_modules folders
echo "Deleting node_modules folders..."
find "$WORKSPACE_ROOT" -type d -name "node_modules" -prune -exec rm -rf {} \;

# Delete .turbo folders
echo "Deleting .turbo folders..."
find "$WORKSPACE_ROOT" -type d -name ".turbo" -prune -exec rm -rf {} \;

# Delete dist folders
echo "Deleting dist folders..."
find "$WORKSPACE_ROOT" -type d -name "dist" -prune -exec rm -rf {} \;

# Delete dist folders
echo "Deleting dist folders..."
find "$WORKSPACE_ROOT" -type f -name "tsconfig.tsbuildinfo" -prune -exec rm -rf {} \;

echo ""
echo -e "${GREEN}✓ Cleanup complete!${NC}"


# Ask for confirmation
read -p "Do you want to install and build? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

pnpm i
pnpm build