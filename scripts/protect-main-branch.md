# Protect Main Branch on GitHub

## Overview

This guide helps you set up branch protection rules for the `main` branch in the `roofsonfire/chat` repository.

## Current Status

- **Repository**: `roofsonfire/chat`
- **Main Branch**: `main` (currently NOT protected ⚠️)
- **Your Role**: Owner (juanmanueldaza)

## Recommended Branch Protection Rules

### Option 1: Via GitHub Web UI (Easiest)

1. **Navigate to Settings**

   ```bash
   https://github.com/roofsonfire/chat/settings/branches
   ```

2. **Add Branch Protection Rule**
   - Click "Add rule" or "Add branch protection rule"
   - Branch name pattern: `main`

3. **Configure Protection Rules** (Recommended Settings):

   ✅ **Require a pull request before merging**
   - Require approvals: 1 (or more for team projects)
   - Dismiss stale pull request approvals when new commits are pushed
   - Require review from Code Owners (if you have CODEOWNERS file)

   ✅ **Require status checks to pass before merging**
   - Require branches to be up to date before merging
   - Status checks to require:
     - `test` (if you have GitHub Actions tests)
     - `build` (if you have GitHub Actions build)
     - `lint` (if you have linting checks)

   ✅ **Require conversation resolution before merging**
   - All conversations must be resolved before merging

   ✅ **Require signed commits** (Optional but recommended for security)

   ✅ **Require linear history**
   - Prevents merge commits, enforces rebase or squash

   ✅ **Do not allow bypassing the above settings**
   - Enforces rules for administrators

   ✅ **Restrict who can push to matching branches**
   - Add yourself and trusted collaborators

   ✅ **Allow force pushes**: ❌ DISABLED (recommended)

   ✅ **Allow deletions**: ❌ DISABLED (recommended)

4. **Save Changes**
   - Click "Create" or "Save changes"

---

### Option 2: Via GitHub CLI (Automated)

If you have GitHub CLI installed:

```bash
# Install gh CLI if not already installed
# Ubuntu/Debian: sudo apt install gh
# macOS: brew install gh
# Or download from: https://cli.github.com/

# Authenticate
gh auth login

# Create branch protection rule
gh api repos/roofsonfire/chat/branches/main/protection \
  --method PUT \
  --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["test", "build", "lint"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
EOF
```

---

### Option 3: Via GitHub REST API

```bash
# Using curl with GitHub Personal Access Token
# Token needs: repo scope

curl -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/roofsonfire/chat/branches/main/protection \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["test", "build", "lint"]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": false,
      "required_approving_review_count": 1
    },
    "restrictions": null,
    "required_linear_history": true,
    "allow_force_pushes": false,
    "allow_deletions": false,
    "required_conversation_resolution": true
  }'
```

---

## Minimal Protection (Good Starting Point)

If you're working solo or want a lighter setup:

```json
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

This prevents:

- Direct pushes to main (requires PR)
- Force pushes
- Branch deletion

---

## Recommended Workflow After Protection

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes and Commit**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push to GitHub**

   ```bash
   git push origin feature/my-feature
   ```

4. **Create Pull Request**

   ```bash
   # Via GitHub CLI
   gh pr create --title "Add new feature" --body "Description of changes"

   # Or via web: https://github.com/roofsonfire/chat/compare
   ```

5. **Merge PR** (after approval and checks pass)
   ```bash
   gh pr merge --squash  # Squash and merge
   # or
   gh pr merge --rebase  # Rebase and merge
   ```

---

## Current GitHub Actions Workflows

Based on your repository, you should require these status checks:

- ✅ `test` - Run tests before merging
- ✅ `build` - Ensure build succeeds
- ✅ `lint` - Enforce code quality

Check your `.github/workflows/` directory to see what workflows you have.

---

## Verification

After setting up protection, verify with:

```bash
# Via GitHub CLI
gh api repos/roofsonfire/chat/branches/main/protection

# Or check in web UI
# https://github.com/roofsonfire/chat/settings/branches
```

---

## Additional Recommendations

### 1. Add CODEOWNERS File

Create `.github/CODEOWNERS`:

```
# Default owners for everything
* @juanmanueldaza

# Specific paths
/src/components/ @juanmanueldaza
/src/lib/ @juanmanueldaza
/docs/ @juanmanueldaza
```

### 2. Add PR Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description

<!-- Describe your changes in detail -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

<!-- How has this been tested? -->

## Checklist

- [ ] Tests pass locally
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] No breaking changes
```

### 3. Add Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md`

---

## Need Help?

- GitHub Docs: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- Your repository: https://github.com/roofsonfire/chat

---

**Status**: Ready to implement! 🚀
**Priority**: High - Main branch is currently unprotected
