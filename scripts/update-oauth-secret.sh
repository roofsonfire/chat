#!/bin/bash
#
# Update Google OAuth Client Secret
# This script safely updates the google-client-secret in Secret Manager
#

set -e

PROJECT_ID="norse-breaker-474323-n8"
SECRET_NAME="google-client-secret"
SERVICE_NAME="chat-production"
REGION="us-central1"

echo "════════════════════════════════════════════════════════════════"
echo "  Update Google OAuth Client Secret"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if secret value is provided
if [ -z "$1" ]; then
    echo "❌ ERROR: Client secret not provided"
    echo ""
    echo "Usage:"
    echo "  ./scripts/update-oauth-secret.sh 'YOUR_CLIENT_SECRET_HERE'"
    echo ""
    echo "To get your client secret:"
    echo "  1. Go to: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
    echo "  2. Click on: 1025958277405-dd54mmjpgq4ilopkt8h6d123e54npd3o"
    echo "  3. Find 'Client secret' field"
    echo "  4. Click 'SHOW' to reveal the secret"
    echo "  5. Copy the secret and run this script again"
    echo ""
    exit 1
fi

CLIENT_SECRET="$1"

# Validate secret format (should be around 24-35 characters for Google OAuth)
SECRET_LENGTH=${#CLIENT_SECRET}
if [ "$SECRET_LENGTH" -lt 20 ]; then
    echo "⚠️  WARNING: Client secret seems too short ($SECRET_LENGTH characters)"
    echo "   Google OAuth secrets are typically 24-35 characters"
    read -p "   Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted"
        exit 1
    fi
fi

echo "📝 Client secret length: $SECRET_LENGTH characters"
echo ""

# Show current secret info
echo "Current secret info:"
gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" 2>/dev/null || {
    echo "❌ ERROR: Secret '$SECRET_NAME' not found"
    exit 1
}
echo ""

# Confirm update
read -p "Update secret and restart Cloud Run service? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

echo ""
echo "⚙️  Updating secret..."

# Add new secret version (avoid trailing newline)
printf '%s' "$CLIENT_SECRET" | gcloud secrets versions add "$SECRET_NAME" \
    --data-file=- \
    --project="$PROJECT_ID"

if [ $? -eq 0 ]; then
    echo "✅ Secret updated successfully"
else
    echo "❌ Failed to update secret"
    exit 1
fi

echo ""
echo "🔄 Forcing Cloud Run service to restart..."

# Force restart by updating a label
gcloud run services update "$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --update-labels="secret-updated=$(date +%s)" \
    --quiet

if [ $? -eq 0 ]; then
    echo "✅ Service restarted successfully"
else
    echo "❌ Failed to restart service"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ OAuth Secret Updated!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "The service is restarting with the new secret."
echo "Wait ~30 seconds, then try logging in again at:"
echo "  https://your-production-domain.com"
echo ""
echo "To monitor the deployment:"
echo "  gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID"
echo ""
