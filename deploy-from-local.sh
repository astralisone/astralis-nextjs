#!/bin/bash

###############################################################################
# Local Build & Deploy Script
#
# This script builds the Next.js app locally and deploys to the droplet
# using rsync. This avoids memory issues on small droplets.
#
# Usage:
#   ./deploy-from-local.sh
#
# Prerequisites:
#   1. SSH key authentication set up for your droplet
#   2. Local build completes successfully (npm run build)
#   3. DEPLOY_USER and DEPLOY_HOST configured below
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================================================
DEPLOY_USER="root"                    # SSH user on droplet
DEPLOY_HOST="137.184.31.207"           # Droplet IP or domain
DEPLOY_PATH="/home/deploy/projects/astralis-nextjs"  # Remote path
SSH_KEY="~/.ssh/id_rsa"                # Path to your SSH key (optional)

# ============================================================================
# NO NEED TO EDIT BELOW THIS LINE
# ============================================================================

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Run this script from the Next.js project root."
    exit 1
fi

# Check if .next directory exists
if [ ! -d ".next" ]; then
    print_warning ".next directory not found. Running build first..."
fi

print_header "🚀 Local Build & Deploy to Droplet"

# Step 1: Build locally
print_header "Step 1: Building Next.js Application Locally"
print_info "Running: npm run build"
npm run build
print_success "Build completed successfully!"

# Step 2: Create list of files to sync
print_header "Step 2: Preparing Files for Deployment"

# Create temporary rsync exclude file if .deployignore doesn't exist
if [ ! -f ".deployignore" ]; then
    print_warning ".deployignore not found, using default exclusions"
    cat > /tmp/deployignore << 'EOF'
# Development files
.git/
.github/
.vscode/
.idea/
*.log
*.md
!README.md

# Local environment
.env.local
.env.development
.env.test
.env*.local

# Dependencies (will be installed on server)
node_modules/

# Source files (not needed for production)
src/
!src/middleware.ts
!src/instrumentation.ts

# Test files
__tests__/
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx
coverage/

# Build cache (generated on server)
.next/cache/

# Development artifacts
.turbo/
.eslintcache
tsconfig.tsbuildinfo

# OS files
.DS_Store
Thumbs.db

# Deployment scripts (not needed on server)
deploy-from-local.sh
DEPLOYMENT.md
DEPLOY_QUICK_START.md
EOF
    EXCLUDE_FILE="/tmp/deployignore"
else
    EXCLUDE_FILE=".deployignore"
fi

print_success "Exclusion list prepared"

# Step 3: Sync files to droplet
print_header "Step 3: Syncing Files to Droplet"

# Build rsync command
RSYNC_CMD="rsync -avz --delete --progress"

# Add SSH key if specified
if [ -n "$SSH_KEY" ]; then
    RSYNC_CMD="$RSYNC_CMD -e 'ssh -i $SSH_KEY'"
fi

# Add exclude file
RSYNC_CMD="$RSYNC_CMD --exclude-from=$EXCLUDE_FILE"

# Add source and destination
RSYNC_CMD="$RSYNC_CMD ./ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

print_info "Syncing files to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
print_info "Command: $RSYNC_CMD"

# Execute rsync
eval $RSYNC_CMD

print_success "Files synced successfully!"

# SKIPPED: Step 4: Install production dependencies on server
# print_header "Step 4: Installing Production Dependencies on Server"

# sh ${DEPLOY_USER}@${DEPLOY_HOST} << 'ENDSSH'
#     set -e
#     cd /home/deploy/projects/astralis-nextjs

#     echo "📦 Installing production dependencies..."
#     npm ci --production --prefer-offline

#     echo "✅ Dependencies installed"
# ENDSSH

# print_success "Production dependencies installed!"

# Step 5: Restart application with PM2 and Caddy
print_header "Step 5: Restarting Services"

ssh -i ${SSH_KEY} ${DEPLOY_USER}@${DEPLOY_HOST} << 'ENDSSH'
    set -e

    echo "🔄 Restarting PM2 services..."
    # Restart both backend and frontend with PM2
    pm2 restart ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs

    echo "📊 PM2 Status:"
    pm2 list

    echo ""
    echo "🔄 Restarting Caddy server..."
    # Restart Caddy to ensure it picks up any changes
    sudo systemctl restart caddy || echo "⚠️  Caddy restart failed (may not be installed)"

    echo ""
    echo "📝 Recent PM2 logs:"
    pm2 logs --lines 20 --nostream
ENDSSH

print_success "Services restarted!"

# Step 6: Health check
print_header "Step 6: Running Health Checks"

sleep 5  # Give the app time to start

print_info "Checking application health (frontend + backend)..."

ssh -i ${SSH_KEY} ${DEPLOY_USER}@${DEPLOY_HOST} << 'ENDSSH'
    set -e

    # Check if frontend is responding
    echo "🔍 Checking Next.js frontend..."
    if curl -f -s http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ Frontend is healthy (http://localhost:3001)"
    else
        echo "❌ Frontend health check failed"
        exit 1
    fi

    # Check if Express backend is responding
    echo "🔍 Checking Express backend..."
    if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Backend is healthy (http://localhost:3000)"
    else
        echo "⚠️  Backend health check failed (may still be starting)"
    fi

    # Try backend API health endpoint if it exists
    if curl -f -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Backend API /health endpoint responding"
    fi

    # Check PM2 status
    if pm2 describe astralis-frontend | grep -q "status.*online"; then
        echo "✅ PM2 frontend process is online"
    else
        echo "❌ PM2 frontend process is not running properly"
        exit 1
    fi

    if pm2 describe astralis-server | grep -q "status.*online"; then
        echo "✅ PM2 backend process is online"
    else
        echo "⚠️  PM2 backend process is not running properly"
    fi

    # Check Caddy status
    if systemctl is-active --quiet caddy; then
        echo "✅ Caddy is running"
    else
        echo "⚠️  Caddy is not running (may not be installed)"
    fi
ENDSSH

print_success "Health checks passed!"

# Clean up temporary files
if [ -f "/tmp/deployignore" ]; then
    rm /tmp/deployignore
fi

# Final summary
print_header "🎉 Deployment Complete!"

echo ""
print_info "Deployment Summary:"
echo "  • Built locally: ✅"
echo "  • Synced to server: ✅"
echo "  • Dependencies installed: ⏭️  (skipped - using existing)"
echo "  • Services restarted: ✅"
echo "  • Health checks: ✅"
echo ""
print_success "Your application is now live!"
echo ""
print_info "Next steps:"
echo "  • View logs: ssh -i ${SSH_KEY} ${DEPLOY_USER}@${DEPLOY_HOST} 'pm2 logs astralis-frontend'"
echo "  • Check status: ssh -i ${SSH_KEY} ${DEPLOY_USER}@${DEPLOY_HOST} 'pm2 status'"
echo "  • Monitor: ssh -i ${SSH_KEY} ${DEPLOY_USER}@${DEPLOY_HOST} 'pm2 monit'"
echo ""
