#!/bin/bash

echo "============================================"
echo "Step 1: Type Check"
echo "============================================"
cd /Users/gadmin/Projects/astralis-nextjs
npx tsc --noEmit 2>&1 | grep -i "document\|error" | head -20

echo ""
echo "============================================"
echo "Step 2: Git Add & Commit"
echo "============================================"
git add -A
git commit -m "test: Documents page with basic imports"

echo ""
echo "============================================"
echo "Step 3: Push to main"
echo "============================================"
git push origin main

echo ""
echo "============================================"
echo "Step 4: Deploy to Vercel"
echo "============================================"
vercel --prod --force 2>&1 | tail -30
