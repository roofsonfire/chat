#!/bin/bash

# Community Fork Deployment Script
# This script helps deploy your AI Chat Assistant fork to Google Cloud Run
# 
# Usage: ./deploy-community-fork.sh [environment]
# Example: ./deploy-community-fork.sh production

set -e

# Configuration - CUSTOMIZE THESE VALUES
PROJECT_ID="your-google-project-id"
SERVICE_NAME="ai-chat-assistant"
REGION="us-central1"
CUSTOM_DOMAIN="your-domain.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is not installed. Please install it first:"
        log_error "https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first:"
        log_error "https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check if logged in to gcloud
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "Not logged in to gcloud. Please run: gcloud auth login"
        exit 1
    fi
    
    log_info "Prerequisites check passed!"
}

# Set up Google Cloud project
setup_project() {
    log_info "Setting up Google Cloud project..."
    
    # Set project
    gcloud config set project $PROJECT_ID
    
    # Enable required APIs
    log_info "Enabling required APIs..."
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable aiplatform.googleapis.com
    gcloud services enable secretmanager.googleapis.com
    
    log_info "APIs enabled successfully!"
}

# Create secrets in Secret Manager
setup_secrets() {
    log_info "Setting up secrets in Google Secret Manager..."
    
    # Check if secrets already exist
    if gcloud secrets describe nextauth-secret --quiet 2>/dev/null; then
        log_warn "Secret 'nextauth-secret' already exists. Skipping creation."
    else
        log_info "Creating NextAuth secret..."
        echo "REPLACE_WITH_RANDOM_SECRET_32_CHARS" | gcloud secrets create nextauth-secret --data-file=-
        log_warn "Please update the 'nextauth-secret' with a secure random value:"
        log_warn "gcloud secrets versions add nextauth-secret --data-file=<(openssl rand -base64 32)"
    fi
    
    # Add other secrets as needed
    log_info "Please create the following secrets manually:"
    log_info "- google-client-id: Your Google OAuth client ID"
    log_info "- google-client-secret: Your Google OAuth client secret"
    log_info "- auth-user-email: Authorized user email"
    log_info "- auth-user-password-hash: Bcrypt hash (use: npm run hash-password)"
    log_info ""
    log_info "Example commands:"
    log_info "echo 'your-client-id' | gcloud secrets create google-client-id --data-file=-"
    log_info "echo 'your-client-secret' | gcloud secrets create google-client-secret --data-file=-"
}

# Deploy to Cloud Run
deploy_service() {
    local environment=${1:-staging}
    
    log_info "Deploying to Cloud Run (environment: $environment)..."
    
    # Set service name based on environment
    local service_name="${SERVICE_NAME}-${environment}"
    
    # Build and deploy
    gcloud run deploy $service_name \
        --source . \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --set-env-vars "NODE_ENV=production" \
        --set-env-vars "NEXTAUTH_URL=https://$CUSTOM_DOMAIN" \
        --set-env-vars "GOOGLE_PROJECT_ID=$PROJECT_ID" \
        --set-env-vars "GOOGLE_LOCATION=$REGION" \
        --set-secrets "NEXTAUTH_SECRET=nextauth-secret:latest" \
        --set-secrets "GOOGLE_CLIENT_ID=google-client-id:latest" \
        --set-secrets "GOOGLE_CLIENT_SECRET=google-client-secret:latest" \
        --set-secrets "AUTH_USER_EMAIL=auth-user-email:latest" \
        --set-secrets "AUTH_USER_PASSWORD_HASH=auth-user-password-hash:latest" \
        --memory 512Mi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --timeout 300 \
        --concurrency 80
    
    # Get the service URL
    local service_url=$(gcloud run services describe $service_name --region $REGION --format="value(status.url)")
    
    log_info "Deployment successful!"
    log_info "Service URL: $service_url"
    
    if [ "$environment" = "production" ]; then
        setup_custom_domain $service_name
    fi
}

# Set up custom domain
setup_custom_domain() {
    local service_name=$1
    
    log_info "Setting up custom domain mapping..."
    
    # Create domain mapping
    gcloud run domain-mappings create \
        --service $service_name \
        --domain $CUSTOM_DOMAIN \
        --region $REGION
    
    log_info "Custom domain setup initiated."
    log_info "Please configure your DNS to point to the provided CNAME target."
    log_info "Check status with: gcloud run domain-mappings describe $CUSTOM_DOMAIN --region $REGION"
}

# Verify deployment
verify_deployment() {
    local environment=${1:-staging}
    local service_name="${SERVICE_NAME}-${environment}"
    
    log_info "Verifying deployment..."
    
    # Get service URL
    local service_url=$(gcloud run services describe $service_name --region $REGION --format="value(status.url)")
    
    # Test health endpoint
    if curl -f -s "$service_url/api/health" > /dev/null; then
        log_info "Health check passed! ✅"
        log_info "Your AI Chat Assistant is running at: $service_url"
    else
        log_error "Health check failed! ❌"
        log_error "Please check the service logs:"
        log_error "gcloud logs tail --service=$service_name"
        exit 1
    fi
}

# Main deployment function
main() {
    local environment=${1:-staging}
    
    echo "🚀 AI Chat Assistant Community Fork Deployment"
    echo "=============================================="
    echo "Environment: $environment"
    echo "Project ID: $PROJECT_ID"
    echo "Region: $REGION"
    echo "Service: ${SERVICE_NAME}-${environment}"
    echo ""
    
    # Confirm deployment
    read -p "Do you want to proceed with the deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled."
        exit 0
    fi
    
    # Run deployment steps
    check_prerequisites
    setup_project
    setup_secrets
    deploy_service $environment
    verify_deployment $environment
    
    log_info "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Configure your OAuth application with the service URL"
    echo "2. Update your secrets in Google Secret Manager"
    echo "3. Test the application authentication flow"
    echo "4. Set up monitoring and alerts"
    echo ""
    echo "Need help? Check the documentation at:"
    echo "https://github.com/YOUR_USERNAME/ai-chat-assistant/blob/main/docs/deployment/CLOUD-RUN-DEPLOYMENT.md"
}

# Script execution
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    # Check if configuration is still default
    if [ "$PROJECT_ID" = "your-google-project-id" ]; then
        log_error "Please customize the configuration section at the top of this script:"
        log_error "- PROJECT_ID: Your Google Cloud project ID"
        log_error "- SERVICE_NAME: Your preferred service name"
        log_error "- REGION: Your preferred deployment region"
        log_error "- CUSTOM_DOMAIN: Your custom domain (optional)"
        exit 1
    fi
    
    main "$@"
fi