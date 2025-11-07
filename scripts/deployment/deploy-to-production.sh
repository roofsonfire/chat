#!/bin/bash
#
# Production Deployment Script for chat.daza.ar
# This script deploys the Next.js chat application to Google Cloud Run
#
# Usage: ./scripts/deployment/deploy-to-production.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="norse-breaker-474323-n8"
REGION="us-central1"
SERVICE_NAME="chat-production"
DOMAIN="chat.daza.ar"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
MIN_INSTANCES=0
MAX_INSTANCES=10
MEMORY="512Mi"
CPU="1"
TIMEOUT="300"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Production Deployment Script - chat.daza.ar              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print section headers
print_header() {
    echo ""
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Step 1: Verify Prerequisites
print_header "Step 1: Verifying Prerequisites"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed. Please install it first."
    exit 1
fi
print_success "gcloud CLI found"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install it first."
    exit 1
fi
print_success "Docker found"

# Verify current project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    print_warning "Current project is $CURRENT_PROJECT, switching to $PROJECT_ID"
    gcloud config set project $PROJECT_ID
fi
print_success "Project: $PROJECT_ID"

# Verify region
CURRENT_REGION=$(gcloud config get-value compute/region 2>/dev/null)
if [ "$CURRENT_REGION" != "$REGION" ]; then
    print_warning "Setting region to $REGION"
    gcloud config set compute/region $REGION
fi
print_success "Region: $REGION"

# Step 2: Check OAuth Configuration
print_header "Step 2: Checking OAuth Configuration"

echo -e "${YELLOW}Please verify your OAuth configuration:${NC}"
echo ""
echo "1. Go to: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo "2. Verify you have an OAuth 2.0 Client ID with:"
echo "   - Authorized JavaScript origins: https://$DOMAIN"
echo "   - Authorized redirect URIs: https://$DOMAIN/api/auth/callback/google"
echo ""
read -p "Have you verified OAuth configuration? (y/n): " oauth_verified

if [ "$oauth_verified" != "y" ]; then
    print_error "Please configure OAuth first. See DEPLOYMENT-TRANSITION-PLAN.md"
    exit 1
fi
print_success "OAuth configuration verified"

# Step 3: Verify Secrets
print_header "Step 3: Verifying Google Cloud Secrets"

REQUIRED_SECRETS=(
    "nextauth-secret"
    "auth-email"
    "auth-password-hash"
    "google-project-id"
    "google-location"
    "google-vertex-ai-model-id"
    "google-client-id"
    "google-client-secret"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
    if gcloud secrets describe "$secret" &> /dev/null; then
        print_success "Secret exists: $secret"
    else
        print_error "Secret missing: $secret"
        echo "Please create it with: gcloud secrets create $secret"
        exit 1
    fi
done

# Step 4: Build Docker Image
print_header "Step 4: Building Docker Image"

echo "Building image: $IMAGE_NAME:latest"
docker build -t $IMAGE_NAME:latest \
    --build-arg NEXT_PUBLIC_APP_URL=https://$DOMAIN \
    .

print_success "Docker image built successfully"

# Step 5: Push to Container Registry
print_header "Step 5: Pushing to Google Container Registry"

docker push $IMAGE_NAME:latest
print_success "Image pushed to GCR"

# Step 6: Deploy to Cloud Run
print_header "Step 6: Deploying to Cloud Run"

echo "Deploying service: $SERVICE_NAME"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --min-instances $MIN_INSTANCES \
    --max-instances $MAX_INSTANCES \
    --memory $MEMORY \
    --cpu $CPU \
    --timeout $TIMEOUT \
    --set-secrets="NEXTAUTH_SECRET=nextauth-secret:latest,AUTH_USER_EMAIL=auth-email:latest,AUTH_USER_PASSWORD_HASH=auth-password-hash:latest,GOOGLE_PROJECT_ID=google-project-id:latest,GOOGLE_LOCATION=google-location:latest,GOOGLE_VERTEX_AI_MODEL_ID=google-vertex-ai-model-id:latest,GOOGLE_CLIENT_ID=google-client-id:latest,GOOGLE_CLIENT_SECRET=google-client-secret:latest" \
    --set-env-vars="NEXTAUTH_URL=https://$DOMAIN,ENABLE_TEST_CREDENTIALS=false" \
    --tag latest

print_success "Service deployed to Cloud Run"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
print_success "Service URL: $SERVICE_URL"

# Step 7: Domain Mapping
print_header "Step 7: Setting up Domain Mapping"

echo "Checking if domain mapping exists..."
if gcloud run domain-mappings describe --domain=$DOMAIN --region=$REGION &> /dev/null; then
    print_warning "Domain mapping already exists for $DOMAIN"
else
    echo "Creating domain mapping for $DOMAIN"
    gcloud run domain-mappings create \
        --service=$SERVICE_NAME \
        --domain=$DOMAIN \
        --region=$REGION
    
    print_success "Domain mapping created"
    print_warning "DNS propagation may take 10-15 minutes"
fi

# Step 8: Verify DNS Configuration
print_header "Step 8: DNS Configuration Instructions"

echo -e "${YELLOW}To complete the setup, configure your DNS:${NC}"
echo ""
echo "1. Go to your DNS provider (Namecheap)"
echo "2. Add a CNAME record:"
echo "   - Type: CNAME"
echo "   - Host: chat"
echo "   - Value: ghs.googlehosted.com"
echo "   - TTL: 1800"
echo ""
echo "3. Wait for DNS propagation (10-15 minutes)"
echo ""

# Step 9: Health Check
print_header "Step 9: Testing Deployment"

echo "Testing Cloud Run service..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL")

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 307 ]; then
    print_success "Service is responding (HTTP $HTTP_STATUS)"
else
    print_warning "Service returned HTTP $HTTP_STATUS (this may be normal if redirecting)"
fi

# Step 10: Summary
print_header "Deployment Complete!"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    SUCCESS!                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Service Name: $SERVICE_NAME"
echo "Cloud Run URL: $SERVICE_URL"
echo "Production URL: https://$DOMAIN (after DNS propagation)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Wait for DNS propagation (10-15 minutes)"
echo "2. Test: https://$DOMAIN"
echo "3. Monitor logs: gcloud run services logs read $SERVICE_NAME --region $REGION"
echo "4. Check metrics: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics?project=$PROJECT_ID"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:     gcloud run services logs read $SERVICE_NAME --region $REGION --limit 50"
echo "  List services: gcloud run services list --region $REGION"
echo "  Update secrets: gcloud secrets versions add [SECRET_NAME] --data-file=-"
echo "  Check domain:  gcloud run domain-mappings describe --domain=$DOMAIN --region=$REGION"
echo ""
