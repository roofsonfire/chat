#!/bin/bash

# Validation script to check if cleanup can proceed safely
# Run this before cleanup to identify any potential issues

echo "🔍 Pre-Cleanup Validation"
echo "========================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_check() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_fail() {
    echo -e "${RED}✗${NC} $1"
}

ISSUES_FOUND=0

echo "Checking prerequisites..."

# Check if we're in project root
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_fail "Not in project root directory"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    print_check "In project root directory"
fi

# Check git status
if ! git status >/dev/null 2>&1; then
    print_fail "Not in a git repository"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    print_check "Git repository detected"
    
    if ! git diff --quiet 2>/dev/null; then
        print_warn "Uncommitted changes detected"
        git status --porcelain | head -5
        echo "  ... (showing first 5 files)"
    else
        print_check "Working directory clean"
    fi
fi

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    print_fail "node_modules not found - run 'npm install'"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    print_check "Dependencies installed"
fi

echo ""
echo "Checking files targeted for cleanup..."

# Phase 1 checks
PHASE1_FILES=(
    "public/file.svg"
    "public/globe.svg" 
    "public/next.svg"
    "public/vercel.svg"
    "public/window.svg"
    "src/stories"
)

echo ""
echo "Phase 1 targets (unused assets):"
for file in "${PHASE1_FILES[@]}"; do
    if [ -e "$file" ]; then
        print_check "$file exists (will be removed)"
    else
        print_warn "$file not found (already removed?)"
    fi
done

# Phase 2 checks  
echo ""
echo "Phase 2 targets (unused code):"

if grep -q "VERTEX_AI_MODEL_MAPPING" src/lib/constants/vertex-ai-models.ts 2>/dev/null; then
    print_check "Found VERTEX_AI_MODEL_MAPPING export (will be removed)"
else
    print_warn "VERTEX_AI_MODEL_MAPPING not found (already removed?)"
fi

if grep -q "toReadableStream" src/lib/streaming/stream-utils.ts 2>/dev/null; then
    print_check "Found toReadableStream function (will be removed)"
else
    print_warn "toReadableStream function not found (already removed?)"
fi

if grep -q "performanceMark" src/lib/performance.ts 2>/dev/null; then
    print_check "Found performance helper functions (will be removed)"
else
    print_warn "Performance helper functions not found (already removed?)"
fi

# Phase 3 checks
echo ""
echo "Phase 3 targets (feature flags):"

if [ -d "src/lib/features" ]; then
    print_check "Feature flags directory exists (will be removed)"
else
    print_warn "Feature flags directory not found (already removed?)"
fi

if [ -f "src/lib/hooks/use-feature.ts" ]; then
    print_check "Feature hooks file exists (will be removed)"  
else
    print_warn "Feature hooks file not found (already removed?)"
fi

if [ -f "tests/unit/feature-flags.test.ts" ]; then
    print_check "Feature flags tests exist (will be removed)"
else
    print_warn "Feature flags tests not found (already removed?)"
fi

# Test that current build works
echo ""
echo "Testing current build state..."

if npm run lint >/dev/null 2>&1; then
    print_check "Lint check passes"
else
    print_fail "Lint check fails - fix before cleanup"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if npm run build >/dev/null 2>&1; then
    print_check "Build succeeds"
else
    print_fail "Build fails - fix before cleanup"  
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check tests (run in CI mode to avoid hanging)
if npx vitest run --reporter=basic >/dev/null 2>&1; then
    print_check "Tests pass"
else
    print_fail "Tests fail - fix before cleanup"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "==========================="

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready for cleanup.${NC}"
    echo ""
    echo "To proceed:"
    echo "  ./scripts/cleanup.sh"
else
    echo -e "${RED}❌ $ISSUES_FOUND issue(s) found. Please fix before cleanup.${NC}"
    exit 1
fi