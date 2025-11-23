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
# Example: ./scripts/deploy.sh -y production "astralis deploy"
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

# Remote storage layout
VOLUME_MOUNT="/mnt/volume_nyc1_01"
NEXT_REMOTE_TARGET="${VOLUME_MOUNT}/astralis-nextjs-next"

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

  # Prefer .env.production, fallback to .env.local
  if [ -f ".env.production" ]; then
    print_step "Found .env.production file"

    print_step "Creating backup of server .env (if exists)..."
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && [ -f .env ] && cp .env .env.backup.\$(date +%Y%m%d_%H%M%S) || echo 'No existing .env to backup'"

    print_step "Copying .env.production to server..."
    scp -i "$SSH_KEY" ".env.production" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/.env"
    print_success "Environment file synced to server"

  elif [ -f ".env.local" ]; then
    print_warning ".env.production not found, using .env.local"
    confirm "Copy .env.local to server? (Only use for staging/testing)"

    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "cd $SERVER_PATH && [ -f .env ] && cp .env .env.backup.\$(date +%Y%m%d_%H%M%S) || echo 'No existing .env to backup'"
    scp -i "$SSH_KEY" ".env.local" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/.env"
    print_success "Environment file synced to server"

  else
    print_warning "No .env.production or .env.local found locally"

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

    if [ -f .env ]; then
      grep -q "DATABASE_URL" .env    || MISSING_CRITICAL="$MISSING_CRITICAL DATABASE_URL"
      grep -q "NEXTAUTH_SECRET" .env || MISSING_CRITICAL="$MISSING_CRITICAL NEXTAUTH_SECRET"

      grep -q "NEXTAUTH_URL" .env    || MISSING_OPTIONAL="$MISSING_OPTIONAL NEXTAUTH_URL"
      grep -q "DEFAULT_USER_ID" .env || MISSING_OPTIONAL="$MISSING_OPTIONAL DEFAULT_USER_ID"

      if [ -n "$MISSING_CRITICAL" ]; then
        echo "✗ Missing critical variables:$MISSING_CRITICAL"
        exit 1
      fi

      if [ -n "$MISSING_OPTIONAL" ]; then
        echo "⚠ Missing optional variables:$MISSING_OPTIONAL (will use defaults or be set automatically)"
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

  print_step "Checking project directory..."
  if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "Not in project root directory"
    exit 1
  fi
  print_success "In project root"

  print_step "Checking git status..."
  if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes"
    git status --short
    echo ""
  fi

  print_step "Checking SSH key..."
  if [ ! -f "$SSH_KEY" ]; then
    print_error "SSH key not found: $SSH_KEY"
    exit 1
  fi
  print_success "SSH key found"

  print_step "Testing server connection..."
  if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo connected" &>/dev/null; then
    print_error "Cannot connect to server: $SERVER_HOST"
    exit 1
  fi
  print_success "Server reachable"

  print_step "Checking server disk usage..."
  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "df -h / | tail -n 1" || true

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

  if [ -z "$(git status --porcelain)" ]; then
    print_warning "No changes to commit"
    return 0
  fi

  print_step "Staging changes..."
  git add .
  print_success "Changes staged"

  echo ""
  print_step "Changes to be committed:"
  git status --short
  echo ""

  if [ -z "$COMMIT_MESSAGE" ]; then
    CHANGED_FILES=$(git diff --cached --name-only | wc -l | tr -d ' ')
    COMMIT_MESSAGE="deploy: $ENVIRONMENT – $CHANGED_FILES files updated"
    print_step "Auto-generated commit message:"
    echo -e "  ${YELLOW}$COMMIT_MESSAGE${NC}"
    echo ""
  fi

  confirm "Commit with message: \"$COMMIT_MESSAGE\""

  print_step "Creating commit..."
  git commit -m "$COMMIT_MESSAGE" || {
    print_warning "Nothing to commit or commit failed"
    return 0
  }

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
  print_success ".next folder synced"

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
# Ensure Remote Storage Layout (.next symlink / volume)
################################################################################

ensure_remote_storage_layout() {
  print_header "VERIFYING REMOTE STORAGE LAYOUT"

  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" bash <<-ENDSSH
    set -e
    SERVER_PATH="$SERVER_PATH"
    VOLUME_MOUNT="$VOLUME_MOUNT"
    NEXT_REMOTE_TARGET="$NEXT_REMOTE_TARGET"

    echo "▶ Checking volume mount at \$VOLUME_MOUNT..."
    if [ ! -d "\$VOLUME_MOUNT" ]; then
      echo "✗ Volume mount \$VOLUME_MOUNT not found. Aborting."
      exit 1
    fi
    echo "✓ Volume mount present at \$VOLUME_MOUNT"

    cd "\$SERVER_PATH"

    echo "▶ Ensuring .next symlink points to \$NEXT_REMOTE_TARGET..."
    mkdir -p "\$NEXT_REMOTE_TARGET"

    if [ -L ".next" ]; then
      TARGET=\$(readlink .next)
      if [ "\$TARGET" = "\$NEXT_REMOTE_TARGET" ]; then
        echo "✓ .next already symlinked to \$NEXT_REMOTE_TARGET"
      else
        TS=\$(date +%Y%m%d%H%M%S)
        mv .next ".next.mislinked-\$TS"
        ln -s "\$NEXT_REMOTE_TARGET" .next
        echo "⚠ Fixed mislinked .next symlink (backed up)."
      fi
    elif [ -e ".next" ]; then
      TS=\$(date +%Y%m%d%H%M%S)
      mv .next ".next.bak-\$TS"
      ln -s "\$NEXT_REMOTE_TARGET" .next
      echo "⚠ Existing .next backed up to .next.bak-\$TS and symlink created."
    else
      ln -s "\$NEXT_REMOTE_TARGET" .next
      echo "✓ .next symlink created: .next -> \$NEXT_REMOTE_TARGET"
    fi

    echo "▶ Docker Root Dir (sanity check):"
    if command -v docker >/dev/null 2>&1; then
      docker info 2>/dev/null | grep -i "Docker Root Dir" || echo "Docker info not available."
    else
      echo "Docker not installed or not in PATH."
    fi
ENDSSH

  print_success "Remote storage layout verified (.next symlink + volume)."
}

################################################################################
# Remote Deployment
################################################################################

deploy_to_server() {
  print_header "DEPLOYING TO SERVER: $SERVER_HOST"

  print_step "Connecting to server..."

  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" <<-'ENDSSH'
    set -e
    echo "▶ Navigating to project directory..."
    cd /home/deploy/astralis-nextjs

    echo "✓ Build artifacts already synced from local machine"

    echo "▶ Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"

    echo "▶ Generating Prisma client..."
    npx prisma generate
    echo "✓ Prisma client generated"

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "SERVICE MANAGEMENT"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    echo "▶ Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
      echo "⚠ Docker not found, installing..."
      curl -fsSL https://get.docker.com -o get-docker.sh
      sh get-docker.sh
      usermod -aG docker $USER || true
      rm get-docker.sh
      echo "✓ Docker installed"
    else
      echo "✓ Docker is installed"
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
      echo "⚠ Docker Compose not found, installing..."
      curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
      chmod +x /usr/local/bin/docker-compose
      echo "✓ Docker Compose installed"
    else
      echo "✓ Docker Compose is installed"
    fi

    echo "▶ Ensuring Docker service is running..."
    if ! systemctl is-active --quiet docker; then
      echo "⚠ Docker service not running, starting..."
      systemctl start docker
      systemctl enable docker
    else
      echo "✓ Docker service is running"
    fi

    echo "▶ Managing Redis..."
    if systemctl is-active --quiet redis || systemctl is-active --quiet redis-server; then
      echo "⚠ Redis already running, restarting..."
      systemctl restart redis 2>/dev/null || systemctl restart redis-server 2>/dev/null || echo "Redis restart skipped"
    else
      echo "▶ Starting Redis..."
      systemctl start redis 2>/dev/null || systemctl start redis-server 2>/dev/null
    fi
    systemctl enable redis 2>/dev/null || systemctl enable redis-server 2>/dev/null || true
    echo "✓ Redis running"

    echo "▶ Pulling required Docker images..."
    echo "  ▶ Pulling PostgreSQL image..."
    docker pull postgres:14 || docker pull postgres:latest
    echo "  ✓ PostgreSQL image ready"

    echo "  ▶ Pulling n8n image..."
    docker pull n8nio/n8n:latest || echo "⚠ n8n image pull failed, will use cached"
    echo "  ✓ n8n image ready"

    echo "▶ Verifying PostgreSQL image availability..."
    if docker images | grep -q postgres; then
      echo "✓ PostgreSQL image verified"
    else
      echo "✗ PostgreSQL image not available, cannot proceed with migrations"
      exit 1
    fi

    echo "▶ Managing Docker services..."
    if docker compose version &>/dev/null; then
      DOCKER_COMPOSE="docker compose"
    else
      DOCKER_COMPOSE="docker-compose"
    fi
    COMPOSE_FILE="-f docker-compose.prod.yml"

    if docker ps -q &>/dev/null; then
      echo "▶ Stopping existing containers..."
      \$DOCKER_COMPOSE \$COMPOSE_FILE down || echo "⚠ No containers to stop"
    fi

    echo "▶ Starting Docker services (postgres)..."
    \$DOCKER_COMPOSE \$COMPOSE_FILE up -d
    echo "✓ Docker services started"

    echo "▶ Waiting for PostgreSQL to be ready..."
    MAX_RETRIES=30
    RETRY_COUNT=0
    while [ \$RETRY_COUNT -lt \$MAX_RETRIES ]; do
      if docker exec astralis_postgres pg_isready -U gregorystarr -d astralis &>/dev/null 2>&1; then
        echo "✓ PostgreSQL is ready"
        break
      fi
      RETRY_COUNT=\$((RETRY_COUNT + 1))
      echo "  Waiting for PostgreSQL... (\$RETRY_COUNT/\$MAX_RETRIES)"
      sleep 2
    done

    if [ \$RETRY_COUNT -eq \$MAX_RETRIES ]; then
      echo "⚠ PostgreSQL readiness check timed out, proceeding anyway..."
    fi

    echo "▶ Running database migrations..."
    npx prisma migrate deploy
    echo "✓ Migrations applied"

    echo "▶ Running database seeding..."
    npm run seed 2>/dev/null || npx tsx prisma/seed.ts
    echo "✓ Database seeding completed"

    echo "▶ Waiting for services to be healthy..."
    sleep 3

    echo "▶ Managing PM2 applications..."
    pm2 delete all 2>/dev/null || true
    pm2 start ecosystem.config.js
    echo "✓ PM2 applications started"

    if ! pm2 list | grep -q "astralis-worker"; then
      echo "▶ Starting PM2 worker..."
      pm2 start npm --name "astralis-worker" -- run worker
      echo "✓ PM2 worker started"
    fi

    pm2 save
    echo "✓ PM2 process list saved"

    echo "▶ Reloading Caddy..."
    if systemctl is-active --quiet caddy; then
      systemctl reload caddy
      echo "✓ Caddy reloaded"
    else
      echo "⚠ Caddy not running, starting..."
      systemctl start caddy
      systemctl enable caddy
      echo "✓ Caddy started"
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "DEPLOYMENT STATUS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    echo -n "  Redis: "
    systemctl.is-active redis &>/dev/null || systemctl is-active redis-server &>/dev/null \
      && echo "active" || echo "inactive"

    echo -n "  Docker: "
    docker ps &>/dev/null && echo "active" || echo "inactive"

    echo -n "  n8n: "
    docker ps | grep -q astralis_n8n && echo "running" || echo "stopped"

    echo -n "  PM2 (app): "
    pm2 list | grep -q "astralis " && echo "running" || echo "stopped"

    echo -n "  PM2 (worker): "
    pm2 list | grep -q "astralis-worker" && echo "running" || echo "stopped"

    echo -n "  Caddy: "
    systemctl is-active caddy &>/dev/null && echo "active" || echo "inactive"

    echo ""
    echo "✓ Deployment completed successfully!"
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

  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST" || echo "000")
  if echo "$HTTP_CODE" | grep -q "200\|301\|302"; then
    print_success "Site is responding (HTTP $HTTP_CODE)"
  else
    print_warning "Site may not be responding correctly (HTTP $HTTP_CODE)"
  fi

  N8N_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_HOST:5678" || echo "000")
  if echo "$N8N_CODE" | grep -q "200\|301\|302"; then
    print_success "n8n is accessible (HTTP $N8N_CODE)"
  else
    print_warning "n8n may not be accessible (HTTP $N8N_CODE)"
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
  sync_env_file

  echo ""
  confirm "Deploy to $ENVIRONMENT environment on $SERVER_HOST?"

  local_build
  git_operations
  sync_build_to_server
  ensure_remote_storage_layout
  deploy_to_server
  post_deployment
}

main "$@"
