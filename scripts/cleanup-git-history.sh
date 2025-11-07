#!/bin/bash

# Git History Cleanup Script - Remove Exposed Emails
# WARNING: This rewrites git history and requires force push
# Date: 2025-11-07

set -e  # Exit on error

echo "=================================================="
echo "Git History Cleanup - Remove Exposed Emails"
echo "=================================================="
echo ""
echo "⚠️  WARNING: This will rewrite git history!"
echo ""
echo "This script will:"
echo "  1. Replace exposed emails with REDACTED@example.com"
echo "  2. Rewrite all commits containing these emails"
echo "  3. Require force push to remote repository"
echo ""
echo "Emails to be removed from history:"
echo "  - REDACTED@example.com"
echo "  - REDACTED@example.com"
echo "  - REDACTED@example.com"
echo ""
echo "=================================================="
echo ""

# Safety check
read -p "Have you backed up the repository? (yes/no): " BACKUP_CONFIRM
if [ "$BACKUP_CONFIRM" != "yes" ]; then
    echo "❌ Please backup the repository first!"
    exit 1
fi

read -p "Have you notified all collaborators? (yes/no): " TEAM_CONFIRM
if [ "$TEAM_CONFIRM" != "yes" ]; then
    echo "❌ Please notify team members first!"
    exit 1
fi

read -p "Type 'REWRITE HISTORY' to confirm: " CONFIRM
if [ "$CONFIRM" != "REWRITE HISTORY" ]; then
    echo "❌ Aborted."
    exit 1
fi

echo ""
echo "✅ Starting cleanup process..."
echo ""

# Check current directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository!"
    exit 1
fi

# Create backup branch
BACKUP_BRANCH="backup-before-cleanup-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup branch: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"
echo "✅ Backup branch created"
echo ""

# Method 1: Using git-filter-repo (if available)
if command -v git-filter-repo &> /dev/null; then
    echo "🔧 Using git-filter-repo (modern method)..."
    
    # Create replacement file
    cat > /tmp/email-replacements.txt <<EOF
REDACTED@example.com==>REDACTED@example.com
REDACTED@example.com==>REDACTED@example.com
REDACTED@example.com==>REDACTED@example.com
EOF
    
    # Run filter-repo
    git filter-repo --replace-text /tmp/email-replacements.txt --force
    
    # Clean up
    rm /tmp/email-replacements.txt
    
    echo "✅ Emails replaced successfully"
    
else
    echo "🔧 git-filter-repo not found, using git-filter-branch..."
    echo ""
    
    # Method 2: Using git-filter-branch (slower but always available)
    git filter-branch --tree-filter '
        if [ -f src/lib/auth/allowlist.ts ]; then
            sed -i.bak "s/juanmanueldaza@gmail\.com/REDACTED@example.com/g" src/lib/auth/allowlist.ts
            sed -i.bak "s/camiladazamartinez@gmail\.com/REDACTED@example.com/g" src/lib/auth/allowlist.ts
            sed -i.bak "s/opablon@gmail\.com/REDACTED@example.com/g" src/lib/auth/allowlist.ts
            rm -f src/lib/auth/allowlist.ts.bak
        fi
    ' --all --force
    
    echo "✅ git-filter-branch completed"
fi

echo ""
echo "🧹 Cleaning up repository..."

# Clean up old references
if [ -d ".git/refs/original/" ]; then
    rm -rf .git/refs/original/
fi

# Expire reflog
git reflog expire --expire=now --all

# Garbage collection
git gc --prune=now --aggressive

echo "✅ Repository cleaned"
echo ""

# Verification
echo "🔍 Verifying cleanup..."
echo ""

FOUND_EMAILS=0

echo "Checking for: REDACTED@example.com"
if git log --all -S "REDACTED@example.com" | grep -q "commit"; then
    echo "  ❌ Still found in history!"
    FOUND_EMAILS=$((FOUND_EMAILS + 1))
else
    echo "  ✅ Not found"
fi

echo "Checking for: REDACTED@example.com"
if git log --all -S "REDACTED@example.com" | grep -q "commit"; then
    echo "  ❌ Still found in history!"
    FOUND_EMAILS=$((FOUND_EMAILS + 1))
else
    echo "  ✅ Not found"
fi

echo "Checking for: REDACTED@example.com"
if git log --all -S "REDACTED@example.com" | grep -q "commit"; then
    echo "  ❌ Still found in history!"
    FOUND_EMAILS=$((FOUND_EMAILS + 1))
else
    echo "  ✅ Not found"
fi

echo ""

if [ $FOUND_EMAILS -eq 0 ]; then
    echo "✅ Verification passed! All emails removed from history."
else
    echo "⚠️  Warning: Some emails may still be in history."
    echo "   Manual verification recommended."
fi

echo ""
echo "=================================================="
echo "Cleanup Summary"
echo "=================================================="
echo ""
echo "✅ Git history rewritten"
echo "✅ Exposed emails replaced with REDACTED@example.com"
echo "✅ Repository cleaned and optimized"
echo "📦 Backup branch: $BACKUP_BRANCH"
echo ""
echo "⚠️  IMPORTANT: Current file still needs updating!"
echo "   The current version of allowlist.ts uses environment"
echo "   variables, which is correct. History is now clean."
echo ""
echo "=================================================="
echo "Next Steps"
echo "=================================================="
echo ""
echo "1. Review the changes:"
echo "   git log --oneline -10"
echo ""
echo "2. Check current file:"
echo "   cat src/lib/auth/allowlist.ts"
echo ""
echo "3. If everything looks good, force push:"
echo "   git push --force --all origin"
echo "   git push --force --tags origin"
echo ""
echo "4. Notify team members to re-clone"
echo ""
echo "5. Update production secrets with ALLOWED_EMAILS"
echo ""
echo "⚠️  Remember: Force push will rewrite remote history!"
echo "   All collaborators will need to re-clone or reset."
echo ""
echo "=================================================="
echo ""
