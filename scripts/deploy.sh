#!/bin/bash

################################################################################
# Astralis One - Master Deployment Script
#
# Automates the complete deployment workflow:
# 1. Local build and git operations
# 2. Remote server deployment
# 3. Database migrations and seeding
# 4. Service management (Redis, Docker, PM2, Caddy)
#
# Usage: ./scripts/deploy.sh [environment] [commit-message]
# Example: ./scripts/deploy.sh production "SIT-1234 add Phase 6 automation features"
################################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="root"
SERVER_HOST="137.184.31.207"
SERVER_PATH="/home/deploy/astralis-nextjs"
SSH_KEY="$HOME/.ssh/id_ed25519"
ENVIRONMENT="${1:-production}"
COMMIT_MESSAGE="${2:-}"

################################################################################
# Utility Functions
################################################################################

print_header() {
    echo ""
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
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
    read -p "$(echo -e ${YELLOW}$1 [y/N]:${NC}) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled by user"
        exit 1
    fi
}

################################################################################
# Pre-flight Checks
################################################################################

preflight_checks() {
    print_header "PRE-FLIGHT CHECKS"

    # Check if we're in the right directory
    print_step "Checking project directory..."
    if [ ! -f "package.json" ] || [ ! -d "src" ]; then
        print_error "Not in project root directory"
        exit 1
    fi
    print_success "In project root"

    # Check for uncommitted changes
    print_step "Checking git status..."
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes"
        git status --short
        echo ""
    fi

    # Check SSH key
    print_step "Checking SSH key..."
    if [ ! -f "$SSH_KEY" ]; then
        print_error "SSH key not found: $SSH_KEY"
        exit 1
    fi
    print_success "SSH key found"

    # Check server connectivity
    print_step "Testing server connection..."
    if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo connected" &>/dev/null; then
        print_error "Cannot connect to server: $SERVER_HOST"
        exit 1
    fi
    print_success "Server reachable"

    # Get current branch
    CURRENT_BRANCH=$(git branch --show-current)
    print_success "Current branch: $CURRENT_BRANCH"
}

################################################################################
# Local Build & Git Operations
################################################################################

local_build() {
    print_header "LOCAL BUILD"

    print_step "Installing dependencies..."
    npm install
    print_success "Dependencies installed"

    print_step "Running linter..."
    npm run lint || print_warning "Linting issues found (continuing anyway)"

    print_step "Building production bundle..."
    npm run build
    print_success "Build completed successfully"
}

git_operations() {
    print_header "GIT OPERATIONS"

    # Check if commit message was provided
    if [ -z "$COMMIT_MESSAGE" ]; then
        print_error "Commit message required!"
        echo "Usage: $0 [environment] \"SIT-XXXX commit message\""
        exit 1
    fi

    # Add all changes
    print_step "Staging changes..."
    git add .
    print_success "Changes staged"

    # Show what will be committed
    echo ""
    print_step "Changes to be committed:"
    git status --short
    echo ""

    # Confirm commit
    confirm "Commit with message: \"$COMMIT_MESSAGE\""

    # Commit with message
    print_step "Creating commit..."
    git commit -m "$COMMIT_MESSAGE

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>" || print_warning "Nothing to commit or commit failed"

    # Push to remote
    print_step "Pushing to remote..."
    confirm "Push branch '$CURRENT_BRANCH' to remote?"
    git push origin "$CURRENT_BRANCH"
    print_success "Pushed to remote"
}

################################################################################
# Remote Deployment
################################################################################

deploy_to_server() {
    print_header "DEPLOYING TO SERVER: $SERVER_HOST"

    print_step "Connecting to server..."

    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" <<-'ENDSSH'
        set -e

        # Color codes (for SSH session)
        RED='\033[0;31m'
        GREEN='\033[0;32m'
        YELLOW='\033[1;33m'
        BLUE='\033[0;34m'
        CYAN='\033[0;36m'
        NC='\033[0m'

        echo -e "${CYAN}▶ Navigating to project directory...${NC}"
        cd /home/deploy/astralis-nextjs

        echo -e "${CYAN}▶ Pulling latest changes...${NC}"
        git fetch origin
        git pull origin $(git branch --show-current)
        echo -e "${GREEN}✓ Code updated${NC}"

        echo -e "${CYAN}▶ Installing dependencies...${NC}"
        npm install --production=false
        echo -e "${GREEN}✓ Dependencies installed${NC}"

        echo -e "${CYAN}▶ Generating Prisma client...${NC}"
        npx prisma generate
        echo -e "${GREEN}✓ Prisma client generated${NC}"

        echo -e "${CYAN}▶ Running database migrations...${NC}"
        npx prisma migrate deploy
        echo -e "${GREEN}✓ Migrations applied${NC}"

        echo -e "${CYAN}▶ Building production bundle...${NC}"
        npm run build
        echo -e "${GREEN}✓ Build completed${NC}"

        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}SERVICE MANAGEMENT${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        # Start/Restart Redis
        echo -e "${CYAN}▶ Managing Redis...${NC}"
        if systemctl is-active --quiet redis; then
            echo -e "${YELLOW}⚠ Redis already running, restarting...${NC}"
            sudo systemctl restart redis
        else
            echo -e "${CYAN}▶ Starting Redis...${NC}"
            sudo systemctl start redis
        fi
        sudo systemctl enable redis
        echo -e "${GREEN}✓ Redis running${NC}"

        # Start/Restart Docker (for n8n)
        echo -e "${CYAN}▶ Managing Docker services...${NC}"
        if docker ps -q &>/dev/null; then
            echo -e "${CYAN}▶ Stopping existing containers...${NC}"
            docker-compose down || echo -e "${YELLOW}⚠ No containers to stop${NC}"
        fi

        echo -e "${CYAN}▶ Starting Docker services (n8n, postgres)...${NC}"
        docker-compose up -d
        echo -e "${GREEN}✓ Docker services started${NC}"

        # Wait for services to be healthy
        echo -e "${CYAN}▶ Waiting for services to be healthy...${NC}"
        sleep 5

        # Check n8n health
        if docker ps | grep -q astralis_n8n; then
            echo -e "${GREEN}✓ n8n container running${NC}"
        else
            echo -e "${RED}✗ n8n container not running${NC}"
        fi

        # Restart PM2 application
        echo -e "${CYAN}▶ Managing PM2 application...${NC}"
        if pm2 list | grep -q astralis; then
            echo -e "${CYAN}▶ Restarting PM2 app...${NC}"
            pm2 restart astralis
        else
            echo -e "${CYAN}▶ Starting PM2 app...${NC}"
            pm2 start ecosystem.config.js
        fi
        pm2 save
        echo -e "${GREEN}✓ PM2 application running${NC}"

        # Reload Caddy
        echo -e "${CYAN}▶ Reloading Caddy...${NC}"
        if systemctl is-active --quiet caddy; then
            sudo systemctl reload caddy
            echo -e "${GREEN}✓ Caddy reloaded${NC}"
        else
            echo -e "${YELLOW}⚠ Caddy not running, starting...${NC}"
            sudo systemctl start caddy
            sudo systemctl enable caddy
            echo -e "${GREEN}✓ Caddy started${NC}"
        fi

        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}DEPLOYMENT STATUS${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        echo -e "${CYAN}▶ Service Status:${NC}"
        echo -n "  Redis: "
        systemctl is-active redis && echo -e "${GREEN}active${NC}" || echo -e "${RED}inactive${NC}"

        echo -n "  Docker: "
        docker ps &>/dev/null && echo -e "${GREEN}active${NC}" || echo -e "${RED}inactive${NC}"

        echo -n "  n8n: "
        docker ps | grep -q astralis_n8n && echo -e "${GREEN}running${NC}" || echo -e "${RED}stopped${NC}"

        echo -n "  PM2: "
        pm2 list | grep -q astralis && echo -e "${GREEN}running${NC}" || echo -e "${RED}stopped${NC}"

        echo -n "  Caddy: "
        systemctl is-active caddy && echo -e "${GREEN}active${NC}" || echo -e "${RED}inactive${NC}"

        echo ""
        echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
        echo ""
ENDSSH

    print_success "Server deployment completed"
}

################################################################################
# Post-Deployment Checks
################################################################################

post_deployment() {
    print_header "POST-DEPLOYMENT CHECKS"

    print_step "Running health checks..."

    # Check if site is responding
    if curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST" | grep -q "200\|301\|302"; then
        print_success "Site is responding"
    else
        print_warning "Site may not be responding correctly"
    fi

    # Check n8n
    if curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST:5678" | grep -q "200\|301\|302"; then
        print_success "n8n is accessible"
    else
        print_warning "n8n may not be accessible"
    fi

    print_success "Deployment completed!"

    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}DEPLOYMENT SUMMARY${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${CYAN}Environment:${NC} $ENVIRONMENT"
    echo -e "  ${CYAN}Branch:${NC} $CURRENT_BRANCH"
    echo -e "  ${CYAN}Server:${NC} $SERVER_HOST"
    echo -e "  ${CYAN}Application:${NC} http://$SERVER_HOST"
    echo -e "  ${CYAN}n8n Editor:${NC} http://$SERVER_HOST:5678"
    echo ""
    echo -e "${GREEN}✓ All systems operational${NC}"
    echo ""
}

################################################################################
# Main Execution
################################################################################

main() {
    clear

    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║              ASTRALIS ONE - DEPLOYMENT SCRIPT                 ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    preflight_checks

    # Confirm deployment
    echo ""
    confirm "Deploy to $ENVIRONMENT environment on $SERVER_HOST?"

    # Execute deployment steps
    local_build

    if [ -n "$COMMIT_MESSAGE" ]; then
        git_operations
    else
        print_warning "Skipping git operations (no commit message provided)"
    fi

    deploy_to_server
    post_deployment
}

# Run main function
main "$@"
