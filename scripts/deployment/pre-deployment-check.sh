#!/bin/bash
#
# Pre-Deployment Checklist Script
# Verifies everything is ready for production deployment
#

# Don't exit on error - we want to check everything
set +e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ID="norse-breaker-474323-n8"
REGION="us-central1"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Pre-Deployment Checklist for Production             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

check() {
    if eval "$2" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1"
        ((CHECKS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        ((CHECKS_FAILED++))
        return 1
    fi
}

check_command() {
    if command -v "$2" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1"
        ((CHECKS_PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $1"
        echo -e "   ${YELLOW}Install: $3${NC}"
        ((CHECKS_FAILED++))
        return 1
    fi
}

echo -e "${BLUE}▶ Checking Prerequisites${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_command "gcloud CLI installed" "gcloud" "https://cloud.google.com/sdk/docs/install"
check_command "Docker installed" "docker" "https://docs.docker.com/get-docker/"
check_command "Git installed" "git" "sudo apt install git"

echo ""
echo -e "${BLUE}▶ Checking Google Cloud Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if authenticated
if gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)
    echo -e "${GREEN}✓${NC} Authenticated as: $ACCOUNT"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} Not authenticated with gcloud"
    echo -e "   ${YELLOW}Run: gcloud auth login${NC}"
    ((CHECKS_FAILED++))
fi

# Check project
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" == "$PROJECT_ID" ]; then
    echo -e "${GREEN}✓${NC} Project set to: $PROJECT_ID"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Project is: $CURRENT_PROJECT (expected: $PROJECT_ID)"
    echo -e "   ${YELLOW}Run: gcloud config set project $PROJECT_ID${NC}"
fi

# Check region
CURRENT_REGION=$(gcloud config get-value compute/region 2>/dev/null)
if [ "$CURRENT_REGION" == "$REGION" ]; then
    echo -e "${GREEN}✓${NC} Region set to: $REGION"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Region is: $CURRENT_REGION (expected: $REGION)"
    echo -e "   ${YELLOW}Run: gcloud config set compute/region $REGION${NC}"
fi

echo ""
echo -e "${BLUE}▶ Checking Google Cloud Secrets${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SECRETS=(
    "nextauth-secret"
    "auth-email"
    "auth-password-hash"
    "google-project-id"
    "google-location"
    "google-vertex-ai-model-id"
    "google-client-id"
    "google-client-secret"
)

for secret in "${SECRETS[@]}"; do
    check "Secret exists: $secret" "gcloud secrets describe $secret"
done

echo ""
echo -e "${BLUE}▶ Checking OAuth Configuration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if OAuth client ID is set
if gcloud secrets versions access latest --secret="google-client-id" &> /dev/null; then
    CLIENT_ID=$(gcloud secrets versions access latest --secret="google-client-id" 2>/dev/null)
    if [ -n "$CLIENT_ID" ] && [ "$CLIENT_ID" != "dummy-client-id" ]; then
        echo -e "${GREEN}✓${NC} OAuth Client ID configured"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} OAuth Client ID appears to be dummy/placeholder"
        echo -e "   ${YELLOW}Update at: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID${NC}"
    fi
else
    echo -e "${RED}✗${NC} Cannot access OAuth Client ID secret"
    ((CHECKS_FAILED++))
fi

echo ""
echo -e "${BLUE}▶ Checking Repository Status${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check "Git repository initialized" "git rev-parse --git-dir"
check "On develop or main branch" "git rev-parse --abbrev-ref HEAD | grep -E '^(main|develop)$'"
check "No uncommitted changes" "[ -z \"\$(git status --porcelain)\" ]"
check "Remote origin configured" "git remote get-url origin"

echo ""
echo -e "${BLUE}▶ Checking Project Files${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check "Dockerfile exists" "[ -f Dockerfile ]"
check ".dockerignore exists" "[ -f .dockerignore ]"
check "next.config.ts exists" "[ -f next.config.ts ]"
check "package.json exists" "[ -f package.json ]"
check ".env.example exists" "[ -f .env.example ]"

echo ""
echo -e "${BLUE}▶ Checking Docker${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check "Docker daemon running" "docker info"
check "Docker authenticated to GCR" "gcloud auth configure-docker gcr.io --quiet"

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Results                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for deployment.${NC}"
    echo ""
    echo -e "${BLUE}Next step:${NC} Run ./scripts/deployment/deploy-to-production.sh"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please fix the issues above before deploying.${NC}"
    echo ""
    echo -e "${YELLOW}Common fixes:${NC}"
    echo "  - Install missing tools (gcloud, docker)"
    echo "  - Run: gcloud auth login"
    echo "  - Run: gcloud config set project $PROJECT_ID"
    echo "  - Configure OAuth at: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
    echo "  - Create missing secrets with: gcloud secrets create SECRET_NAME"
    exit 1
fi
