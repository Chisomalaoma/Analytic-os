#!/bin/bash
# Manually trigger Vercel deployment
# Replace the URL below with your actual deploy hook URL from Vercel

DEPLOY_HOOK_URL="PASTE_YOUR_DEPLOY_HOOK_URL_HERE"

echo "Triggering Vercel deployment..."
curl -X POST "$DEPLOY_HOOK_URL"
echo ""
echo "Deployment triggered! Check Vercel dashboard."
