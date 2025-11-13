#!/bin/bash

###############################################################################
# Droplet Environment Preparation Script
#
# This script prepares the Digital Ocean droplet for git-based deployment
# Run this on the droplet as root user
#
# Usage: bash prepare-droplet.sh
###############################################################################

set -e  # Exit on error

echo "======================================================================"
echo "Astralis Droplet Environment Preparation"
echo "======================================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root"
    exit 1
fi

print_success "Running as root"

# 1. Create deploy directory structure
echo ""
echo "Step 1: Creating /home/deploy directory structure"
echo "----------------------------------------------------------------------"

if [ ! -d "/home/deploy" ]; then
    mkdir -p /home/deploy
    chown root:root /home/deploy
    chmod 755 /home/deploy
    print_success "Created /home/deploy directory"
else
    print_info "/home/deploy already exists"
fi

# 2. Create PM2 log directory
echo ""
echo "Step 2: Creating PM2 log directory"
echo "----------------------------------------------------------------------"

if [ ! -d "/var/log/pm2" ]; then
    mkdir -p /var/log/pm2
    chmod 755 /var/log/pm2
    print_success "Created /var/log/pm2 directory"
else
    print_info "/var/log/pm2 already exists"
fi

# 3. Check for existing PM2 configuration
echo ""
echo "Step 3: Checking existing PM2 configuration"
echo "----------------------------------------------------------------------"

PM2_CONFIG_FOUND=false
for config_file in /root/ecosystem.config.cjs /root/ecosystem.config.js /root/ecosystem.production.cjs; do
    if [ -f "$config_file" ]; then
        print_info "Found existing PM2 config: $config_file"
        echo "Content:"
        echo "----------------------------------------------------------------------"
        cat "$config_file"
        echo "----------------------------------------------------------------------"

        # Backup existing config
        BACKUP_FILE="${config_file}.backup-$(date +%Y%m%d-%H%M%S)"
        cp "$config_file" "$BACKUP_FILE"
        print_success "Backed up to $BACKUP_FILE"
        PM2_CONFIG_FOUND=true
    fi
done

if [ "$PM2_CONFIG_FOUND" = false ]; then
    print_info "No existing PM2 configuration found"
fi

# 4. Check current PM2 status
echo ""
echo "Step 4: Checking current PM2 status"
echo "----------------------------------------------------------------------"

if command -v pm2 &> /dev/null; then
    print_success "PM2 is installed"
    echo ""
    pm2 status || true
else
    print_error "PM2 is not installed"
    print_info "Install with: npm install -g pm2"
fi

# 5. Check Caddy configuration
echo ""
echo "Step 5: Checking Caddy configuration"
echo "----------------------------------------------------------------------"

if [ -f "/etc/caddy/Caddyfile" ]; then
    print_success "Found Caddyfile at /etc/caddy/Caddyfile"
    echo "Content:"
    echo "----------------------------------------------------------------------"
    cat /etc/caddy/Caddyfile
    echo "----------------------------------------------------------------------"
else
    print_error "Caddyfile not found at /etc/caddy/Caddyfile"
fi

# 6. Check if Caddy is running
if systemctl is-active --quiet caddy; then
    print_success "Caddy is running"
else
    print_error "Caddy is not running"
fi

# 7. Check port availability
echo ""
echo "Step 6: Checking port availability"
echo "----------------------------------------------------------------------"

check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_info "Port $port is in use:"
        lsof -Pi :$port -sTCP:LISTEN
    else
        print_success "Port $port is available"
    fi
}

check_port 3000
check_port 3001

# 8. Check Git installation
echo ""
echo "Step 7: Checking Git installation"
echo "----------------------------------------------------------------------"

if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git is installed: $GIT_VERSION"
else
    print_error "Git is not installed"
    print_info "Install with: apt-get install git"
fi

# 9. Check Node.js and npm
echo ""
echo "Step 8: Checking Node.js and npm"
echo "----------------------------------------------------------------------"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed"
fi

# 10. Check existing old directories
echo ""
echo "Step 9: Checking existing project directories"
echo "----------------------------------------------------------------------"

if [ -d "/root/projects/astralis-next" ]; then
    print_info "Found old frontend at /root/projects/astralis-next"
    du -sh /root/projects/astralis-next
else
    print_info "Old frontend directory not found"
fi

if [ -d "/root/projects/astralis-server" ]; then
    print_info "Found old backend at /root/projects/astralis-server"
    du -sh /root/projects/astralis-server
else
    print_info "Old backend directory not found"
fi

# 11. Check PostgreSQL
echo ""
echo "Step 10: Checking PostgreSQL"
echo "----------------------------------------------------------------------"

if systemctl is-active --quiet postgresql; then
    print_success "PostgreSQL is running"
else
    print_error "PostgreSQL is not running"
fi

# 12. Create deployment info file
echo ""
echo "Step 11: Creating deployment info file"
echo "----------------------------------------------------------------------"

cat > /home/deploy/DEPLOYMENT_INFO.md << 'EOF'
# Deployment Information

**Directory Structure:**
- Frontend: /home/deploy/astralis-nextjs (GitHub: astralisone/astralis-nextjs, main branch)
- Backend: /home/deploy/astralis-server (GitHub: astralisone/astralis-agency-server, feature/nextjs-migration)

**PM2 Configuration:**
- Location: /root/ecosystem.config.cjs
- Frontend Port: 3001
- Backend Port: 3000

**Quick Commands:**

Pull and deploy:
```bash
# Frontend
cd /home/deploy/astralis-nextjs && git pull && npm install && npm run build && pm2 restart astralis-frontend

# Backend
cd /home/deploy/astralis-server && git pull && cd server && npm install && npm run build && pm2 restart astralis-server
```

PM2 Management:
```bash
pm2 status              # View all services
pm2 logs                # View all logs
pm2 restart all         # Restart all services
pm2 monit               # Monitor resources
```

Health Checks:
```bash
curl http://localhost:3001      # Frontend
curl http://localhost:3000      # Backend
pm2 status                      # Service status
```

See /home/deploy/astralis-nextjs/DEPLOYMENT_GUIDE.md for full documentation.
EOF

print_success "Created /home/deploy/DEPLOYMENT_INFO.md"

# Summary
echo ""
echo "======================================================================"
echo "Environment Preparation Summary"
echo "======================================================================"
echo ""
print_success "✓ Directory structure created"
print_success "✓ PM2 log directory ready"
print_success "✓ Configuration checked"
print_success "✓ Deployment info created"
echo ""
echo "Next Steps:"
echo "----------"
echo "1. Clone repositories to /home/deploy/"
echo "2. Copy ecosystem.production.cjs to /root/ecosystem.config.cjs"
echo "3. Configure environment variables (.env files)"
echo "4. Build applications"
echo "5. Start services with PM2"
echo ""
echo "See /home/deploy/DEPLOYMENT_INFO.md for details"
echo "======================================================================"
