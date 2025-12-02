#!/bin/bash

################################################################################
# Astralis One - Docker Image Deployment Script
#
# Builds Docker image locally, exports as tarball, transfers to production
# server, and deploys on /mnt volume with Docker
#
# Usage: ./scripts/deploy-docker.sh [-y]
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
SERVER_PASSWORD="5t4rrCl0ud"
SERVER_PATH="/mnt/volume_nyc1_01/astralis-nextjs"
IMAGE_NAME="astralis-nextjs-app"
IMAGE_TAG="latest"
EXPORT_DIR="./build"
TARBALL_NAME="astralis-nextjs-${IMAGE_TAG}.tar.gz"

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

cleanup() {
  print_step "Cleaning up temporary files..."
  rm -rf "$EXPORT_DIR"
}

trap cleanup EXIT

main() {
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}Astralis One - Docker Image Deployment${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""

  # Check if sshpass is installed
  if ! command -v sshpass &> /dev/null; then
    print_error "sshpass not found. Installing..."
    brew install hudochenkov/sshpass/sshpass
  fi

  # Step 1: Build Docker image locally
  print_step "Step 1: Building Docker image locally..."
  confirm "Build Docker image ${IMAGE_NAME}:${IMAGE_TAG}?"

  docker build --platform linux/amd64 -t "${IMAGE_NAME}:${IMAGE_TAG}" -f Dockerfile.nextjs .
  print_success "Docker image built successfully"

  # Step 2: Export image to tarball
  print_step "Step 2: Exporting Docker image to tarball..."
  mkdir -p "$EXPORT_DIR"

  docker save "${IMAGE_NAME}:${IMAGE_TAG}" | gzip > "${EXPORT_DIR}/${TARBALL_NAME}"
  print_success "Image exported to ${EXPORT_DIR}/${TARBALL_NAME}"

  # Show file size
  SIZE=$(du -h "${EXPORT_DIR}/${TARBALL_NAME}" | cut -f1)
  print_step "Tarball size: ${SIZE}"

  # Step 3: Test server connection
  print_step "Step 3: Testing server connection..."
  if ! sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo connected" &>/dev/null; then
    print_error "Cannot connect to server: $SERVER_HOST"
    exit 1
  fi
  print_success "Server reachable"

  # Step 4: Create deployment directory on /mnt volume
  print_step "Step 4: Preparing deployment directory on /mnt volume..."
  sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "
    mkdir -p ${SERVER_PATH}
    mkdir -p ${SERVER_PATH}/images
  "
  print_success "Deployment directory ready: ${SERVER_PATH}"

  # Step 5: Transfer tarball to server
  print_step "Step 5: Transferring image to server..."
  confirm "Transfer ${SIZE} tarball to production server?"

  sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no \
    "${EXPORT_DIR}/${TARBALL_NAME}" \
    "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/images/"
  print_success "Tarball transferred successfully"

  # Step 6: Transfer docker-compose and environment files
  print_step "Step 6: Transferring configuration files..."

  # Transfer docker-compose.prod.yml
  sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no \
    docker-compose.prod.yml \
    "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"

  # Transfer .env if it exists
  if [ -f .env ]; then
    sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no \
      .env \
      "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/.env.production"
  fi

  print_success "Configuration files transferred"

  # Step 7: Load image and deploy on server
  print_step "Step 7: Loading Docker image on server..."
  sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "
    cd ${SERVER_PATH}

    echo '=== Loading Docker image ==='
    gunzip -c images/${TARBALL_NAME} | docker load

    echo ''
    echo '=== Verifying image ==='
    docker images | grep astralis-nextjs-app
  "
  print_success "Docker image loaded"

  # Step 8: Update docker-compose to use /mnt volumes
  print_step "Step 8: Configuring docker-compose for /mnt volumes..."
  sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "
    cd ${SERVER_PATH}

    # Update docker-compose.prod.yml to use absolute paths for volumes
    cat > docker-compose.volumes.yml <<'EOF'
# Volume overrides for /mnt deployment
version: '3.8'

volumes:
  postgres-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ${SERVER_PATH}/volumes/postgres-data
  redis-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ${SERVER_PATH}/volumes/redis-data
  n8n-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ${SERVER_PATH}/volumes/n8n-data
EOF

    # Create volume directories
    mkdir -p volumes/postgres-data volumes/redis-data volumes/n8n-data
    chmod 700 volumes/postgres-data volumes/n8n-data
  "
  print_success "Volume configuration complete"

  # Step 9: Stop existing containers and deploy
  print_step "Step 9: Deploying containers..."
  confirm "Stop existing containers and start new deployment?"

  sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "
    cd ${SERVER_PATH}

    echo '=== Stopping existing containers ==='
    docker compose -f docker-compose.prod.yml down || true

    echo ''
    echo '=== Starting new containers ==='
    SERVER_PATH=${SERVER_PATH} docker compose -f docker-compose.prod.yml up -d

    echo ''
    echo '=== Container status ==='
    docker compose -f docker-compose.prod.yml ps
  "
  print_success "Containers deployed"

  # Step 10: Wait for services to be ready
  print_step "Step 10: Waiting for services to be healthy..."
  sleep 15

  sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "
    cd ${SERVER_PATH}
    docker compose -f docker-compose.prod.yml ps
  "

  # Step 11: Test application
  print_step "Step 11: Testing application health..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://${SERVER_HOST}:3001/api/health" || echo "000")
  if echo "$HTTP_CODE" | grep -q "200"; then
    print_success "Application responding (HTTP $HTTP_CODE)"
  else
    print_warning "Application may not be responding (HTTP $HTTP_CODE)"
    print_step "Checking logs..."
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "
      cd ${SERVER_PATH}
      docker compose -f docker-compose.prod.yml logs --tail=50 app
    "
  fi

  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}Deployment Summary${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo "Deployment Path: ${SERVER_PATH}"
  echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
  echo "Tarball Size: ${SIZE}"
  echo ""
  echo "Application: http://${SERVER_HOST}:3001"
  echo "Health Check: http://${SERVER_HOST}:3001/api/health"
  echo "n8n: http://${SERVER_HOST}:5678"
  echo ""
  echo -e "${GREEN}Deployment completed!${NC}"
}

main "$@"
