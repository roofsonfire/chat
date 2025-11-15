#!/bin/bash

echo "🔍 Validating development environment..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Exit codes
EXIT_CODE=0

# Check Node.js
echo -n "Checking Node.js version... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 20 ]; then
        echo -e "${GREEN}✓${NC} $NODE_VERSION"
    else
        echo -e "${RED}✗${NC} $NODE_VERSION (need v20+)"
        EXIT_CODE=1
    fi
else
    echo -e "${RED}✗${NC} Not installed"
    echo "  Install from: https://nodejs.org/"
    EXIT_CODE=1
fi

# Check npm
echo -n "Checking npm version... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} Not installed"
    EXIT_CODE=1
fi

# Check Git
echo -n "Checking Git... "
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    echo -e "${GREEN}✓${NC} v$GIT_VERSION"
else
    echo -e "${RED}✗${NC} Not installed"
    echo "  Install from: https://git-scm.com/"
    EXIT_CODE=1
fi

# Check gcloud
echo -n "Checking Google Cloud CLI... "
if command -v gcloud &> /dev/null; then
    GCLOUD_VERSION=$(gcloud --version 2>/dev/null | head -n 1 | awk '{print $4}')
    echo -e "${GREEN}✓${NC} v$GCLOUD_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Not installed (optional for local dev)"
    echo "  Install from: https://cloud.google.com/sdk/docs/install"
fi

# Check .env.local
echo -n "Checking environment file... "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
    
    # Check required variables
    REQUIRED_VARS=(
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
        "AUTH_USER_EMAIL"
        "AUTH_USER_PASSWORD_HASH"
        "GOOGLE_PROJECT_ID"
        "GOOGLE_LOCATION"
        "GOOGLE_VERTEX_AI_MODEL_ID"
    )
    
    for VAR in "${REQUIRED_VARS[@]}"; do
        echo -n "  - $VAR... "
        if grep -q "^$VAR=" .env.local && ! grep -q "^$VAR=$" .env.local && ! grep -q "^$VAR=\"\"$" .env.local; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗${NC} Missing or empty"
            EXIT_CODE=1
        fi
    done
    
    # Check optional OAuth variables
    echo -n "  - Google OAuth (optional)... "
    if grep -q "^GOOGLE_CLIENT_ID=" .env.local && grep -q "^GOOGLE_CLIENT_SECRET=" .env.local; then
        echo -e "${GREEN}✓${NC} Configured"
    else
        echo -e "${YELLOW}⚠${NC} Not configured (use ENABLE_TEST_CREDENTIALS=true)"
    fi
else
    echo -e "${RED}✗${NC} Not found"
    echo "  Run: cp .env.example .env.local"
    EXIT_CODE=1
fi

# Check node_modules
echo -n "Checking dependencies... "
if [ -d "node_modules" ]; then
    PACKAGE_COUNT=$(ls -1 node_modules 2>/dev/null | wc -l)
    echo -e "${GREEN}✓${NC} $PACKAGE_COUNT packages installed"
else
    echo -e "${RED}✗${NC} Not installed"
    echo "  Run: npm install"
    EXIT_CODE=1
fi

# Check Google Cloud authentication
echo -n "Checking Google Cloud auth... "
if [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    if [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        echo -e "${GREEN}✓${NC} Service account key: $GOOGLE_APPLICATION_CREDENTIALS"
    else
        echo -e "${RED}✗${NC} Key file not found: $GOOGLE_APPLICATION_CREDENTIALS"
        EXIT_CODE=1
    fi
elif command -v gcloud &> /dev/null && gcloud auth application-default print-access-token &> /dev/null; then
    echo -e "${GREEN}✓${NC} Application default credentials"
else
    echo -e "${YELLOW}⚠${NC} Not configured"
    echo "  Run: gcloud auth application-default login"
    echo "  Or set GOOGLE_APPLICATION_CREDENTIALS to service account key path"
fi

# Check if port 3000 is available
echo -n "Checking port 3000 availability... "
if command -v lsof &> /dev/null; then
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠${NC} Port 3000 is in use"
        echo "  Process using port: $(lsof -Pi :3000 -sTCP:LISTEN -t | xargs ps -p | tail -n +2)"
        echo "  Use: PORT=3001 npm run dev"
    else
        echo -e "${GREEN}✓${NC} Available"
    fi
elif command -v netstat &> /dev/null; then
    if netstat -an | grep ":3000 " | grep -q "LISTEN"; then
        echo -e "${YELLOW}⚠${NC} Port 3000 is in use"
        echo "  Use: PORT=3001 npm run dev"
    else
        echo -e "${GREEN}✓${NC} Available"
    fi
else
    echo -e "${YELLOW}⚠${NC} Cannot check (lsof/netstat not available)"
fi

# Check TypeScript compilation
if [ -d "node_modules" ] && [ -f "tsconfig.json" ]; then
    echo -n "Checking TypeScript configuration... "
    if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} No type errors"
    else
        echo -e "${YELLOW}⚠${NC} Type errors detected"
        echo "  Run: npm run type-check"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Validation complete! Your environment is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. npm run dev          # Start development server"
    echo "  2. npm run lint         # Check code style"
    echo "  3. npm run test         # Run tests"
else
    echo -e "${RED}❌ Validation failed. Please fix the errors above.${NC}"
    echo ""
    echo "For help, see:"
    echo "  - docs/guides/ONBOARDING.md"
    echo "  - docs/DEVELOPMENT.md"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit $EXIT_CODE
