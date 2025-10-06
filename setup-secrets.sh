#!/bin/bash

# First-time setup script for Cloud Run secrets
# Run this once before deploying

set -e

PROJECT_ID="norse-breaker-474323-n8"

echo "🔐 Cloud Run Secrets Setup"
echo "=================================================="
echo "This script will help you create secrets in Google Cloud Secret Manager"
echo ""

# Check authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated. Running gcloud auth login..."
    gcloud auth login
fi

# Set project
gcloud config set project $PROJECT_ID

echo ""
echo "📝 Step 1: Auth Email"
echo "=================================================="
read -p "Enter the email for authentication: " AUTH_EMAIL

if [ -z "$AUTH_EMAIL" ]; then
    echo "❌ Email cannot be empty"
    exit 1
fi

echo -n "$AUTH_EMAIL" | gcloud secrets create auth-email --data-file=-
echo "✅ Created secret: auth-email"

echo ""
echo "📝 Step 2: Password Hash"
echo "=================================================="
echo "You need to generate a bcrypt hash for your password."
echo ""
read -sp "Enter your password: " PASSWORD
echo ""

# Generate hash using Node.js
echo "🔨 Generating bcrypt hash..."
HASH=$(node -e "const bcrypt = require('bcrypt'); bcrypt.hash('$PASSWORD', 10, (err, hash) => { if (err) throw err; console.log(hash); });")

if [ -z "$HASH" ]; then
    echo "❌ Failed to generate hash. Make sure Node.js and bcrypt are installed."
    echo "Run: npm install"
    exit 1
fi

echo -n "$HASH" | gcloud secrets create auth-password-hash --data-file=-
echo "✅ Created secret: auth-password-hash"

echo ""
echo "📝 Step 3: NextAuth Secret"
echo "=================================================="
echo "Generating random NextAuth secret..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo -n "$NEXTAUTH_SECRET" | gcloud secrets create nextauth-secret --data-file=-
echo "✅ Created secret: nextauth-secret"

echo ""
echo "🔐 Setting up IAM permissions..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Service Account: $SERVICE_ACCOUNT"

# Grant access to secrets
gcloud secrets add-iam-policy-binding auth-email \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding auth-password-hash \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding nextauth-secret \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

echo "✅ IAM permissions configured"

echo ""
echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo ""
echo "Created secrets:"
echo "  - auth-email: $AUTH_EMAIL"
echo "  - auth-password-hash: ********"
echo "  - nextauth-secret: ********"
echo ""
echo "You can now run the deployment script:"
echo "  ./deploy-staging.sh"
echo ""
