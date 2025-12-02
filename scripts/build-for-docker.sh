#!/bin/bash

################################################################################
# Build Next.js Locally for Docker Production Deployment
#
# This script builds the Next.js application on your local machine where
# memory is abundant, then packages the pre-built artifacts into a minimal
# Docker image for production deployment.
#
# Usage:
#   ./scripts/build-for-docker.sh [--skip-build]
#
# Flags:
#   --skip-build  Skip the Next.js build step (use existing .next folder)
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SKIP_BUILD=false

# Parse flags
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

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

echo -e "${GREEN}Astralis One - Build for Docker Production${NC}"
echo "==========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  print_error "package.json not found. Run this script from the project root."
  exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  print_error "Node.js not found. Please install Node.js 20 or higher."
  exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  print_error "Node.js version 18+ required. Current: $(node -v)"
  exit 1
fi

# Clean previous build artifacts
if [ "$SKIP_BUILD" = false ]; then
  print_step "Cleaning previous build artifacts..."
  rm -rf .next
  print_success "Clean complete"

  # Install dependencies
  print_step "Installing dependencies..."
  if command -v yarn &> /dev/null; then
    yarn install --frozen-lockfile
  else
    npm ci
  fi
  print_success "Dependencies installed"

  # Generate Prisma Client
  print_step "Generating Prisma Client..."
  npx prisma generate
  print_success "Prisma Client generated"

  # Build Next.js application
  print_step "Building Next.js application (this may take several minutes)..."
  echo -e "${YELLOW}Build started at: $(date '+%Y-%m-%d %H:%M:%S')${NC}"

  # Build with optimized memory settings
  NODE_OPTIONS="--max-old-space-size=4096" npm run build

  print_success "Build complete at: $(date '+%Y-%m-%d %H:%M:%S')"
else
  print_warning "Skipping build (using existing .next folder)"
fi

# Verify standalone output exists
if [ ! -d ".next/standalone" ]; then
  print_error "Standalone output not found. Ensure output: 'standalone' is set in next.config.mjs"
  exit 1
fi

print_success "Standalone build verified"

# Build Docker image
print_step "Building Docker image..."
docker build \
  -f Dockerfile.prod \
  -t astralis-nextjs:latest \
  -t astralis-nextjs:$(git rev-parse --short HEAD 2>/dev/null || echo "local") \
  .

print_success "Docker image built"

# Show image info
echo ""
echo -e "${GREEN}Build Summary${NC}"
echo "=============="
docker images astralis-nextjs:latest --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
echo ""

print_success "Build complete!"
echo ""
echo "Next steps:"
echo "  1. Test locally:  docker-compose -f docker-compose.prod.yml up"
echo "  2. Deploy:        ./scripts/deploy-prebuilt.sh"
echo ""
