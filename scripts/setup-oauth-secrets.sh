#!/bin/bash

# Setup Google OAuth Secrets for Chat Application
# This script creates the necessary secrets in Google Secret Manager

set -e

# Configuration
PROJECT_ID="${PROJECT_ID:-norse-breaker-474323-n8}"
SERVICE_ACCOUNT="1025958277405-compute@developer.gserviceaccount.com"

echo "🔐 Setting up Google OAuth secrets for project: $PROJECT_ID"
echo "📝 Service Account: $SERVICE_ACCOUNT"

# Check if we're authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with Google Cloud"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Set the project
echo "🔧 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Function to create secret if it doesn't exist
create_secret_if_not_exists() {
    local secret_name=$1
    local secret_value=$2
    
    if gcloud secrets describe "$secret_name" &>/dev/null; then
        echo "✅ Secret '$secret_name' already exists"
        echo "🔄 Updating secret value..."
        echo "$secret_value" | gcloud secrets versions add "$secret_name" --data-file=-
    else
        echo "🆕 Creating secret '$secret_name'..."
        echo "$secret_value" | gcloud secrets create "$secret_name" --data-file=-
    fi
}

# Check if OAuth credentials are provided
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "⚠️  Google OAuth credentials not provided as environment variables"
    echo ""
    echo "You need to:"
    echo "1. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials"
    echo "2. Create OAuth 2.0 Client IDs if not already done"
    echo "3. Configure authorized redirect URIs:"
    echo "   - https://staging.chat.daza.ar/api/auth/callback/google"
    echo "   - http://localhost:3000/api/auth/callback/google (for local development)"
    echo "4. Get the Client ID and Client Secret"
    echo ""
    echo "Then run this script with:"
    echo "GOOGLE_CLIENT_ID='your-client-id' GOOGLE_CLIENT_SECRET='your-client-secret' $0"
    echo ""
    echo "Or manually create the secrets:"
    echo "echo 'your-client-id' | gcloud secrets create google-client-id --data-file=-"
    echo "echo 'your-client-secret' | gcloud secrets create google-client-secret --data-file=-"
    exit 1
fi

# Create the secrets
create_secret_if_not_exists "google-client-id" "$GOOGLE_CLIENT_ID"
create_secret_if_not_exists "google-client-secret" "$GOOGLE_CLIENT_SECRET"

# Grant access to the Cloud Run service account
echo "🔑 Granting Secret Manager access to Cloud Run service account..."

for secret in "google-client-id" "google-client-secret"; do
    echo "📝 Granting access to secret: $secret"
    if gcloud secrets add-iam-policy-binding "$secret" \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor" &>/dev/null; then
        echo "✅ Access granted to $secret"
    else
        echo "⚠️  Failed to grant access to $secret (might already exist)"
    fi
done

echo ""
echo "🎉 OAuth secrets setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify secrets exist:"
echo "   gcloud secrets list --filter='name:(google-client-id OR google-client-secret)'"
echo ""
echo "2. Test secret access:"
echo "   gcloud secrets versions access latest --secret=google-client-id"
echo ""
echo "3. Re-enable OAuth secrets in deployment workflow:"
echo "   Edit .github/workflows/deploy-staging.yml to uncomment the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET lines"
echo ""
echo "4. Push changes to trigger deployment with OAuth enabled"