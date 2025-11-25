#!/bin/bash

################################################################################
# Astralis One - Container Transfer Deployment
#
# Builds the Docker image locally, transfers it to the server, and deploys it
# Usage: ./scripts/deploy-container.sh [-y]
################################################################################

set -euo pipefail

AUTO_CONFIRM=false
while getopts "y" opt; do
  case $opt in
    y) AUTO_CONFIRM=true ;;
    *) ;;
  esac
done

# Config
IMAGE_NAME="astralis-app:latest"
TARBALL="astralis-app.tar.gz"
SSH_KEY="$HOME/.ssh/id_ed25519"
SERVER_USER="root"
SERVER_HOST="137.184.31.207"
SERVER_DIR="/home/deploy/astralis-nextjs"
REMOTE_TARBALL="/home/deploy/$TARBALL"

info() {
  echo -e "\033[0;34m▶ $1\033[0m"
}

success() {
  echo -e "\033[0;32m✓ $1\033[0m"
}

error() {
  echo -e "\033[0;31m✗ $1\033[0m" >&2
}

confirm() {
  if [ "$AUTO_CONFIRM" = true ]; then
    info "Auto-confirmed: $1"
    return 0
  fi
  read -p "$(echo -e \033[1;33m$1 [y/N]:\033[0m) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    error "Deployment cancelled"
    exit 1
  fi
}

cleanup_local() {
  if [ -f "$TARBALL" ]; then
    rm "$TARBALL"
  fi
}

trap cleanup_local EXIT

info "Building Docker image locally..."
docker build -t "$IMAGE_NAME" -f Dockerfile.nextjs .
success "Image built: $IMAGE_NAME"

info "Packaging image into tarball..."
docker save "$IMAGE_NAME" | gzip > "$TARBALL"
success "Tarball created: $TARBALL"

info "Testing server connection..."
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo connected" &>/dev/null; then
  error "Cannot connect to $SERVER_HOST"
  exit 1
fi
success "Server reachable"

confirm "Deploy $IMAGE_NAME to $SERVER_HOST?"

info "Transferring image tarball to server..."
scp -i "$SSH_KEY" "$TARBALL" "$SERVER_USER@$SERVER_HOST:$REMOTE_TARBALL"
success "Tarball uploaded to $REMOTE_TARBALL"

info "Loading image and restarting containers on server..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" <<-EOF
  set -e
  cd "$SERVER_DIR"

  echo "Loading Docker image..."
  gunzip -c "$REMOTE_TARBALL" | docker load

  echo "Starting containers..."
  docker compose -f docker-compose.prod.yml up -d

  echo "Cleaning up uploaded tarball..."
  rm -f "$REMOTE_TARBALL"

  pm2 restart ecosystem.docker.config.js
  sys

EOF

success "Deployment complete"
