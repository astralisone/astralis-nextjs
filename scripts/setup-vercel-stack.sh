#!/bin/bash

# Complete Vercel Stack Setup for Astralis One
# Sets up Upstash Redis + Fly.io Workers + Vercel deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo "  Astralis One - Vercel Stack Setup"
echo "============================================"
echo ""
echo "This script will set up:"
echo "  1. Upstash Redis (for BullMQ queues)"
echo "  2. Fly.io Workers (background processing)"
echo "  3. Vercel deployment guidance"
echo ""
echo "Prerequisites:"
echo "  - Upstash account (https://upstash.com)"
echo "  - Fly.io account (https://fly.io)"
echo "  - Vercel account (https://vercel.com)"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "============================================"
echo "  Step 1: Upstash Redis Setup"
echo "============================================"
echo ""

read -p "Set up Upstash Redis now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    bash "$SCRIPT_DIR/setup-upstash.sh"
else
    echo "Skipped. Run later with: ./scripts/setup-upstash.sh"
fi

echo ""
echo "============================================"
echo "  Step 2: Fly.io Workers Setup"
echo "============================================"
echo ""

read -p "Set up Fly.io workers now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    bash "$SCRIPT_DIR/setup-fly.sh"
else
    echo "Skipped. Run later with: ./scripts/setup-fly.sh"
fi

echo ""
echo "============================================"
echo "  Step 3: Vercel Deployment"
echo "============================================"
echo ""
echo "To deploy to Vercel:"
echo ""
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository: astralisone/astralis-nextjs"
echo "3. Configure environment variables:"
echo ""
echo "   Required variables:"
echo "   ─────────────────────────────────────────"
echo "   DATABASE_URL          → Vercel Postgres connection string"
echo "   NEXTAUTH_SECRET       → Random 32+ char secret"
echo "   NEXTAUTH_URL          → https://astralisone.com"
echo "   REDIS_URL             → Upstash Redis URL"
echo "   BLOB_READ_WRITE_TOKEN → (auto-set when enabling Blob storage)"
echo "   OPENAI_API_KEY        → OpenAI API key"
echo "   ANTHROPIC_API_KEY     → Anthropic API key"
echo ""
echo "   Optional variables:"
echo "   ─────────────────────────────────────────"
echo "   GOOGLE_CLIENT_ID      → Google OAuth"
echo "   GOOGLE_CLIENT_SECRET  → Google OAuth"
echo "   TWILIO_*              → Twilio credentials"
echo "   SMTP_*                → Email configuration"
echo ""
echo "4. Enable Vercel Blob Storage:"
echo "   Dashboard > Storage > Create Database > Blob"
echo ""
echo "5. Enable Vercel Postgres (if not using external):"
echo "   Dashboard > Storage > Create Database > Postgres"
echo ""
echo "6. Deploy!"
echo ""

echo "============================================"
echo "  Environment Variables Checklist"
echo "============================================"
echo ""

# Check what's configured
check_env() {
    local name=$1
    if [ -f "$PROJECT_DIR/.env.local" ] && grep -q "^$name=" "$PROJECT_DIR/.env.local"; then
        echo "  ✓ $name (in .env.local)"
    else
        echo "  ✗ $name (not set)"
    fi
}

echo "Local environment (.env.local):"
check_env "DATABASE_URL"
check_env "REDIS_URL"
check_env "BLOB_READ_WRITE_TOKEN"
check_env "OPENAI_API_KEY"
check_env "ANTHROPIC_API_KEY"
check_env "NEXTAUTH_SECRET"

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Set up Vercel project and add env variables"
echo "  2. Push to GitHub to trigger deployment"
echo "  3. Verify workers are running: fly logs -a astralis-workers"
echo ""
echo "Useful commands:"
echo "  npm run dev              # Local development"
echo "  fly logs -a astralis-workers  # Worker logs"
echo "  fly status -a astralis-workers # Worker status"
echo ""
