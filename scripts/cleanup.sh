#!/bin/bash

# Main Dead Code Cleanup Script
# Orchestrates the removal of unused code and assets

set -e

echo "🧹 Dead Code Cleanup - Interactive Mode"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check prerequisites
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

if [ ! -f "CLEANUP_PLAN.md" ]; then
    print_error "CLEANUP_PLAN.md not found. Please ensure it exists before running cleanup."
    exit 1
fi

echo "This script will help you remove dead code from your application."
echo "It's organized into 3 phases with increasing risk levels:"
echo ""
echo "📋 PHASES OVERVIEW:"
echo ""
echo "Phase 1 (LOW RISK):"
echo "  - Remove unused SVG assets (5 files)"
echo "  - Remove Storybook demo components"
echo "  - Estimated savings: ~200 lines + 5 files"
echo ""
echo "Phase 2 (MEDIUM RISK):"
echo "  - Remove unused exports and functions"
echo "  - Clean up redundant code"
echo "  - Estimated savings: ~190 lines"
echo ""
echo "Phase 3 (HIGH RISK):"
echo "  - Remove entire feature flag system"
echo "  - Estimated savings: ~400 lines"
echo "  - ⚠️  Only do this if you don't plan to use feature flags"
echo ""

read -p "Do you want to proceed with the cleanup? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

# Check git status
if ! git diff --quiet 2>/dev/null; then
    print_warning "You have uncommitted changes."
    print_status "Current git status:"
    git status --porcelain
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please commit or stash your changes first."
        exit 1
    fi
fi

# Phase selection
echo ""
print_status "Which phases would you like to run?"
echo ""
echo "1) Phase 1 only (safest - removes unused assets)"
echo "2) Phases 1 + 2 (recommended - removes unused code)"  
echo "3) All phases 1 + 2 + 3 (removes feature flags too)"
echo "4) Custom selection"
echo ""
read -p "Enter your choice (1-4): " -n 1 -r PHASE_CHOICE
echo

case $PHASE_CHOICE in
    1)
        RUN_PHASE1=true
        RUN_PHASE2=false
        RUN_PHASE3=false
        ;;
    2)
        RUN_PHASE1=true
        RUN_PHASE2=true
        RUN_PHASE3=false
        ;;
    3)
        RUN_PHASE1=true
        RUN_PHASE2=true
        RUN_PHASE3=true
        ;;
    4)
        echo ""
        read -p "Run Phase 1 (remove assets)? (Y/n) " -r
        RUN_PHASE1=true
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            RUN_PHASE1=false
        fi
        
        read -p "Run Phase 2 (remove unused code)? (Y/n) " -r  
        RUN_PHASE2=true
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            RUN_PHASE2=false
        fi
        
        read -p "Run Phase 3 (remove feature flags)? (y/N) " -r
        RUN_PHASE3=false
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            RUN_PHASE3=true
        fi
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
print_status "Execution Plan:"
echo "Phase 1 (Assets): $([ "$RUN_PHASE1" = true ] && echo "✅ YES" || echo "❌ NO")"
echo "Phase 2 (Code): $([ "$RUN_PHASE2" = true ] && echo "✅ YES" || echo "❌ NO")"  
echo "Phase 3 (Features): $([ "$RUN_PHASE3" = true ] && echo "✅ YES" || echo "❌ NO")"
echo ""

read -p "Proceed with this plan? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

# Execute phases
START_TIME=$(date +%s)

if [ "$RUN_PHASE1" = true ]; then
    echo ""
    print_status "🚀 Executing Phase 1..."
    if [ -f "scripts/cleanup-phase1.sh" ]; then
        ./scripts/cleanup-phase1.sh
    else
        print_error "scripts/cleanup-phase1.sh not found"
        exit 1
    fi
fi

if [ "$RUN_PHASE2" = true ]; then
    echo ""
    print_status "🚀 Executing Phase 2..."
    if [ -f "scripts/cleanup-phase2.sh" ]; then
        ./scripts/cleanup-phase2.sh
    else
        print_error "scripts/cleanup-phase2.sh not found"
        exit 1
    fi
fi

if [ "$RUN_PHASE3" = true ]; then
    echo ""
    print_status "🚀 Executing Phase 3..."
    if [ -f "scripts/cleanup-phase3.sh" ]; then
        ./scripts/cleanup-phase3.sh
    else
        print_error "scripts/cleanup-phase3.sh not found"
        exit 1
    fi
fi

# Final summary
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "🎉 CLEANUP COMPLETED SUCCESSFULLY! 🎉"
echo "======================================"
print_success "Time taken: ${DURATION} seconds"
print_success "Branch: $(git branch --show-current)"

# Show what was accomplished
echo ""
echo "📊 SUMMARY:"
if [ "$RUN_PHASE1" = true ]; then
    echo "✅ Phase 1: Removed unused assets and demo components"
fi
if [ "$RUN_PHASE2" = true ]; then
    echo "✅ Phase 2: Removed unused exports and functions"  
fi
if [ "$RUN_PHASE3" = true ]; then
    echo "✅ Phase 3: Removed feature flag system"
fi

echo ""
echo "📋 RECOMMENDED NEXT STEPS:"
echo "1. Run full test suite:"
echo "   npx vitest run && npm run test:e2e"
echo ""
echo "2. Test the application:"
echo "   npm run dev"
echo ""  
echo "3. Review changes:"
echo "   git log --oneline -10"
echo ""
echo "4. When satisfied, merge to main:"
echo "   git checkout main"
echo "   git merge $(git branch --show-current)"
echo ""

print_status "Cleanup completed! Your codebase is now leaner and cleaner. 🧹✨"