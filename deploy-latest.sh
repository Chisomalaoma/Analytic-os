#!/bin/bash
# Force deploy latest commit to Vercel

echo "Latest commit on GitHub:"
git log -1 --oneline

echo ""
echo "To deploy this to Vercel:"
echo "1. Go to: https://vercel.com/chisomalaoma_/analytic-os/settings/git"
echo "2. Disconnect the repository"
echo "3. Reconnect it"
echo "4. Or create a Deploy Hook and trigger it"
echo ""
echo "Deploy Hook URL format:"
echo "https://api.vercel.com/v1/integrations/deploy/[PROJECT_ID]/[TOKEN]"
