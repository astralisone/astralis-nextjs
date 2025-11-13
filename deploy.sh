#!/bin/bash

###############################################################################
# Astralis Deployment Script
#
# This script automates the deployment of both backend and frontend applications
#
# Usage:
#   ./deploy.sh              # Deploy both frontend and backend
#   ./deploy.sh frontend     # Deploy frontend only
#   ./deploy.sh backend      # Deploy backend only
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/home/deploy/projects/astralis-agency-server"
FRONTEND_DIR="/home/deploy/projects/astralis-nextjs"
BACKUP_DIR="/home/deploy/backups"

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

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to deploy backend
deploy_backend() {
    print_header "Deploying Backend"

    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory not found: $BACKEND_DIR"
        return 1
    fi

    cd "$BACKEND_DIR"

    print_info "Pulling latest changes..."
    git fetch origin
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})

    if [ $LOCAL = $REMOTE ]; then
        print_warning "Already up-to-date, no changes to deploy"
    else
        print_info "New changes detected, deploying..."
        git pull origin main
    fi

    print_info "Installing dependencies..."
    if [ -f "yarn.lock" ]; then
        yarn install --production=false
    else
        npm install
    fi

    print_info "Running database migrations..."
    npx prisma migrate deploy
    npx prisma generate

    print_info "Building backend..."
    if [ -f "yarn.lock" ]; then
        yarn build
    else
        npm run build
    fi

    print_info "Restarting backend with PM2..."
    pm2 restart astralis-backend

    print_success "Backend deployment completed!"
}

# Function to deploy frontend
deploy_frontend() {
    print_header "Deploying Frontend"

    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Frontend directory not found: $FRONTEND_DIR"
        return 1
    fi

    cd "$FRONTEND_DIR"

    print_info "Pulling latest changes..."
    git fetch origin
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})

    if [ $LOCAL = $REMOTE ]; then
        print_warning "Already up-to-date, no changes to deploy"
    else
        print_info "New changes detected, deploying..."
        git pull origin main
    fi

    print_info "Installing dependencies..."
    npm install

    print_info "Building Next.js application..."
    npm run build

    print_info "Restarting frontend with PM2..."
    pm2 restart astralis-frontend

    print_success "Frontend deployment completed!"
}

# Function to backup database
backup_database() {
    print_header "Creating Database Backup"

    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/astralis_db_$TIMESTAMP.sql"

    print_info "Backing up database..."
    pg_dump -U astralis_user astralis_db > "$BACKUP_FILE"

    print_info "Compressing backup..."
    gzip "$BACKUP_FILE"

    print_success "Database backed up to: ${BACKUP_FILE}.gz"

    # Keep only last 7 days of backups
    print_info "Cleaning old backups (keeping last 7 days)..."
    find "$BACKUP_DIR" -name "astralis_db_*.sql.gz" -mtime +7 -delete
}

# Function to show deployment status
show_status() {
    print_header "Deployment Status"

    print_info "PM2 Process Status:"
    pm2 status

    echo ""
    print_info "System Resources:"
    free -h
    df -h | grep -E "Filesystem|/$"

    echo ""
    print_info "Recent Logs (last 20 lines):"
    pm2 logs --lines 20 --nostream
}

# Function to run health checks
health_check() {
    print_header "Running Health Checks"

    print_info "Checking backend health..."
    if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
    fi

    print_info "Checking frontend..."
    if curl -f -s http://localhost:3001 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend health check failed"
    fi

    print_info "Checking Nginx..."
    if sudo systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
    else
        print_error "Nginx is not running"
    fi

    print_info "Checking PostgreSQL..."
    if sudo systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL is running"
    else
        print_error "PostgreSQL is not running"
    fi
}

# Main execution
main() {
    print_header "🚀 Astralis Deployment Script"

    # Check if running as correct user
    if [ "$USER" != "deploy" ] && [ "$USER" != "root" ]; then
        print_warning "Consider running as 'deploy' user"
    fi

    case "${1:-all}" in
        backend)
            backup_database
            deploy_backend
            health_check
            show_status
            ;;
        frontend)
            deploy_frontend
            health_check
            show_status
            ;;
        all)
            backup_database
            deploy_backend
            deploy_frontend
            health_check
            show_status
            ;;
        status)
            show_status
            ;;
        health)
            health_check
            ;;
        backup)
            backup_database
            ;;
        *)
            echo "Usage: $0 {all|backend|frontend|status|health|backup}"
            echo ""
            echo "Commands:"
            echo "  all       - Deploy both backend and frontend (default)"
            echo "  backend   - Deploy backend only"
            echo "  frontend  - Deploy frontend only"
            echo "  status    - Show deployment status"
            echo "  health    - Run health checks"
            echo "  backup    - Backup database only"
            exit 1
            ;;
    esac

    print_success "Deployment script completed!"
}

# Run main function
main "$@"
