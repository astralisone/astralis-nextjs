#!/bin/bash

################################################################################
# Astralis One - Container Deployment Script
#
# Deploys Docker containers to production server
# Usage: ./scripts/deploy.sh [-y]
################################################################################

set -e

# Parse flags
AUTO_CONFIRM=false
while getopts "y" opt; do
  case $opt in
    y) AUTO_CONFIRM=true ;;
    *) ;;
  esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SERVER_USER="root"
SERVER_HOST="137.184.31.207"
SERVER_PATH="/home/deploy/astralis-nextjs"
SSH_KEY="$HOME/.ssh/id_ed25519"

print_step() {
  echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

confirm() {
  if [ "$AUTO_CONFIRM" = true ]; then
    print_step "Auto-confirmed: $1"
    return 0
  fi
  read -p "$(echo -e ${YELLOW}$1 [y/N]:${NC}) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled"
    exit 1
  fi
}

main() {
  echo -e "${GREEN}Astralis One - Container Deployment${NC}"
  echo "=================================="

  print_step "Testing server connection..."
  if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo connected" &>/dev/null; then
    print_error "Cannot connect to server: $SERVER_HOST"
    exit 1
  fi
  print_success "Server reachable"

  print_step "Pulling latest code on server..."
  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && git pull origin main"
  print_success "Code updated"

  print_step "Building and starting containers..."
  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && docker-compose -f docker-compose.prod.yml up -d --build"
  print_success "Containers deployed"

  print_step "Waiting for services to be ready..."
  sleep 10

  print_step "Checking deployment status..."
  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && docker-compose -f docker-compose.prod.yml ps"

  print_step "Testing application..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST" || echo "000")
  if echo "$HTTP_CODE" | grep -q "200\|301\|302"; then
    print_success "Application responding (HTTP $HTTP_CODE)"
  else
    print_warning "Application may not be responding (HTTP $HTTP_CODE)"
  fi

  echo ""
  echo -e "${GREEN}Deployment completed!${NC}"
  echo "Application: http://$SERVER_HOST"
  echo "n8n: http://$SERVER_HOST:5678"
}

main "$@"
