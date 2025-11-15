#!/bin/bash

# Branch Protection Setup Script
# Repository: roofsonfire/chat
# Branch: main

set -e

OWNER="roofsonfire"
REPO="chat"
BRANCH="main"

echo "🔒 Setting up branch protection for ${OWNER}/${REPO}/${BRANCH}"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo ""
    echo "Install it with:"
    echo "  Ubuntu/Debian: sudo apt install gh"
    echo "  macOS: brew install gh"
    echo "  Or download from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo ""
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Ask for protection level
echo "Select protection level:"
echo "  1) Strict (recommended for production)"
echo "     - Require PR reviews (1 approval)"
echo "     - Require status checks (test, build, lint)"
echo "     - Require conversation resolution"
echo "     - Enforce for admins"
echo "     - No force push or deletion"
echo ""
echo "  2) Moderate (good for small teams)"
echo "     - Require PR (no review required)"
echo "     - Basic status checks"
echo "     - No force push or deletion"
echo ""
echo "  3) Minimal (solo development)"
echo "     - Require PR only"
echo "     - No force push or deletion"
echo ""
read -p "Enter choice (1-3): " CHOICE

case $CHOICE in
    1)
        echo ""
        echo "🔐 Applying STRICT protection rules..."
        gh api repos/${OWNER}/${REPO}/branches/${BRANCH}/protection \
          --method PUT \
          --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["test", "build", "lint"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
EOF
        ;;
    2)
        echo ""
        echo "🔒 Applying MODERATE protection rules..."
        gh api repos/${OWNER}/${REPO}/branches/${BRANCH}/protection \
          --method PUT \
          --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": []
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": false,
  "lock_branch": false,
  "allow_fork_syncing": true
}
EOF
        ;;
    3)
        echo ""
        echo "🔓 Applying MINIMAL protection rules..."
        gh api repos/${OWNER}/${REPO}/branches/${BRANCH}/protection \
          --method PUT \
          --input - <<EOF
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": false,
  "lock_branch": false,
  "allow_fork_syncing": true
}
EOF
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Branch protection rules applied successfully!"
echo ""
echo "Verify at: https://github.com/${OWNER}/${REPO}/settings/branches"
echo ""
echo "To view current protection:"
echo "  gh api repos/${OWNER}/${REPO}/branches/${BRANCH}/protection"
echo ""
echo "🎉 Done! Your main branch is now protected."
