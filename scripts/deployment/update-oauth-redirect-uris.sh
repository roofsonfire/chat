#!/bin/bash

###############################################################################
# OAuth Redirect URI Update Script
# 
# Updates Google OAuth credentials to include production domain redirect URIs
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   OAuth Redirect URI Configuration Update${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Get GCP project ID
PROJECT_ID="norse-breaker-474323-n8"

# Get OAuth Client ID from Secret Manager (just to verify it exists)
echo -e "${BLUE}→${NC} Verifying OAuth Client ID in Secret Manager..."
CLIENT_ID=$(gcloud secrets versions access latest --secret="google-client-id" --project="$PROJECT_ID" 2>/dev/null | tr -d '\n')

if [ -z "$CLIENT_ID" ]; then
    echo -e "${RED}✗${NC} Failed to fetch OAuth Client ID from Secret Manager"
    exit 1
fi

echo -e "${GREEN}✓${NC} OAuth Client ID found in Secret Manager"
echo ""

# Display required redirect URIs
echo -e "${YELLOW}📋 Required Redirect URIs:${NC}"
echo ""
echo "1. https://chat.daza.ar/api/auth/callback/google"
echo "2. https://chat-production-v2xv6gugxa-uc.a.run.app/api/auth/callback/google"
echo "3. http://localhost:3000/api/auth/callback/google (for local development)"
echo ""

# Display instructions
echo -e "${YELLOW}📝 Manual Steps Required:${NC}"
echo ""
echo "1. Open Google Cloud Console:"
echo -e "   ${BLUE}https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}${NC}"
echo ""
echo "2. Find your OAuth 2.0 Client ID (look for 'Web client' type)"
echo ""
echo "3. Click on it to edit"
echo ""
echo "4. Add these Authorized redirect URIs:"
echo "   ✓ https://chat.daza.ar/api/auth/callback/google"
echo "   ✓ https://chat-production-v2xv6gugxa-uc.a.run.app/api/auth/callback/google"
echo "   ✓ http://localhost:3000/api/auth/callback/google"
echo ""
echo "5. Also add these Authorized JavaScript origins:"
echo "   ✓ https://chat.daza.ar"
echo "   ✓ https://chat-production-v2xv6gugxa-uc.a.run.app"
echo "   ✓ http://localhost:3000"
echo ""
echo "6. Click 'SAVE'"
echo ""

# Offer to open the console
read -p "$(echo -e ${BLUE}'Would you like to open the Google Cloud Console now? (y/n): '${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    URL="https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}"
    
    if command -v xdg-open > /dev/null; then
        xdg-open "$URL" 2>/dev/null
    elif command -v open > /dev/null; then
        open "$URL"
    else
        echo -e "${YELLOW}→${NC} Please open this URL manually:"
        echo -e "   ${BLUE}${URL}${NC}"
    fi
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}   Next Steps${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "After updating the OAuth configuration:"
echo ""
echo "1. Wait 5-10 minutes for changes to propagate"
echo "2. Test the production domain:"
echo -e "   ${BLUE}https://chat.daza.ar${NC}"
echo ""
echo "3. If you still see certificate errors, wait for SSL provisioning:"
echo "   gcloud beta run domain-mappings describe --domain=chat.daza.ar --region=us-central1"
echo ""
echo "4. Monitor logs for any issues:"
echo "   gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=chat-production\" --limit=10 --project=${PROJECT_ID}"
echo ""
