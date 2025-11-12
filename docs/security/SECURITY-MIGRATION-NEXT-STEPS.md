# Security Migration - Next Steps

**Date:** November 7, 2025
**Status:** ✅ Code Updated, ⏳ History Cleanup Pending
**Priority:** HIGH - Must complete before making repository public

---

## ✅ Completed (Just Now)

1. **Code Updated** ✅
   - Moved allowlist to environment variables
   - Added Zod validation for ALLOWED_EMAILS
   - Created ADR 006 documenting the decision
   - Updated .env.example
   - Created cleanup guide and automated script

2. **Committed** ✅
   - Commit: `f2aa371`
   - Branch: `develop`
   - Ready to push

---

## ⏳ Pending Actions (Do These Next)

### Step 1: Push Current Changes

```bash
git push origin develop
```

This pushes the new environment-variable-based code (but history still contains old emails).

### Step 2: Run Git History Cleanup

**⚠️ WARNING: This rewrites history and requires force push!**

```bash
# Review the script first
cat scripts/cleanup-git-history.sh

# Run the cleanup (interactive, will ask for confirmation)
./scripts/cleanup-git-history.sh
```

The script will:

- Create a backup branch
- Replace emails with `REDACTED@example.com` in all commits
- Clean up repository
- Verify emails are removed
- Provide instructions for force push

### Step 3: Verify Cleanup

After running the script:

```bash
# Should return NO results
git log --all -S "REDACTED@example.com"
git log --all -S "REDACTED@example.com"
git log --all -S "REDACTED@example.com"

# Check current file (should use env vars)
cat src/lib/auth/allowlist.ts

# Review recent commits
git log --oneline -10
```

### Step 4: Force Push (After Verification)

**Only if verification passes:**

```bash
# This REWRITES remote history
git push --force --all origin
git push --force --tags origin
```

### Step 5: Update Production Secrets

Create the new secret in Google Cloud:

```bash
# Create allowed-emails secret
gcloud secrets create allowed-emails \
  --project=norse-breaker-474323-n8 \
  --replication-policy="automatic" \
  --data-file=- <<< "REDACTED@example.com,REDACTED@example.com,REDACTED@example.com"

# Verify
gcloud secrets versions access latest --secret=allowed-emails
```

### Step 6: Update Cloud Run Deployments

Update production deployment to include the new secret:

```bash
# Update production
gcloud run services update chat-production \
  --region=us-central1 \
  --update-secrets=ALLOWED_EMAILS=allowed-emails:latest

# Update staging (if exists)
gcloud run services update chat-staging \
  --region=us-central1 \
  --update-secrets=ALLOWED_EMAILS=allowed-emails:latest
```

### Step 7: Update Local Environment

Create/update `.env.local`:

```bash
# Add to .env.local
echo 'ALLOWED_EMAILS=REDACTED@example.com,REDACTED@example.com,REDACTED@example.com' >> .env.local
```

### Step 8: Update GitHub Secrets (for CI/CD)

In GitHub repository settings → Secrets:

```text
Name: TEST_ALLOWED_EMAILS
Value: test@example.com,user@example.com
```

Update `.github/workflows/ci.yml` to include:

```yaml
env:
  ALLOWED_EMAILS: ${{ secrets.TEST_ALLOWED_EMAILS }}
```

### Step 9: Notify Team Members

Send notification to all collaborators:

````markdown
Subject: Git History Rewritten - Action Required

The repository history has been rewritten to remove exposed email addresses.

Please update your local clone:

Option 1 (Recommended): Fresh clone

```bash
cd ~/Projects/roofs
mv chat chat-old-backup
git clone https://github.com/roofsonfire/chat.git
cd chat
```
````

Option 2: Force pull

```bash
cd ~/Projects/roofs/chat
git fetch origin
git reset --hard origin/develop
```

Reason: Security improvement - moved allowlist to environment variables
See: adr/006-environment-based-allowlist.md

````text

---

## 📋 Verification Checklist

Before making repository public, verify:

- [ ] Current code uses environment variables (not hardcoded emails)
- [ ] Git history cleanup completed successfully
- [ ] No emails found in `git log --all -S "email@example.com"`
- [ ] Force push completed to remote
- [ ] Production secret `allowed-emails` created in GCP
- [ ] Cloud Run updated with new secret
- [ ] Staging environment updated (if exists)
- [ ] Local `.env.local` has `ALLOWED_EMAILS`
- [ ] GitHub CI/CD secrets updated
- [ ] Team members notified
- [ ] Tests passing after changes
- [ ] Application works with new environment variable

---

## 🔄 Rollback Plan (If Needed)

If something goes wrong:

```bash
# The cleanup script creates a backup branch
git branch  # Find backup branch (backup-before-cleanup-YYYYMMDD-HHMMSS)

# Restore from backup
git checkout backup-before-cleanup-YYYYMMDD-HHMMSS
git checkout -b develop-restored
git push --force origin develop-restored:develop
````

---

## 📊 Risk Assessment

| Risk                    | Likelihood | Impact | Mitigation                              |
| ----------------------- | ---------- | ------ | --------------------------------------- |
| Force push fails        | Low        | Medium | Backup branch created automatically     |
| Team clone breaks       | High       | Low    | Clear update instructions provided      |
| Production down         | Very Low   | High   | Zero-downtime deployment, easy rollback |
| Emails still in history | Low        | High   | Automated verification script           |

---

## 🎯 Success Criteria

✅ **Security:**

- No emails in git history
- Emails stored in secure Secret Manager
- Privacy protection implemented

✅ **Functionality:**

- Application works with new env var
- All tests passing
- Production running smoothly

✅ **Team:**

- All collaborators updated successfully
- Clear documentation of changes
- ADR documenting decision

---

## References

- [ADR 006: Environment-Based Allowlist](adr/006-environment-based-allowlist.md)
- [Git History Cleanup Guide](GIT-HISTORY-CLEANUP.md)
- [Security Audit](SECURITY-AUDIT.md)

---

## ⏱️ Estimated Timeline

1. Push current changes: **2 minutes**
2. Run cleanup script: **5-10 minutes** (depending on repo size)
3. Verify cleanup: **5 minutes**
4. Force push: **2 minutes**
5. Update GCP secrets: **5 minutes**
6. Update deployments: **10 minutes** (deployment time)
7. Notify team: **5 minutes**

### Total: ~35-45 minutes

---

## 🚀 Ready to Execute?

Review this checklist, then proceed with **Step 1** (push current changes).

**Current Status:**

- ✅ Code ready
- ✅ Committed locally
- ⏳ Waiting for push and history cleanup

**Next Command:**

```bash
git push origin develop
```

---

**Created:** 2025-11-07
**Last Updated:** 2025-11-07
**Status:** Ready for execution
