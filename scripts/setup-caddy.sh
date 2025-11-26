#!/bin/bash

################################################################################
# Caddy Reverse Proxy Setup Script
#
# Installs and configures Caddy for AstralisOne.com
# Server: 137.184.31.207
# Usage: ./scripts/setup-caddy.sh
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SERVER_USER="root"
SERVER_HOST="137.184.31.207"
SSH_KEY="$HOME/.ssh/id_ed25519"
DOMAIN="astralisone.com"
AUTOMATION_DOMAIN="automation.astralisone.com"

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
  read -p "$(echo -e ${YELLOW}$1 [y/N]:${NC}) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Operation cancelled"
    exit 1
  fi
}

check_dns() {
  print_step "Checking DNS records..."

  # Check main domain
  MAIN_IP=$(dig +short $DOMAIN @8.8.8.8 | tail -n1)
  if [ "$MAIN_IP" != "$SERVER_HOST" ]; then
    print_error "DNS for $DOMAIN points to $MAIN_IP, expected $SERVER_HOST"
    print_warning "Update your DNS A record to point to $SERVER_HOST"
    print_warning "Wait 5-60 minutes for propagation, then retry"
    exit 1
  fi
  print_success "$DOMAIN → $MAIN_IP"

  # Check www subdomain
  WWW_IP=$(dig +short www.$DOMAIN @8.8.8.8 | tail -n1)
  if [ "$WWW_IP" != "$SERVER_HOST" ]; then
    print_warning "DNS for www.$DOMAIN points to $WWW_IP, expected $SERVER_HOST"
  else
    print_success "www.$DOMAIN → $WWW_IP"
  fi

  # Check automation subdomain
  AUTO_IP=$(dig +short $AUTOMATION_DOMAIN @8.8.8.8 | tail -n1)
  if [ "$AUTO_IP" != "$SERVER_HOST" ]; then
    print_error "DNS for $AUTOMATION_DOMAIN points to $AUTO_IP, expected $SERVER_HOST"
    print_warning "Update your DNS A record to point to $SERVER_HOST"
    exit 1
  fi
  print_success "$AUTOMATION_DOMAIN → $AUTO_IP"
}

check_backend_services() {
  print_step "Checking backend services on server..."

  # Check Next.js app
  APP_STATUS=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" \
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/api/health" || echo "000")

  if [ "$APP_STATUS" = "200" ]; then
    print_success "Next.js app responding on port 3001"
  else
    print_error "Next.js app not responding (HTTP $APP_STATUS)"
    print_warning "Start Docker containers first: cd /home/deploy/astralis-nextjs && docker-compose -f docker-compose.prod.yml up -d"
    exit 1
  fi

  # Check n8n
  N8N_STATUS=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" \
    "curl -s -o /dev/null -w '%{http_code}' http://localhost:5678/healthz" || echo "000")

  if [ "$N8N_STATUS" = "200" ]; then
    print_success "n8n responding on port 5678"
  else
    print_warning "n8n not responding (HTTP $N8N_STATUS)"
    print_warning "n8n may take 60s to start, or may not be critical for your setup"
  fi
}

install_caddy() {
  print_step "Installing Caddy on server..."

  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" 'bash -s' << 'ENDSSH'
    # Check if Caddy is already installed
    if command -v caddy &> /dev/null; then
      echo "Caddy already installed: $(caddy version)"
      exit 0
    fi

    # Install dependencies
    apt-get update
    apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl

    # Add Caddy GPG key
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
      gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

    # Add Caddy repository
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | \
      tee /etc/apt/sources.list.d/caddy-stable.list

    # Install Caddy
    apt-get update
    apt-get install -y caddy

    # Verify installation
    caddy version
ENDSSH

  print_success "Caddy installed"
}

configure_firewall() {
  print_step "Configuring firewall..."

  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" 'bash -s' << 'ENDSSH'
    # Enable UFW if not already enabled
    if ! ufw status | grep -q "Status: active"; then
      echo "y" | ufw enable
    fi

    # Allow HTTP (for Let's Encrypt challenge)
    ufw allow 80/tcp

    # Allow HTTPS
    ufw allow 443/tcp

    # Allow HTTP/3 (QUIC)
    ufw allow 443/udp

    # Show status
    ufw status
ENDSSH

  print_success "Firewall configured"
}

deploy_caddyfile() {
  print_step "Deploying Caddyfile to server..."

  # Create backup of existing Caddyfile if it exists
  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" \
    "[ -f /etc/caddy/Caddyfile ] && cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.backup.\$(date +%Y%m%d-%H%M%S) || true"

  # Copy Caddyfile to server
  scp -i "$SSH_KEY" Caddyfile "$SERVER_USER@$SERVER_HOST:/etc/caddy/Caddyfile"

  # Set correct permissions
  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" \
    "chown caddy:caddy /etc/caddy/Caddyfile && chmod 644 /etc/caddy/Caddyfile"

  print_success "Caddyfile deployed"
}

setup_logging() {
  print_step "Setting up log directory..."

  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" 'bash -s' << 'ENDSSH'
    # Create log directory
    mkdir -p /var/log/caddy

    # Set ownership
    chown -R caddy:caddy /var/log/caddy

    # Set permissions
    chmod 755 /var/log/caddy
ENDSSH

  print_success "Log directory created"
}

validate_config() {
  print_step "Validating Caddyfile syntax..."

  VALIDATION=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" \
    "caddy validate --config /etc/caddy/Caddyfile 2>&1" || true)

  if echo "$VALIDATION" | grep -q "Valid configuration"; then
    print_success "Caddyfile syntax valid"
  else
    print_error "Caddyfile validation failed:"
    echo "$VALIDATION"
    exit 1
  fi
}

start_caddy() {
  print_step "Starting Caddy service..."

  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" 'bash -s' << 'ENDSSH'
    # Enable Caddy to start on boot
    systemctl enable caddy

    # Restart Caddy to apply new configuration
    systemctl restart caddy

    # Wait for service to start
    sleep 3

    # Check status
    systemctl is-active --quiet caddy && echo "Caddy is running" || echo "Caddy failed to start"
ENDSSH

  print_success "Caddy service started"
}

monitor_ssl() {
  print_step "Monitoring SSL certificate provisioning..."
  print_warning "This may take 30-60 seconds..."

  # Give Caddy time to request certificates
  sleep 10

  ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" 'bash -s' << 'ENDSSH'
    # Show recent Caddy logs
    journalctl -u caddy -n 50 --no-pager | grep -E "acme|certificate|error" || true
ENDSSH

  print_success "Check logs above for certificate provisioning status"
}

verify_deployment() {
  print_step "Verifying deployment..."

  # Wait for services to stabilize
  sleep 5

  # Test HTTPS endpoints
  print_step "Testing HTTPS endpoints..."

  # Test main domain
  MAIN_STATUS=$(curl -s -o /dev/null -w '%{http_code}' -k https://$DOMAIN || echo "000")
  if echo "$MAIN_STATUS" | grep -q "200\|301\|302"; then
    print_success "https://$DOMAIN responding (HTTP $MAIN_STATUS)"
  else
    print_warning "https://$DOMAIN may not be ready yet (HTTP $MAIN_STATUS)"
    print_warning "Wait 1-2 minutes for SSL certificates to provision"
  fi

  # Test automation subdomain
  AUTO_STATUS=$(curl -s -o /dev/null -w '%{http_code}' -k https://$AUTOMATION_DOMAIN || echo "000")
  if echo "$AUTO_STATUS" | grep -q "200\|301\|302"; then
    print_success "https://$AUTOMATION_DOMAIN responding (HTTP $AUTO_STATUS)"
  else
    print_warning "https://$AUTOMATION_DOMAIN may not be ready yet (HTTP $AUTO_STATUS)"
  fi

  # Test HTTP to HTTPS redirect
  REDIRECT=$(curl -s -o /dev/null -w '%{http_code}' http://$DOMAIN || echo "000")
  if echo "$REDIRECT" | grep -q "301\|302\|308"; then
    print_success "HTTP → HTTPS redirect working"
  else
    print_warning "HTTP redirect not working (HTTP $REDIRECT)"
  fi
}

main() {
  echo -e "${GREEN}═══════════════════════════════════════${NC}"
  echo -e "${GREEN}  Caddy Setup for AstralisOne.com${NC}"
  echo -e "${GREEN}═══════════════════════════════════════${NC}"
  echo ""

  # Pre-flight checks
  print_step "Running pre-flight checks..."

  # Check if Caddyfile exists
  if [ ! -f "Caddyfile" ]; then
    print_error "Caddyfile not found in current directory"
    print_warning "Run this script from the repository root: /Users/gadmin/Projects/astralis-nextjs"
    exit 1
  fi

  # Check SSH connection
  if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo connected" &>/dev/null; then
    print_error "Cannot connect to server: $SERVER_HOST"
    exit 1
  fi
  print_success "Server connection verified"

  # Check DNS
  check_dns

  # Check backend services
  check_backend_services

  echo ""
  print_warning "This script will:"
  print_warning "  1. Install Caddy on server $SERVER_HOST"
  print_warning "  2. Configure firewall (ports 80, 443)"
  print_warning "  3. Deploy Caddyfile to /etc/caddy/Caddyfile"
  print_warning "  4. Request Let's Encrypt SSL certificates"
  print_warning "  5. Start Caddy service"
  echo ""

  confirm "Continue with Caddy setup?"

  # Installation steps
  install_caddy
  configure_firewall
  setup_logging
  deploy_caddyfile
  validate_config
  start_caddy
  monitor_ssl
  verify_deployment

  echo ""
  echo -e "${GREEN}═══════════════════════════════════════${NC}"
  echo -e "${GREEN}  Caddy Setup Complete!${NC}"
  echo -e "${GREEN}═══════════════════════════════════════${NC}"
  echo ""
  echo -e "${BLUE}Next Steps:${NC}"
  echo "  1. Test HTTPS: ${YELLOW}https://$DOMAIN${NC}"
  echo "  2. Test n8n: ${YELLOW}https://$AUTOMATION_DOMAIN${NC}"
  echo "  3. Verify SSL: ${YELLOW}https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN${NC}"
  echo "  4. Check security headers: ${YELLOW}https://securityheaders.com/?q=$DOMAIN${NC}"
  echo ""
  echo -e "${BLUE}Monitoring:${NC}"
  echo "  - View logs: ${YELLOW}ssh $SERVER_USER@$SERVER_HOST 'journalctl -u caddy -f'${NC}"
  echo "  - Check status: ${YELLOW}ssh $SERVER_USER@$SERVER_HOST 'systemctl status caddy'${NC}"
  echo "  - Access logs: ${YELLOW}ssh $SERVER_USER@$SERVER_HOST 'tail -f /var/log/caddy/astralisone.log'${NC}"
  echo ""
  echo -e "${BLUE}Documentation:${NC}"
  echo "  - Setup guide: ${YELLOW}docs/CADDY_SETUP.md${NC}"
  echo "  - Caddyfile: ${YELLOW}/etc/caddy/Caddyfile${NC} (on server)"
  echo ""
}

main "$@"
