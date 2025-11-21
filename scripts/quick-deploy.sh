#!/bin/bash

################################################################################
# Quick Deploy Script
# Simplified wrapper for common deployment scenarios
################################################################################

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           ASTRALIS ONE - QUICK DEPLOY                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Get current branch to extract ticket number
BRANCH=$(git branch --show-current)
TICKET=$(echo "$BRANCH" | grep -oE '[A-Z]{2,}-[0-9]+' | head -1)

if [ -z "$TICKET" ]; then
    echo -e "${YELLOW}⚠ No ticket number found in branch name${NC}"
    echo -e "${YELLOW}  Current branch: $BRANCH${NC}"
    echo ""
    read -p "Enter ticket number (e.g., SIT-1234) or press Enter to skip: " TICKET
    echo ""
fi

# Get commit message
echo -e "${CYAN}What changes did you make?${NC}"
echo "Examples:"
echo "  - add Phase 6 automation features"
echo "  - fix calendar sync bug"
echo "  - update booking email templates"
echo ""
read -p "Commit message: " MESSAGE

# Construct full commit message
if [ -n "$TICKET" ]; then
    FULL_MESSAGE="$TICKET $MESSAGE"
else
    FULL_MESSAGE="$MESSAGE"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Deploying with message:${NC}"
echo -e "${CYAN}$FULL_MESSAGE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Run full deployment script
./scripts/deploy.sh production "$FULL_MESSAGE"
