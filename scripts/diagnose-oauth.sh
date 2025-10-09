#!/bin/bash

# OAuth Configuration Diagnostic Script
# This script helps verify OAuth Client ID and Secret configuration

set -euo pipefail

echo "🔍 OAuth Configuration Diagnostic"
echo "================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &>/dev/null; then
    echo -e "${RED}❌ Error: gcloud is not authenticated${NC}"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
if [[ -z "$PROJECT_ID" ]]; then
    echo -e "${RED}❌ Error: No project set${NC}"
    echo "Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${BLUE}📋 Current Project:${NC} $PROJECT_ID"
echo

# 1. Check OAuth Client ID from Secret Manager
echo -e "${YELLOW}1️⃣  Checking OAuth Client ID in Secret Manager...${NC}"
if CLIENT_ID=$(gcloud secrets versions access latest --secret="google-client-id" 2>/dev/null); then
    echo -e "${GREEN}✅ Found Client ID:${NC} $CLIENT_ID"
    
    # Validate Client ID format
    if [[ $CLIENT_ID =~ ^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$ ]]; then
        echo -e "${GREEN}✅ Client ID format is valid${NC}"
    else
        echo -e "${RED}❌ Client ID format is invalid${NC}"
        echo "Expected format: NUMBERS-ALPHANUMERIC.apps.googleusercontent.com"
    fi
else
    echo -e "${RED}❌ Could not retrieve google-client-id from Secret Manager${NC}"
fi
echo

# 2. Check OAuth Client Secret existence (don't show the value)
echo -e "${YELLOW}2️⃣  Checking OAuth Client Secret in Secret Manager...${NC}"
if gcloud secrets versions access latest --secret="google-client-secret" &>/dev/null; then
    SECRET_LENGTH=$(gcloud secrets versions access latest --secret="google-client-secret" | wc -c)
    echo -e "${GREEN}✅ Found Client Secret (${SECRET_LENGTH} characters)${NC}"
    
    # Client secrets are typically 24 characters
    if [[ $SECRET_LENGTH -ge 20 && $SECRET_LENGTH -le 30 ]]; then
        echo -e "${GREEN}✅ Client Secret length looks reasonable${NC}"
    else
        echo -e "${YELLOW}⚠️  Client Secret length ($SECRET_LENGTH chars) seems unusual${NC}"
        echo "Google Client Secrets are typically 24 characters"
    fi
else
    echo -e "${RED}❌ Could not retrieve google-client-secret from Secret Manager${NC}"
fi
echo

# 3. Check Cloud Run service configuration
echo -e "${YELLOW}3️⃣  Checking Cloud Run service configuration...${NC}"
SERVICE_NAME="chat-staging"
REGION="us-central1"

if gcloud run services describe "$SERVICE_NAME" --region="$REGION" &>/dev/null; then
    echo -e "${GREEN}✅ Found Cloud Run service: $SERVICE_NAME${NC}"
    
    # Check NEXTAUTH_URL
    NEXTAUTH_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(spec.template.spec.containers[0].env[].value)" | grep -E "https://.*" | head -1 || echo "")
    if [[ -n "$NEXTAUTH_URL" ]]; then
        echo -e "${GREEN}✅ NEXTAUTH_URL:${NC} $NEXTAUTH_URL"
        
        # Expected redirect URI
        EXPECTED_REDIRECT_URI="${NEXTAUTH_URL}/api/auth/callback/google"
        echo -e "${BLUE}📍 Expected Redirect URI:${NC} $EXPECTED_REDIRECT_URI"
    else
        echo -e "${RED}❌ Could not find NEXTAUTH_URL in service configuration${NC}"
    fi
    
    # Check if secrets are properly bound
    echo
    echo -e "${YELLOW}🔐 Checking secret bindings...${NC}"
    SECRET_BINDINGS=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(spec.template.spec.containers[0].env[].valueFrom.secretKeyRef.name)" 2>/dev/null | grep -E "(google-client|oauth)" || echo "")
    
    if [[ -n "$SECRET_BINDINGS" ]]; then
        echo -e "${GREEN}✅ Found OAuth secret bindings:${NC}"
        echo "$SECRET_BINDINGS" | while read -r secret; do
            if [[ -n "$secret" ]]; then
                echo "   - $secret"
            fi
        done
    else
        echo -e "${RED}❌ No OAuth secret bindings found${NC}"
        echo "Secrets should be bound as environment variables"
    fi
else
    echo -e "${RED}❌ Could not find Cloud Run service: $SERVICE_NAME${NC}"
fi
echo

# 4. Test OAuth Client ID validity
echo -e "${YELLOW}4️⃣  Testing OAuth Client ID validity...${NC}"
if [[ -n "${CLIENT_ID:-}" ]]; then
    # Try to fetch the OAuth client info from Google
    TEST_URL="https://oauth2.googleapis.com/v1/userinfo"
    
    # Create a test OAuth URL to verify the client ID is recognized
    OAUTH_TEST_URL="https://accounts.google.com/o/oauth2/v2/auth?client_id=$CLIENT_ID&response_type=code&scope=openid%20email%20profile&redirect_uri=http://localhost"
    
    echo "🌐 Testing OAuth endpoint with your Client ID..."
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$OAUTH_TEST_URL" --max-time 10 || echo "000")
    
    if [[ "$HTTP_STATUS" == "302" || "$HTTP_STATUS" == "200" ]]; then
        echo -e "${GREEN}✅ OAuth Client ID is recognized by Google${NC}"
    elif [[ "$HTTP_STATUS" == "400" ]]; then
        echo -e "${RED}❌ OAuth Client ID is invalid or not properly configured${NC}"
        echo "HTTP Status: $HTTP_STATUS"
    else
        echo -e "${YELLOW}⚠️  Unexpected response: HTTP $HTTP_STATUS${NC}"
    fi
else
    echo -e "${RED}❌ Cannot test - Client ID not available${NC}"
fi
echo

# 5. Check if required APIs are enabled
echo -e "${YELLOW}5️⃣  Checking required APIs...${NC}"
REQUIRED_APIS=("plus.googleapis.com" "people.googleapis.com")

for API in "${REQUIRED_APIS[@]}"; do
    if gcloud services list --enabled --filter="name:$API" --format="value(name)" | grep -q "$API"; then
        echo -e "${GREEN}✅ $API is enabled${NC}"
    else
        echo -e "${RED}❌ $API is not enabled${NC}"
        echo "   Run: gcloud services enable $API"
    fi
done
echo

# 6. Generate OAuth client verification URLs
echo -e "${YELLOW}6️⃣  Manual verification steps...${NC}"
echo "To manually verify your OAuth configuration:"
echo
echo "1. Go to Google Cloud Console:"
echo "   https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo
echo "2. Look for OAuth 2.0 Client ID:"
if [[ -n "${CLIENT_ID:-}" ]]; then
    echo "   $CLIENT_ID"
fi
echo
echo "3. Check 'Authorized redirect URIs' contains:"
if [[ -n "${EXPECTED_REDIRECT_URI:-}" ]]; then
    echo "   $EXPECTED_REDIRECT_URI"
fi
echo
echo "4. Verify OAuth consent screen is published:"
echo "   https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT_ID"
echo

echo -e "${BLUE}🎯 Summary${NC}"
echo "========="
echo "If you see any ❌ errors above, those need to be fixed."
echo "The most common issue is missing redirect URIs in Google Cloud Console."
echo
echo -e "${GREEN}✨ Done!${NC}"