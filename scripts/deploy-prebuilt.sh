#!/bin/bash

################################################################################
# Deploy Pre-Built Docker Image to Production
#
# This script deploys a pre-built Docker image to the production server.
# The image is built locally and pushed to the server via Docker save/load.
#
# Usage:
#   ./scripts/deploy-prebuilt.sh [-y]
#
# Prerequisites:
#   1. Run ./scripts/build-for-docker.sh first
#   2. SSH access to production server
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
IMAGE_NAME="astralis-nextjs:latest"
IMAGE_FILE="/tmp/astralis-nextjs.tar"

print_step() {
  echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
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
  echo -e "${GREEN}Astralis One - Deploy Pre-Built Image${NC}"
  echo "======================================"
  echo ""

  # Verify image exists
  print_step "Verifying Docker image..."
  if ! docker images "$IMAGE_NAME" --format "{{.Repository}}" | grep -q "astralis-nextjs"; then
    print_error "Image not found: $IMAGE_NAME"
    print_error "Run ./scripts/build-for-docker.sh first"
    exit 1
  fi
  print_success "Image found"

  # Export image to tar file
  print_step "Exporting Docker image to tar file..."
  docker save -o "$IMAGE_FILE" "$IMAGE_NAME"
  IMAGE_SIZE=$(du -h "$IMAGE_FILE" | cut -f1)
  print_success "Image exported ($IMAGE_SIZE)"

  # Test server connection
  print_step "Testing server connection..."
  if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo connected" &>/dev/null; then
    print_error "Cannot connect to server: $SERVER_HOST"
    rm -f "$IMAGE_FILE"
    exit 1
  fi
  print_success "Server reachable"

  confirm "Deploy to production server?"

  # Transfer image to server
  print_step "Transferring image to server (this may take a few minutes)..."
  scp -i "$SSH_KEY" "$IMAGE_FILE" "$SERVER_USER@$SERVER_HOST:/tmp/"
  print_success "Transfer complete"

  # Load image on server
  print_step "Loading image on server..."
  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "docker load -i /tmp/astralis-nextjs.tar && rm /tmp/astralis-nextjs.tar"
  print_success "Image loaded"

  # Pull latest code (for docker-compose.yml, .env, etc.)
  print_step "Updating configuration files..."
  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && git pull origin main"
  print_success "Configuration updated"

  # Restart containers
  print_step "Restarting containers..."
  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up -d"
  print_success "Containers restarted"

  # Wait for services
  print_step "Waiting for services to be ready..."
  sleep 15

  # Check status
  print_step "Checking deployment status..."
  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && docker-compose -f docker-compose.prod.yml ps"

  # Test application
  print_step "Testing application..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST" || echo "000")
  if echo "$HTTP_CODE" | grep -q "200\|301\|302"; then
    print_success "Application responding (HTTP $HTTP_CODE)"
  else
    print_warning "Application may not be responding (HTTP $HTTP_CODE)"
  fi

  # Cleanup
  rm -f "$IMAGE_FILE"
  print_success "Cleanup complete"

  echo ""
  echo -e "${GREEN}Deployment completed!${NC}"
  echo "Application: http://$SERVER_HOST"
  echo ""
  echo "Monitor logs: ssh $SERVER_USER@$SERVER_HOST 'cd $SERVER_PATH && docker-compose -f docker-compose.prod.yml logs -f'"
}

main "$@"
