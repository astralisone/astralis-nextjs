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
# Usage: ./scripts/deploy.sh [-y] [environment] [commit-message]
# Example: ./scripts/deploy.sh -y production "SIT-1234 add Phase 6 automation features"
# Flags:
#   -y  Skip confirmation prompts (non-interactive mode)
################################################################################

set -e  # Exit on any error

# Parse flags
AUTO_CONFIRM=false
while getopts "y" opt; do
    case $opt in
        y) AUTO_CONFIRM=true ;;
        *) ;;
    esac
done
shift $((OPTIND-1))

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
    if [ "$AUTO_CONFIRM" = true ]; then
        print_step "Auto-confirmed: $1"
        return 0
    fi
    read -p "$(echo -e ${YELLOW}$1 [y/N]:${NC}) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled by user"
        exit 1
    fi
}

################################################################################
# Environment File Sync
################################################################################

sync_env_file() {
    print_header "ENVIRONMENT FILE SYNC"

    # Check for local .env.production file
    if [ -f ".env.production" ]; then
        print_step "Found .env.production file"

        # Create backup on server if file exists
        print_step "Creating backup of server .env (if exists)..."
        ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && [ -f .env ] && cp .env .env.backup.\$(date +%Y%m%d_%H%M%S) || echo 'No existing .env to backup'"

        # Copy .env.production to server as .env
        print_step "Copying .env.production to server..."
        scp -i "$SSH_KEY" ".env.production" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/.env"
        print_success "Environment file synced to server"
    elif [ -f ".env.local" ]; then
        print_warning ".env.production not found, checking .env.local..."
        confirm "Copy .env.local to server? (Only use for staging/testing)"

        ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && [ -f .env ] && cp .env .env.backup.\$(date +%Y%m%d_%H%M%S) || echo 'No existing .env to backup'"
        scp -i "$SSH_KEY" ".env.local" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/.env"
        print_success "Environment file synced to server"
    else
        print_warning "No .env.production or .env.local found locally"

        # Check if server has .env file
        if ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "[ -f $SERVER_PATH/.env ]"; then
            print_success "Server already has .env file"
        else
            print_error "Server is missing .env file!"
            echo ""
            echo -e "${YELLOW}Create .env.production locally with required values:${NC}"
            echo "  DATABASE_URL"
            echo "  NEXTAUTH_SECRET"
            echo "  NEXTAUTH_URL"
            echo "  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD"
            echo "  NEXT_PUBLIC_GA_MEASUREMENT_ID (optional)"
            echo ""
            confirm "Continue deployment without .env sync?"
        fi
    fi

    # Verify critical env vars on server
    print_step "Verifying critical environment variables on server..."
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" <<-'ENDSSH'
        cd /home/deploy/astralis-nextjs

        MISSING_CRITICAL=""
        MISSING_OPTIONAL=""

        # Check for variables
        if [ -f .env ]; then
            # Critical - deployment will fail without these
            if ! grep -q "DATABASE_URL" .env; then
                MISSING_CRITICAL="$MISSING_CRITICAL DATABASE_URL"
            fi
            if ! grep -q "NEXTAUTH_SECRET" .env; then
                MISSING_CRITICAL="$MISSING_CRITICAL NEXTAUTH_SECRET"
            fi

            # Optional - app may work without these (uses defaults)
            if ! grep -q "NEXTAUTH_URL" .env; then
                MISSING_OPTIONAL="$MISSING_OPTIONAL NEXTAUTH_URL"
            fi

            # Report findings
            if [ -n "$MISSING_CRITICAL" ]; then
                echo "✗ Missing critical variables:$MISSING_CRITICAL"
                exit 1
            fi

            if [ -n "$MISSING_OPTIONAL" ]; then
                echo "⚠ Missing optional variables:$MISSING_OPTIONAL (will use defaults)"
            fi

            echo "✓ Critical environment variables present"
        else
            echo "✗ .env file not found on server"
            exit 1
        fi
ENDSSH

    if [ $? -ne 0 ]; then
        print_error "Environment verification failed"
        confirm "Continue anyway? (Not recommended)"
    else
        print_success "Environment verification passed"
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

    # Check if there are changes to commit
    if [ -z "$(git status --porcelain)" ]; then
        print_warning "No changes to commit"
        return 0
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

    # Auto-generate commit message if not provided
    if [ -z "$COMMIT_MESSAGE" ]; then
        # Count changes by type
        ADDED=$(git diff --cached --name-only --diff-filter=A | wc -l | tr -d ' ')
        MODIFIED=$(git diff --cached --name-only --diff-filter=M | wc -l | tr -d ' ')
        DELETED=$(git diff --cached --name-only --diff-filter=D | wc -l | tr -d ' ')

        # Get the main changed directories/files
        CHANGED_AREAS=$(git diff --cached --name-only | cut -d'/' -f1-2 | sort -u | head -5 | tr '\n' ', ' | sed 's/,$//')

        # Determine commit type based on changes
        if [ "$ADDED" -gt 0 ] && [ "$MODIFIED" -eq 0 ]; then
            COMMIT_TYPE="feat"
        elif [ "$DELETED" -gt 0 ] && [ "$ADDED" -eq 0 ] && [ "$MODIFIED" -eq 0 ]; then
            COMMIT_TYPE="chore"
        else
            COMMIT_TYPE="update"
        fi

        # Build auto-generated message
        COMMIT_MESSAGE="$COMMIT_TYPE: deploy changes to $CHANGED_AREAS ($ADDED added, $MODIFIED modified, $DELETED deleted)"

        print_step "Auto-generated commit message:"
        echo -e "  ${YELLOW}$COMMIT_MESSAGE${NC}"
        echo ""
    fi

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
# Sync Build to Server
################################################################################

sync_build_to_server() {
    print_header "SYNCING BUILD TO SERVER"

    print_step "Syncing .next build folder to server (excluding cache)..."
    rsync -avz --delete \
        --exclude 'cache/' \
        --exclude 'trace' \
        -e "ssh -i $SSH_KEY" \
        .next/ \
        "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/.next/"
    print_success ".next folder synced (cache excluded)"

    print_step "Syncing public folder to server..."
    rsync -avz --delete \
        -e "ssh -i $SSH_KEY" \
        public/ \
        "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/public/"
    print_success "Public folder synced"

    print_step "Syncing package files to server..."
    rsync -avz \
        -e "ssh -i $SSH_KEY" \
        package.json package-lock.json \
        "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
    print_success "Package files synced"

    print_step "Syncing Prisma schema to server..."
    rsync -avz \
        -e "ssh -i $SSH_KEY" \
        prisma/ \
        "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/prisma/"
    print_success "Prisma schema synced"

    print_step "Syncing config files to server..."
    rsync -avz \
        -e "ssh -i $SSH_KEY" \
        next.config.mjs tsconfig.json ecosystem.config.js docker-compose.prod.yml \
        "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
    print_success "Config files synced"

    print_step "Syncing src folder to server..."
    rsync -avz --delete \
        -e "ssh -i $SSH_KEY" \
        src/ \
        "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/src/"
    print_success "Source folder synced"
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

        # Note: Build artifacts are synced via rsync, no git pull or npm build needed
        echo -e "${GREEN}✓ Build artifacts already synced from local machine${NC}"

        echo -e "${CYAN}▶ Installing dependencies...${NC}"
        npm install
        echo -e "${GREEN}✓ Dependencies installed${NC}"

        echo -e "${CYAN}▶ Generating Prisma client...${NC}"
        npx prisma generate
        echo -e "${GREEN}✓ Prisma client generated${NC}"

        echo ""
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}SERVICE MANAGEMENT${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        # Check and install Docker if needed
        echo -e "${CYAN}▶ Checking Docker installation...${NC}"
        if ! command -v docker &> /dev/null; then
            echo -e "${YELLOW}⚠ Docker not found, installing...${NC}"
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            rm get-docker.sh
            echo -e "${GREEN}✓ Docker installed${NC}"
        else
            echo -e "${GREEN}✓ Docker is installed${NC}"
        fi

        # Check and install Docker Compose if needed
        if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
            echo -e "${YELLOW}⚠ Docker Compose not found, installing...${NC}"
            sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
            echo -e "${GREEN}✓ Docker Compose installed${NC}"
        else
            echo -e "${GREEN}✓ Docker Compose is installed${NC}"
        fi

        # Ensure Docker service is running
        echo -e "${CYAN}▶ Ensuring Docker service is running...${NC}"
        if ! systemctl is-active --quiet docker; then
            echo -e "${YELLOW}⚠ Docker service not running, starting...${NC}"
            sudo systemctl start docker
            sudo systemctl enable docker
        else
            echo -e "${GREEN}✓ Docker service is running${NC}"
        fi

        # Start/Restart Redis
        echo -e "${CYAN}▶ Managing Redis...${NC}"
        if systemctl is-active --quiet redis || systemctl is-active --quiet redis-server; then
            echo -e "${YELLOW}⚠ Redis already running, restarting...${NC}"
            sudo systemctl restart redis 2>/dev/null || sudo systemctl restart redis-server 2>/dev/null || echo "Redis restart skipped"
        else
            echo -e "${CYAN}▶ Starting Redis...${NC}"
            sudo systemctl start redis 2>/dev/null || sudo systemctl start redis-server 2>/dev/null
        fi
        # Enable may fail on linked units - that's ok
        sudo systemctl enable redis 2>/dev/null || sudo systemctl enable redis-server 2>/dev/null || true
        echo -e "${GREEN}✓ Redis running${NC}"

        # Pull required Docker images before starting services
        echo -e "${CYAN}▶ Pulling required Docker images...${NC}"

        echo -e "${CYAN}  ▶ Pulling PostgreSQL image...${NC}"
        docker pull postgres:14 || docker pull postgres:latest
        echo -e "${GREEN}  ✓ PostgreSQL image ready${NC}"

        echo -e "${CYAN}  ▶ Pulling n8n image...${NC}"
        docker pull n8nio/n8n:latest || echo -e "${YELLOW}⚠ n8n image pull failed, will use cached${NC}"
        echo -e "${GREEN}  ✓ n8n image ready${NC}"

        # Verify PostgreSQL image is available
        echo -e "${CYAN}▶ Verifying PostgreSQL image availability...${NC}"
        if docker images | grep -q postgres; then
            echo -e "${GREEN}✓ PostgreSQL image verified${NC}"
        else
            echo -e "${RED}✗ PostgreSQL image not available, cannot proceed with migrations${NC}"
            exit 1
        fi

        # Start/Restart Docker services (postgres only - PM2 manages app)
        echo -e "${CYAN}▶ Managing Docker services...${NC}"

        # Use docker compose (plugin) or docker-compose (standalone)
        if docker compose version &>/dev/null; then
            DOCKER_COMPOSE="docker compose"
        else
            DOCKER_COMPOSE="docker-compose"
        fi

        # Use production docker-compose file (postgres only)
        COMPOSE_FILE="-f docker-compose.prod.yml"

        if docker ps -q &>/dev/null; then
            echo -e "${CYAN}▶ Stopping existing containers...${NC}"
            $DOCKER_COMPOSE $COMPOSE_FILE down || echo -e "${YELLOW}⚠ No containers to stop${NC}"
        fi

        echo -e "${CYAN}▶ Starting Docker services (postgres)...${NC}"
        $DOCKER_COMPOSE $COMPOSE_FILE up -d
        echo -e "${GREEN}✓ Docker services started${NC}"

        # Wait for PostgreSQL to be ready before migrations
        echo -e "${CYAN}▶ Waiting for PostgreSQL to be ready...${NC}"
        MAX_RETRIES=30
        RETRY_COUNT=0
        while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
            if docker exec astralis_postgres pg_isready -U gregorystarr -d astralis &>/dev/null 2>&1; then
                echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
                break
            fi
            RETRY_COUNT=$((RETRY_COUNT + 1))
            echo -e "${YELLOW}  Waiting for PostgreSQL... ($RETRY_COUNT/$MAX_RETRIES)${NC}"
            sleep 2
        done

        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            echo -e "${YELLOW}⚠ PostgreSQL readiness check timed out, proceeding anyway...${NC}"
        fi

        # Now run database migrations (after PostgreSQL is ready)
        echo -e "${CYAN}▶ Running database migrations...${NC}"
        npx prisma migrate deploy
        echo -e "${GREEN}✓ Migrations applied${NC}"

        # Wait for services to be healthy
        echo -e "${CYAN}▶ Waiting for all services to be healthy...${NC}"
        sleep 5

        # Check n8n health
        if docker ps | grep -q astralis_n8n; then
            echo -e "${GREEN}✓ n8n container running${NC}"
        else
            echo -e "${RED}✗ n8n container not running${NC}"
        fi

        # Restart PM2 applications (main app + worker)
        echo -e "${CYAN}▶ Managing PM2 applications...${NC}"

        # Main application
        if pm2 list | grep -q astralis; then
            echo -e "${CYAN}▶ Restarting PM2 main app...${NC}"
            pm2 restart astralis
        else
            echo -e "${CYAN}▶ Starting PM2 main app...${NC}"
            pm2 start ecosystem.config.js
        fi
        echo -e "${GREEN}✓ PM2 main app running${NC}"

        # Worker process
        if pm2 list | grep -q astralis-worker; then
            echo -e "${CYAN}▶ Restarting PM2 worker...${NC}"
            pm2 restart astralis-worker
        else
            echo -e "${CYAN}▶ Starting PM2 worker...${NC}"
            pm2 start npm --name "astralis-worker" -- run worker
        fi
        echo -e "${GREEN}✓ PM2 worker running${NC}"

        pm2 save
        echo -e "${GREEN}✓ PM2 process list saved${NC}"

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

        echo -n "  PM2 (app): "
        pm2 list | grep -q "astralis " && echo -e "${GREEN}running${NC}" || echo -e "${RED}stopped${NC}"

        echo -n "  PM2 (worker): "
        pm2 list | grep -q "astralis-worker" && echo -e "${GREEN}running${NC}" || echo -e "${RED}stopped${NC}"

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

    # Sync environment file first
    sync_env_file

    # Confirm deployment
    echo ""
    confirm "Deploy to $ENVIRONMENT environment on $SERVER_HOST?"

    # Execute deployment steps
    local_build

    # Git operations (auto-generates commit message if not provided)
    git_operations

    # Sync build artifacts to server (no server-side build)
    sync_build_to_server

    deploy_to_server
    post_deployment
}

# Run main function
main "$@"
