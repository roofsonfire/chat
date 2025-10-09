#!/bin/bash

# Interactive OAuth Setup Script
# This script guides you through setting up Google OAuth for the chat application

set -e

PROJECT_ID="norse-breaker-474323-n8"
SERVICE_ACCOUNT="1025958277405-compute@developer.gserviceaccount.com"

echo "🚀 Google OAuth Setup for Chat Application"
echo "=========================================="
echo ""
echo "📝 Project: $PROJECT_ID"
echo "🔑 Service Account: $SERVICE_ACCOUNT"
echo ""

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with Google Cloud"
    echo "Please run: gcloud auth login"
    exit 1
fi

gcloud config set project $PROJECT_ID

echo "🌐 Step 1: Create OAuth 2.0 Client ID"
echo "------------------------------------"
echo "1. Open: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo "2. Click 'Create Credentials' → 'OAuth 2.0 Client IDs'"
echo "3. Application type: 'Web application'"
echo "4. Name: 'Chat Application - Staging'"
echo "5. Authorized redirect URIs:"
echo "   - https://staging.chat.daza.ar/api/auth/callback/google"
echo "   - http://localhost:3000/api/auth/callback/google"
echo ""

read -p "Have you created the OAuth client? (y/n): " created_client
if [[ $created_client != "y" && $created_client != "Y" ]]; then
    echo "Please create the OAuth client first and then run this script again."
    exit 1
fi

echo ""
echo "📋 Step 2: Enter OAuth Credentials"
echo "---------------------------------"

read -p "Enter your Google Client ID: " client_id
if [ -z "$client_id" ]; then
    echo "❌ Client ID cannot be empty"
    exit 1
fi

read -s -p "Enter your Google Client Secret: " client_secret
echo ""
if [ -z "$client_secret" ]; then
    echo "❌ Client Secret cannot be empty"
    exit 1
fi

echo ""
echo "🔐 Step 3: Creating Secrets in Secret Manager"
echo "--------------------------------------------"

# Create secrets
echo "Creating google-client-id secret..."
if echo "$client_id" | gcloud secrets create google-client-id --data-file=- 2>/dev/null; then
    echo "✅ Created google-client-id secret"
else
    echo "🔄 Updating existing google-client-id secret..."
    echo "$client_id" | gcloud secrets versions add google-client-id --data-file=-
fi

echo "Creating google-client-secret secret..."
if echo "$client_secret" | gcloud secrets create google-client-secret --data-file=- 2>/dev/null; then
    echo "✅ Created google-client-secret secret"
else
    echo "🔄 Updating existing google-client-secret secret..."
    echo "$client_secret" | gcloud secrets versions add google-client-secret --data-file=-
fi

echo ""
echo "🔑 Step 4: Granting Access to Cloud Run Service Account"
echo "------------------------------------------------------"

for secret in google-client-id google-client-secret; do
    echo "Granting access to $secret..."
    if gcloud secrets add-iam-policy-binding "$secret" \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor" &>/dev/null; then
        echo "✅ Access granted to $secret"
    else
        echo "ℹ️  Access binding already exists for $secret"
    fi
done

echo ""
echo "🔍 Step 5: Verifying Setup"
echo "------------------------"

echo "Secrets in project:"
gcloud secrets list --filter='name~google-client' --format='table(name,createTime)'

echo ""
echo "Testing secret access:"
if gcloud secrets versions access latest --secret=google-client-id >/dev/null 2>&1; then
    echo "✅ Can access google-client-id"
else
    echo "❌ Cannot access google-client-id"
fi

if gcloud secrets versions access latest --secret=google-client-secret >/dev/null 2>&1; then
    echo "✅ Can access google-client-secret"
else
    echo "❌ Cannot access google-client-secret"
fi

echo ""
echo "🎉 OAuth Setup Complete!"
echo "======================="
echo ""
echo "Next steps:"
echo "1. Enable OAuth secrets in deployment workflow:"
echo "   Edit .github/workflows/deploy-staging.yml"
echo "   Uncomment the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET lines"
echo ""
echo "2. Commit and push changes to deploy with OAuth enabled"
echo ""
echo "3. Test OAuth login at: https://staging.chat.daza.ar"
echo ""
echo "OAuth Client ID: ${client_id:0:20}..."
echo "OAuth redirect URI: https://staging.chat.daza.ar/api/auth/callback/google"