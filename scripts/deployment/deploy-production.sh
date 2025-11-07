#!/bin/bash

# Cloud Run Production Deployment Script
# Deploy to: https://chat.daza.ar

set -e

# Configuration
PROJECT_ID="norse-breaker-474323-n8"
REGION="us-central1"
SERVICE_NAME="chat-production"
DOMAIN="chat.daza.ar"

echo "🚀 Deploying Chat Application to Cloud Run (Production)"
echo "=================================================="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo "Domain: $DOMAIN"
echo ""

# Check if authenticated
echo "🔐 Checking authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated. Running gcloud auth login..."
    gcloud auth login
fi

# Set project
echo "📋 Setting project..."
gcloud config set project $PROJECT_ID

# Check if secrets exist, create if needed
echo "🔑 Checking secrets..."

if ! gcloud secrets describe auth-email --project=$PROJECT_ID &>/dev/null; then
    echo "⚠️  Secret 'auth-email' not found."
    echo "Please create it first:"
    echo "  echo -n 'your-email@example.com' | gcloud secrets create auth-email --data-file=-"
    exit 1
fi

if ! gcloud secrets describe auth-password-hash --project=$PROJECT_ID &>/dev/null; then
    echo "⚠️  Secret 'auth-password-hash' not found."
    echo "Please create it first using scripts/hash-password.js:"
    echo "  node scripts/hash-password.js 'your-password'"
    echo "  echo -n 'HASHED_OUTPUT' | gcloud secrets create auth-password-hash --data-file=-"
    exit 1
fi

if ! gcloud secrets describe nextauth-secret --project=$PROJECT_ID &>/dev/null; then
    echo "📝 Creating NextAuth secret..."
    openssl rand -base64 32 | gcloud secrets create nextauth-secret --data-file=-
fi

echo "✅ All secrets exist"

# Get project number for service account
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "🔐 Ensuring service account has secret access..."
gcloud secrets add-iam-policy-binding auth-email \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID --quiet

gcloud secrets add-iam-policy-binding auth-password-hash \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID --quiet

gcloud secrets add-iam-policy-binding nextauth-secret \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID --quiet

echo "✅ Service account permissions configured"

# Build and deploy
echo ""
echo "🔨 Building and deploying to Cloud Run..."
echo "⏳ This may take a few minutes..."
echo ""

gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --max-instances 10 \
    --min-instances 0 \
    --concurrency 80 \
    --port 3000 \
    --set-env-vars "NODE_ENV=production" \
    --set-env-vars "GOOGLE_PROJECT_ID=$PROJECT_ID" \
    --set-env-vars "GOOGLE_LOCATION=$REGION" \
    --set-env-vars "GOOGLE_VERTEX_AI_MODEL_ID=gemini-2.5-flash-image" \
    --set-env-vars "NEXTAUTH_URL=https://$DOMAIN" \
    --update-secrets "NEXTAUTH_SECRET=nextauth-secret:latest" \
    --update-secrets "AUTH_USER_EMAIL=auth-email:latest" \
    --update-secrets "AUTH_USER_PASSWORD_HASH=auth-password-hash:latest"

echo ""
echo "✅ Deployment complete!"
echo ""

# Get the Cloud Run URL
CLOUD_RUN_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "📍 Cloud Run URL: $CLOUD_RUN_URL"
echo ""

# Check if domain mapping exists
echo "🌐 Checking domain mapping..."
if gcloud run domain-mappings describe --domain=$DOMAIN --region=$REGION --project=$PROJECT_ID &>/dev/null; then
    echo "✅ Domain mapping already exists for $DOMAIN"
else
    echo "📝 Creating domain mapping for $DOMAIN..."
    echo ""
    echo "⚠️  IMPORTANT: Before proceeding, you need to verify domain ownership."
    echo ""
    read -p "Have you verified ownership of $DOMAIN in Google Cloud Console? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gcloud run domain-mappings create \
            --service $SERVICE_NAME \
            --domain $DOMAIN \
            --region $REGION \
            --project $PROJECT_ID
        
        echo ""
        echo "✅ Domain mapping created!"
    else
        echo ""
        echo "⚠️  Skipping domain mapping. Create it manually later with:"
        echo "   gcloud run domain-mappings create --service $SERVICE_NAME --domain $DOMAIN --region $REGION"
    fi
fi

echo ""
echo "📋 DNS Configuration Required:"
echo "=================================================="
echo "Add these DNS records to daza.ar domain:"
echo ""
echo "Type: CNAME"
echo "Name: staging.chat"
echo "Value: ghs.googlehosted.com"
echo "TTL: 3600"
echo ""
echo "Or if you need A records, get them from:"
echo "  gcloud run domain-mappings describe --domain=$DOMAIN --region=$REGION --format='value(status.resourceRecords)'"
echo ""
echo "=================================================="
echo "🎉 Deployment Summary"
echo "=================================================="
echo "Service: $SERVICE_NAME"
echo "Cloud Run URL: $CLOUD_RUN_URL"
echo "Custom Domain: https://$DOMAIN (pending DNS)"
echo "Region: $REGION"
echo "Model: gemini-2.5-flash-image"
echo ""
echo "📝 Next Steps:"
echo "1. Configure DNS records for $DOMAIN"
echo "2. Wait for DNS propagation (5-30 minutes)"
echo "3. Visit https://$DOMAIN"
echo "4. Monitor logs: gcloud run logs read $SERVICE_NAME --region=$REGION --limit=100"
echo ""
echo "✅ Done!"
