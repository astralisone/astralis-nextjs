#!/bin/bash

# Upstash Redis Setup Script for Astralis One
# This script helps configure Upstash Redis for BullMQ queue management

set -e

echo "============================================"
echo "  Upstash Redis Setup for Astralis One"
echo "============================================"
echo ""

# Check if upstash CLI is installed
if ! command -v upstash &> /dev/null; then
    echo "Installing Upstash CLI..."
    if command -v brew &> /dev/null; then
        brew install upstash/tap/upstash
    elif command -v npm &> /dev/null; then
        npm install -g @upstash/cli
    else
        echo "Please install Upstash CLI manually:"
        echo "  brew install upstash/tap/upstash"
        echo "  or: npm install -g @upstash/cli"
        echo ""
        echo "Then run this script again."
        exit 1
    fi
fi

echo "Upstash CLI is installed."
echo ""

# Check if logged in
echo "Checking Upstash authentication..."
if ! upstash auth status &> /dev/null; then
    echo "Please log in to Upstash:"
    upstash auth login
fi

echo ""
echo "Creating Redis database for Astralis..."
echo ""

# Create Redis database
DB_NAME="astralis-redis"
REGION="us-east-1"  # Close to Vercel's iad1 region

echo "Database name: $DB_NAME"
echo "Region: $REGION"
echo ""

# Check if database already exists
EXISTING_DB=$(upstash redis list 2>/dev/null | grep -w "$DB_NAME" || true)

if [ -n "$EXISTING_DB" ]; then
    echo "Database '$DB_NAME' already exists."
    echo ""
    echo "Fetching connection details..."
else
    echo "Creating new Redis database..."
    upstash redis create "$DB_NAME" --region "$REGION"
    echo ""
    echo "Database created successfully!"
fi

echo ""
echo "============================================"
echo "  Getting Connection Details"
echo "============================================"
echo ""

# Get database details
DB_INFO=$(upstash redis info "$DB_NAME" 2>/dev/null || echo "")

if [ -z "$DB_INFO" ]; then
    echo "Could not retrieve database info automatically."
    echo ""
    echo "Please get your connection details from:"
    echo "  https://console.upstash.com/redis"
    echo ""
    echo "Look for the 'REST URL' or 'Redis URL' under your database."
else
    echo "$DB_INFO"
fi

echo ""
echo "============================================"
echo "  Next Steps"
echo "============================================"
echo ""
echo "1. Go to https://console.upstash.com/redis"
echo "2. Click on your '$DB_NAME' database"
echo "3. Copy the 'Redis URL' (starts with redis://)"
echo ""
echo "4. Add to your environment:"
echo ""
echo "   For local development (.env.local):"
echo "   REDIS_URL=redis://default:PASSWORD@REGION.upstash.io:6379"
echo ""
echo "   For Vercel (Dashboard > Settings > Environment Variables):"
echo "   REDIS_URL=redis://default:PASSWORD@REGION.upstash.io:6379"
echo ""
echo "   For Fly.io workers:"
echo "   fly secrets set REDIS_URL=\"redis://default:PASSWORD@REGION.upstash.io:6379\""
echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
