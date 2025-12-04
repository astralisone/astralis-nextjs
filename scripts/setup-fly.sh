#!/bin/bash

# Fly.io Workers Setup Script for Astralis One
# This script deploys BullMQ background workers to Fly.io

set -e

echo "============================================"
echo "  Fly.io Workers Setup for Astralis One"
echo "============================================"
echo ""

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "Installing Fly.io CLI..."
    if command -v brew &> /dev/null; then
        brew install flyctl
    else
        curl -L https://fly.io/install.sh | sh
        export FLYCTL_INSTALL="/home/$USER/.fly"
        export PATH="$FLYCTL_INSTALL/bin:$PATH"
    fi
fi

echo "Fly.io CLI is installed."
echo ""

# Check if logged in
echo "Checking Fly.io authentication..."
if ! fly auth whoami &> /dev/null; then
    echo "Please log in to Fly.io:"
    fly auth login
fi

FLY_USER=$(fly auth whoami 2>/dev/null || echo "unknown")
echo "Logged in as: $FLY_USER"
echo ""

# Check if app already exists
APP_NAME="astralis-workers"
echo "Checking if app '$APP_NAME' exists..."

if fly apps list 2>/dev/null | grep -q "$APP_NAME"; then
    echo "App '$APP_NAME' already exists."
    echo ""
else
    echo "Creating new Fly.io app..."
    echo ""

    # Create app without deploying
    fly apps create "$APP_NAME" --org personal 2>/dev/null || true
    echo "App created: $APP_NAME"
fi

echo ""
echo "============================================"
echo "  Setting Environment Secrets"
echo "============================================"
echo ""

# Prompt for secrets
echo "You need to set the following secrets for the workers:"
echo ""

# Check if secrets are already set
EXISTING_SECRETS=$(fly secrets list -a "$APP_NAME" 2>/dev/null || echo "")

set_secret() {
    local name=$1
    local prompt=$2
    local default=$3

    if echo "$EXISTING_SECRETS" | grep -q "^$name"; then
        echo "✓ $name is already set"
        return
    fi

    echo -n "$prompt"
    if [ -n "$default" ]; then
        echo -n " [$default]: "
    else
        echo -n ": "
    fi

    read -r value

    if [ -z "$value" ] && [ -n "$default" ]; then
        value="$default"
    fi

    if [ -n "$value" ]; then
        fly secrets set "$name=$value" -a "$APP_NAME" --stage
        echo "  → $name staged"
    else
        echo "  → Skipped $name"
    fi
}

echo "Enter the values for each secret (press Enter to skip):"
echo ""

# Read from .env.production if it exists
if [ -f ".env.production" ]; then
    echo "Found .env.production - using values as defaults where available"
    echo ""
    source <(grep -E '^[A-Z_]+=.*' .env.production | sed 's/^/export /')
fi

# Core secrets
set_secret "DATABASE_URL" "Database URL (Vercel Postgres)" "${DATABASE_URL:-}"
set_secret "REDIS_URL" "Redis URL (Upstash)" "${REDIS_URL:-}"
set_secret "OPENAI_API_KEY" "OpenAI API Key" "${OPENAI_API_KEY:-}"
set_secret "ANTHROPIC_API_KEY" "Anthropic API Key" "${ANTHROPIC_API_KEY:-}"
set_secret "BLOB_READ_WRITE_TOKEN" "Vercel Blob Token" "${BLOB_READ_WRITE_TOKEN:-}"

echo ""
echo "Deploying staged secrets..."
fly secrets deploy -a "$APP_NAME" 2>/dev/null || true

echo ""
echo "============================================"
echo "  Deploying Workers to Fly.io"
echo "============================================"
echo ""

echo "Ready to deploy? This will:"
echo "  1. Build the worker Docker image"
echo "  2. Push to Fly.io registry"
echo "  3. Start the worker machines"
echo ""

read -p "Deploy now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Deploying..."
    echo ""

    fly deploy -a "$APP_NAME" -c fly.toml

    echo ""
    echo "============================================"
    echo "  Deployment Complete!"
    echo "============================================"
    echo ""

    # Show status
    echo "Worker status:"
    fly status -a "$APP_NAME"

    echo ""
    echo "View logs with:"
    echo "  fly logs -a $APP_NAME"
    echo ""
    echo "Scale workers with:"
    echo "  fly scale count 2 -a $APP_NAME"
    echo ""
else
    echo ""
    echo "Deployment skipped. Run manually with:"
    echo "  fly deploy -a $APP_NAME -c fly.toml"
fi

echo ""
echo "============================================"
echo "  Useful Commands"
echo "============================================"
echo ""
echo "  fly status -a $APP_NAME      # Check status"
echo "  fly logs -a $APP_NAME        # View logs"
echo "  fly ssh console -a $APP_NAME # SSH into machine"
echo "  fly scale count N -a $APP_NAME # Scale to N instances"
echo "  fly secrets list -a $APP_NAME  # List secrets"
echo ""
