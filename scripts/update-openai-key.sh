#!/bin/bash

# Script to update OpenAI API key in all environment files
# Usage: ./scripts/update-openai-key.sh sk-your-actual-key-here

if [ -z "$1" ]; then
  echo "❌ Error: OpenAI API key required"
  echo ""
  echo "Usage: ./scripts/update-openai-key.sh sk-your-actual-key-here"
  echo ""
  echo "Get your API key at: https://platform.openai.com/api-keys"
  exit 1
fi

OPENAI_KEY="$1"

echo "🔑 Updating OpenAI API key in environment files..."
echo ""

# Update .env.local
if [ -f ".env.local" ]; then
  if grep -q "OPENAI_API_KEY=" .env.local; then
    sed -i.bak "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=\"$OPENAI_KEY\"|" .env.local
    echo "✅ Updated .env.local"
  else
    echo "OPENAI_API_KEY=\"$OPENAI_KEY\"" >> .env.local
    echo "✅ Added to .env.local"
  fi
else
  echo "⚠️  .env.local not found, skipping"
fi

# Update .env.production
if [ -f ".env.production" ]; then
  if grep -q "OPENAI_API_KEY=" .env.production; then
    sed -i.bak "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=\"$OPENAI_KEY\"|" .env.production
    echo "✅ Updated .env.production"
  else
    echo "OPENAI_API_KEY=\"$OPENAI_KEY\"" >> .env.production
    echo "✅ Added to .env.production"
  fi
else
  echo "⚠️  .env.production not found, skipping"
fi

# Update server .env.production
echo ""
echo "📡 Updating server environment file..."
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207 << ENDSSH
cd /home/deploy/astralis-nextjs

# Backup existing file
if [ -f .env.production ]; then
  cp .env.production .env.production.backup
fi

# Update or add OPENAI_API_KEY
if grep -q "OPENAI_API_KEY=" .env.production 2>/dev/null; then
  sed -i "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=\"$OPENAI_KEY\"|" .env.production
else
  echo "OPENAI_API_KEY=\"$OPENAI_KEY\"" >> .env.production
fi

echo "✅ Updated server .env.production"
ENDSSH

echo ""
echo "✨ All environment files updated successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Restart your local dev server: npm run dev"
echo "   2. Restart your worker: npm run worker"
echo "   3. Deploy to server to apply changes"
echo ""
echo "🧪 Test the chat feature:"
echo "   1. Upload a document via API"
echo "   2. Wait for OCR and embedding generation"
echo "   3. Use the DocumentChat component or POST to /api/chat"
