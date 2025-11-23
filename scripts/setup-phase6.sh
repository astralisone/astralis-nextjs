#!/bin/bash

# ============================================================================
# Phase 6: n8n Automation Setup Script
# ============================================================================
# Purpose: Automated setup for n8n workflow automation engine
# Requirements: Docker, Docker Compose, .env.local file
# Usage: chmod +x scripts/setup-phase6.sh && ./scripts/setup-phase6.sh
# ============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo ""
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

print_header "Phase 6: n8n Automation Setup"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_error "Error: .env.local not found"
    echo "   Copy .env.local.template to .env.local and configure it first:"
    echo "   cp .env.local.template .env.local"
    exit 1
fi

print_success ".env.local found"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

print_success "Docker is running"

# Check if docker-compose.yml exists
if [ ! -f docker-compose.yml ]; then
    print_error "docker-compose.yml not found in current directory"
    exit 1
fi

print_success "docker-compose.yml found"

# ============================================================================
# Generate N8N Encryption Key
# ============================================================================

print_info "Checking N8N encryption key..."

# Check if encryption key needs to be generated
if ! grep -q "^N8N_ENCRYPTION_KEY=" .env.local || \
   grep -q "N8N_ENCRYPTION_KEY=your-64-character-hex-encryption-key" .env.local || \
   grep -q "N8N_ENCRYPTION_KEY=generate-with-openssl-rand-hex-32" .env.local; then

    print_warning "N8N encryption key not set or using placeholder"
    print_info "Generating secure encryption key..."

    ENCRYPTION_KEY=$(openssl rand -hex 32)

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|N8N_ENCRYPTION_KEY=.*|N8N_ENCRYPTION_KEY=$ENCRYPTION_KEY|" .env.local
    else
        # Linux
        sed -i "s|N8N_ENCRYPTION_KEY=.*|N8N_ENCRYPTION_KEY=$ENCRYPTION_KEY|" .env.local
    fi

    print_success "Encryption key generated and saved to .env.local"
    print_warning "IMPORTANT: Keep this key secure! Losing it means losing access to stored credentials."
else
    print_success "N8N encryption key already configured"
fi

# ============================================================================
# Generate Internal API Key
# ============================================================================

print_info "Checking AstralisOps internal API key..."

if ! grep -q "^ASTRALIS_API_KEY=" .env.local || \
   grep -q "ASTRALIS_API_KEY=your-internal-api-key" .env.local; then

    print_warning "Internal API key not set or using placeholder"
    print_info "Generating secure API key..."

    API_KEY=$(openssl rand -hex 32)

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|ASTRALIS_API_KEY=.*|ASTRALIS_API_KEY=$API_KEY|" .env.local
    else
        # Linux
        sed -i "s|ASTRALIS_API_KEY=.*|ASTRALIS_API_KEY=$API_KEY|" .env.local
    fi

    print_success "Internal API key generated and saved to .env.local"
else
    print_success "Internal API key already configured"
fi

# ============================================================================
# Pull Docker Images
# ============================================================================

print_header "Pulling Docker Images"

print_info "Pulling n8n Docker image..."
docker pull n8nio/n8n:latest

print_success "n8n image pulled successfully"

# ============================================================================
# Initialize PostgreSQL Schema
# ============================================================================

print_header "Database Setup"

# Check if PostgreSQL container is running
if docker ps | grep -q "astralis_postgres"; then
    print_info "PostgreSQL container is running"
    print_info "Initializing n8n schema..."

    # Run the schema initialization script
    if docker exec -i astralis_postgres psql -U astralis -d astralis_one < scripts/init-n8n-schema.sql 2>&1 | grep -q "ERROR.*already exists"; then
        print_warning "n8n schema already exists (this is OK)"
    else
        print_success "n8n schema initialized successfully"
    fi
else
    print_warning "PostgreSQL container not running"
    print_info "Schema will be initialized when you start the database"
    print_info "Run this command later: docker exec -i astralis_postgres psql -U astralis -d astralis_one < scripts/init-n8n-schema.sql"
fi

# ============================================================================
# Start n8n Container
# ============================================================================

print_header "Starting n8n Container"

print_info "Starting n8n service..."

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

# Start n8n container
docker-compose up -d n8n

print_success "n8n container started"

# ============================================================================
# Health Check
# ============================================================================

print_header "Health Check"

print_info "Waiting for n8n to be ready (this may take 30-60 seconds)..."

# Wait up to 60 seconds for n8n to be ready
MAX_ATTEMPTS=12
ATTEMPT=0
SLEEP_TIME=5

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -f http://localhost:5678/healthz > /dev/null 2>&1; then
        print_success "n8n is healthy and running!"
        break
    fi

    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        echo -n "."
        sleep $SLEEP_TIME
    fi
done

echo ""

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    print_warning "n8n health check timed out"
    print_info "Check logs with: docker logs astralis_n8n"
    print_info "This might be normal if n8n is still initializing"
fi

# ============================================================================
# Setup Complete
# ============================================================================

print_header "✅ Phase 6 Setup Complete!"

echo ""
echo "📍 n8n Editor URL: http://localhost:5678"
echo "🔑 Username: ${N8N_BASIC_AUTH_USER:-admin}"
echo "🔑 Password: (check N8N_BASIC_AUTH_PASSWORD in .env.local)"
echo ""
echo "📊 Container Status:"
docker ps --filter "name=astralis_n8n" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "📚 Next Steps:"
echo "   1. Access n8n editor at http://localhost:5678"
echo "   2. Configure credentials for integrations (OpenAI, Slack, etc.)"
echo "   3. Import workflow templates from docs/workflows/"
echo "   4. Run Prisma migration for automation tables:"
echo "      npx prisma migrate dev --name add_automation_tables_phase_6"
echo "   5. Test workflows with sample data"
echo ""
echo "📖 Documentation:"
echo "   - Deployment Guide: docs/PHASE6_DEPLOYMENT.md"
echo "   - Workflow Templates: docs/workflows/"
echo "   - API Integration: docs/API_ROUTES.md"
echo ""
echo "🔧 Useful Commands:"
echo "   - View n8n logs: docker logs -f astralis_n8n"
echo "   - Restart n8n: docker-compose restart n8n"
echo "   - Stop n8n: docker-compose stop n8n"
echo "   - Check health: curl http://localhost:5678/healthz"
echo ""
print_success "Setup completed successfully!"
