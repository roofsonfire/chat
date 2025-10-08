#!/bin/bash

# Dead Code Cleanup Script - Phase 3
# Removes the entire feature flag system (high-impact change)

set -e  # Exit on aecho "Running tests..."
if npx vitest run --reporter=basic >/dev/null 2>&1; then
    print_success "Tests passed"
else
    print_error "Tests failed"
    exit 1
fir

echo "🧹 Starting Phase 3 cleanup (feature flag system removal)..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_warning "⚠️  PHASE 3 WARNING ⚠️"
echo "This will remove the entire feature flag system including:"
echo "- src/lib/features/ directory"
echo "- src/lib/hooks/use-feature.ts"  
echo "- tests/unit/feature-flags.test.ts"
echo "- Related documentation sections"
echo ""
print_warning "This is a high-impact change and should only be done if you're certain"
print_warning "feature flags won't be needed in the future."
echo ""
read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Phase 3 cancelled."
    exit 0
fi

print_status "Phase 3: Removing feature flag system..."

# Check if feature flag files exist
FEATURE_DIRS_EXIST=false
if [ -d "src/lib/features" ] || [ -f "src/lib/hooks/use-feature.ts" ] || [ -f "tests/unit/feature-flags.test.ts" ]; then
    FEATURE_DIRS_EXIST=true
fi

if [ "$FEATURE_DIRS_EXIST" = false ]; then
    print_warning "Feature flag files not found - may have been already removed"
    echo "Nothing to do for Phase 3."
    exit 0
fi

# Remove feature flag directories and files
print_status "Removing feature flag implementation files..."

if [ -d "src/lib/features" ]; then
    rm -rf "src/lib/features"
    print_success "Removed src/lib/features/ directory"
fi

if [ -f "src/lib/hooks/use-feature.ts" ]; then
    rm "src/lib/hooks/use-feature.ts"
    print_success "Removed src/lib/hooks/use-feature.ts"
fi

if [ -f "tests/unit/feature-flags.test.ts" ]; then
    rm "tests/unit/feature-flags.test.ts"
    print_success "Removed tests/unit/feature-flags.test.ts"
fi

# Check if hooks directory is now empty
if [ -d "src/lib/hooks" ] && [ -z "$(ls -A src/lib/hooks)" ]; then
    rmdir "src/lib/hooks"
    print_success "Removed empty src/lib/hooks/ directory"
fi

# Update documentation files to remove feature flag references
print_status "Updating documentation..."

# Update copilot instructions to remove feature flag sections
if [ -f ".github/copilot-instructions.md" ]; then
    # Create backup
    cp ".github/copilot-instructions.md" ".github/copilot-instructions.md.backup"
    
    # Remove feature flag sections (this is a simplified approach)
    # In practice, you'd want to manually review and edit these files
    print_warning "Manual edit required: .github/copilot-instructions.md"
    print_status "Backup created: .github/copilot-instructions.md.backup"
fi

# Remove feature flags documentation file
if [ -f "docs/features/FEATURE-FLAGS.md" ]; then
    mv "docs/features/FEATURE-FLAGS.md" "docs/features/FEATURE-FLAGS.md.removed"
    print_success "Moved docs/features/FEATURE-FLAGS.md to .removed"
fi

# Validate changes
print_status "Validating Phase 3 changes..."

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
if npm run test > /dev/null 2>&1; then
    print_success "Tests passed"
else
    print_error "Tests failed"
    exit 1
fi

# Commit changes
git add -A
git commit -m "cleanup: remove feature flag system

- Remove src/lib/features/ directory (flags.ts, server.ts, index.ts)
- Remove src/lib/hooks/use-feature.ts
- Remove tests/unit/feature-flags.test.ts  
- Move feature flags documentation to .removed

This removes ~400 lines of unused feature flag infrastructure.
The system was not used in the application runtime code."

print_success "Phase 3 complete and committed!"

echo ""
echo "🎉 ALL CLEANUP PHASES COMPLETED! 🎉"
echo ""
echo "Summary of all changes:"
echo "Phase 1: Removed unused assets and Storybook demos"
echo "Phase 2: Removed unused exports and functions (~190 lines)"
echo "Phase 3: Removed feature flag system (~400 lines)"
echo ""
echo "Total estimated lines removed: ~590+ lines"
echo "Files removed: 5 SVG assets + multiple source files"
echo ""
print_success "Codebase successfully cleaned up!"

echo ""
echo "Next steps:"
echo "1. Run full test suite: npm run test && npm run test:e2e"
echo "2. Test the application locally"
echo "3. Review the changes: git log --oneline"
echo "4. Merge to main when ready: git checkout main && git merge $(git branch --show-current)"

print_status "Current branch: $(git branch --show-current)"