#!/bin/bash

# Dead Code Cleanup Script
# Removes confirmed unused files and code from the chat application

set -e  # Exit on any error

echo "🧹 Starting dead code cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

# Check for clean git state
if ! git diff --quiet 2>/dev/null; then
    print_warning "You have uncommitted changes. Consider committing or stashing them first."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create backup branch
print_status "Creating backup branch..."
BRANCH_NAME="cleanup/remove-dead-code-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BRANCH_NAME"
print_success "Created branch: $BRANCH_NAME"

# Phase 1: Remove unused public assets
print_status "Phase 1: Removing unused public assets..."

UNUSED_ASSETS=(
    "public/file.svg"
    "public/globe.svg"
    "public/next.svg"
    "public/vercel.svg"
    "public/window.svg"
)

for asset in "${UNUSED_ASSETS[@]}"; do
    if [ -f "$asset" ]; then
        rm "$asset"
        print_success "Removed $asset"
    else
        print_warning "$asset not found (already removed?)"
    fi
done

# Phase 1: Remove Storybook demo components
print_status "Removing Storybook demo components..."
if [ -d "src/stories" ]; then
    rm -rf "src/stories"
    print_success "Removed src/stories/ directory"
else
    print_warning "src/stories/ not found (already removed?)"
fi

# Validate Phase 1
print_status "Validating Phase 1 changes..."

echo "Running lint check..."
if npm run lint > /dev/null 2>&1; then
    print_success "Lint check passed"
else
    print_error "Lint check failed"
    exit 1
fi

echo "Running build check..."
if npm run build > /dev/null 2>&1; then
    print_success "Build check passed"
else
    print_error "Build check failed"
    exit 1
fi

echo "Running tests..."
if npx vitest run --reporter=basic > /dev/null 2>&1; then
    print_success "Tests passed"
else
    print_error "Tests failed"
    exit 1
fi

# Commit Phase 1
git add -A
git commit -m "cleanup: remove unused public assets and Storybook demo components

- Remove unused SVG assets (file.svg, globe.svg, next.svg, vercel.svg, window.svg)
- Remove Storybook demo components directory (src/stories/)
- These were template files not used by the application"

print_success "Phase 1 complete and committed!"

# Phase 2 requires manual edits - provide instructions
print_status "Phase 2 requires manual code edits."
echo ""
echo "Next steps:"
echo "1. Edit src/lib/constants/vertex-ai-models.ts - remove VERTEX_AI_MODEL_MAPPING and AVAILABLE_MODELS exports"
echo "2. Edit src/lib/streaming/stream-utils.ts - remove toReadableStream function (keep types)"
echo "3. Edit src/lib/performance.ts - remove performanceMark, performanceMeasure, trackEvent functions"
echo "4. Run ./scripts/cleanup-phase2.sh when manual edits are complete"
echo ""
echo "Or run individual validation:"
echo "  npm run lint && npm run build && npm run test"

print_success "Cleanup Phase 1 completed successfully!"
print_status "Current branch: $BRANCH_NAME"
print_status "Files removed: ${#UNUSED_ASSETS[@]} assets + 1 directory"