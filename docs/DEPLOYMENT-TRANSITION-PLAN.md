# 🎯 Deployment Transition Plan: Staging → Production

**Status**: ✅ Phase 1 & 2 Complete - Repository Public & Protected  
**Date**: November 7, 2025

## ✅ Completed Steps

### 1. Git Repository Setup ✓

- [x] Created `develop` branch from `main`
- [x] Pushed `develop` branch to GitHub
- [x] Updated CI workflow to trigger on both `develop` and `main`
- [x] Renamed deployment workflow: `deploy-staging.yml` → `deploy-production.yml`
- [x] Updated workflow to deploy to `chat-production` service
- [x] Updated all configuration references

### 2. Scripts & Documentation ✓

- [x] Renamed: `deploy-staging.sh` → `deploy-production.sh`
- [x] Updated script configuration (service name, domain)
- [x] Updated README.md with new git workflow
- [x] Updated docs/PROJECT-STATUS.md
- [x] Updated docs/README.md
- [x] Updated docs/deployment/CLOUD-RUN-DEPLOYMENT.md
- [x] Updated .github/copilot-instructions.md
- [x] All changes committed and pushed to `develop` branch

### 3. Security Audit & Public Release ✓

- [x] Comprehensive security scan using GitHub MCP tools
- [x] Validated no secrets in codebase or commit history (100 commits reviewed)
- [x] Verified .gitignore properly configured
- [x] Confirmed all credentials in GitHub Secrets and Google Cloud Secret Manager
- [x] Created SECURITY-CLEARANCE-REPORT.md with audit results
- [x] **Repository made public** (visibility: PUBLIC)

### 4. Branch Protection Rules ✓

- [x] **`main` branch protection**:
  - Requires pull request with 1 approval
  - Requires CI checks: unit-tests, build-check
  - Dismisses stale reviews
  - Strict status check (branch must be up to date)
- [x] **`develop` branch protection**:
  - Requires CI check: unit-tests
  - Allows direct pushes (for rapid development)
  - Non-strict status checks

### 5. GitHub Security Features ✓

- [x] **Secret scanning** enabled - detects accidentally committed secrets
- [x] **Secret scanning push protection** enabled - prevents commits with secrets
- [x] **Dependabot vulnerability alerts** enabled - monitors dependencies
- [x] **Automated security fixes** enabled - creates PRs for security updates
- [x] **Dependabot configuration** added (`.github/dependabot.yml`):
  - Weekly npm dependency updates (Mondays 9 AM ART)
  - GitHub Actions workflow updates
  - Docker base image updates
  - Grouped minor/patch updates
- [x] **CodeQL security scanning** added (`.github/workflows/codeql.yml`):
  - Runs on push to main/develop
  - Runs on PRs to main
  - Weekly scheduled scan (Mondays 3:30 AM UTC)
  - JavaScript/TypeScript analysis

## 🔄 Next Steps - Manual Configuration Required

### ~~Step 1: GitHub Branch Protection~~ ✅ COMPLETED

Branch protection rules successfully configured via GitHub API:

- ✅ **`main` branch**: Requires PR + 1 approval + CI checks (unit-tests, build-check)
- ✅ **`develop` branch**: Requires CI check (unit-tests), allows direct pushes

**Verification**: https://github.com/roofsonfire/chat/settings/branches

---

### Step 2: Google Cloud OAuth Setup (20 minutes)

**Go to**: https://console.cloud.google.com/apis/credentials?project=norse-breaker-474323-n8

#### Create Production OAuth Client:

1. Click "Create Credentials" → "OAuth 2.0 Client ID"
2. Configure:
   - Application type: `Web application`
   - Name: `Chat Application - Production`
   - Authorized JavaScript origins:
     - `https://chat.daza.ar`
   - Authorized redirect URIs:
     - `https://chat.daza.ar/api/auth/callback/google`
3. Click "Create"
4. **Save the Client ID and Client Secret**

#### Create Development OAuth Client (for localhost):

1. Click "Create Credentials" → "OAuth 2.0 Client ID"
2. Configure:
   - Application type: `Web application`
   - Name: `Chat Application - Development`
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
3. Click "Create"
4. **Save the Client ID and Client Secret**

#### Update Local `.env.local`:

```bash
# Add development OAuth credentials
GOOGLE_CLIENT_ID=your-dev-client-id-here
GOOGLE_CLIENT_SECRET=your-dev-client-secret-here
```

### Step 3: Update Google Cloud Secrets (10 minutes)

**Update production OAuth secrets:**

```bash
# Update production Google Client ID
echo -n "PRODUCTION_CLIENT_ID" | gcloud secrets versions add google-client-id --data-file=-

# Update production Google Client Secret
echo -n "PRODUCTION_CLIENT_SECRET" | gcloud secrets versions add google-client-secret --data-file=-

# Verify secrets were updated
gcloud secrets versions list google-client-id
gcloud secrets versions list google-client-secret
```

### Step 4: DNS Configuration in Namecheap (10 minutes + wait)

**Go to**: Namecheap Dashboard → Domain List → daza.ar → Advanced DNS

#### Add Production CNAME Record:

```
Type: CNAME Record
Host: chat
Value: ghs.googlehosted.com
TTL: 1800 (for testing, increase to 3600 later)
```

#### Keep Staging Record (for backup):

```
Type: CNAME Record
Host: staging.chat
Value: ghs.googlehosted.com
TTL: 3600
```

**Wait 5-30 minutes for DNS propagation**

Test with: `dig chat.daza.ar`

### Step 5: Verify Domain in Google Cloud (15 minutes)

**Go to**: https://console.cloud.google.com/run/domains?project=norse-breaker-474323-n8

1. Click "Add Mapping"
2. Enter domain: `chat.daza.ar`
3. If not verified, follow prompts to verify via Google Search Console
4. Add any required TXT records to Namecheap DNS
5. Wait for verification (5-10 minutes)
6. Confirm "Verified" status

### Step 6: Deploy Production Service (30 minutes)

**Option A: Manual Deployment (Recommended for first time)**

```bash
# Make sure you're on develop branch
git checkout develop
git pull origin develop

# Run the deployment script
chmod +x scripts/deployment/deploy-production.sh
./scripts/deployment/deploy-production.sh
```

The script will:

- Create `chat-production` Cloud Run service
- Deploy current code
- Map `chat.daza.ar` domain
- Configure all environment variables and secrets

**Option B: Via GitHub Actions (After testing manual)**

1. Merge `develop` to `main`:
   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   ```
2. GitHub Actions will automatically deploy

### Step 7: Test Production Deployment (15 minutes)

#### Test Checklist:

- [ ] Visit https://chat.daza.ar (should load)
- [ ] SSL certificate is valid (🔒 in browser)
- [ ] Login with Google OAuth works
- [ ] Can send chat messages
- [ ] AI responds correctly
- [ ] Can upload images
- [ ] Rate limiting works (try rapid requests)
- [ ] Mobile view works
- [ ] Check logs: `gcloud run logs read chat-production --region=us-central1 --limit=50`

#### If Issues Occur:

```bash
# Check service status
gcloud run services describe chat-production --region=us-central1

# Check domain mapping
gcloud run domain-mappings describe --domain=chat.daza.ar --region=us-central1

# View recent logs
gcloud run logs read chat-production --region=us-central1 --limit=100

# Rollback if needed
gcloud run services update-traffic chat-production \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region=us-central1
```

### Step 8: Update Remaining Documentation (Optional, 1 hour)

Files that may still reference staging:

```bash
# Find all remaining references
grep -r "staging.chat.daza.ar" docs/
grep -r "chat-staging" docs/
grep -r "deploy-staging" scripts/

# Update as needed
```

Key files to check:

- [ ] `docs/deployment/DEPLOYMENT-CHECKLIST.md`
- [ ] `docs/deployment/MANUAL-DEPLOY-COMMANDS.md`
- [ ] `docs/deployment/GITHUB-ACTIONS-DEPLOYMENT.md`
- [ ] `scripts/interactive-oauth-setup.sh`
- [ ] `scripts/setup-oauth-secrets.sh`
- [ ] `scripts/diagnose-oauth.sh`

### Step 9: Cleanup (After 1-2 weeks)

**Only after production is stable:**

```bash
# Delete old staging service (keeps backups for 30 days)
gcloud run services delete chat-staging --region=us-central1

# Optional: Remove staging DNS record from Namecheap
# (or keep it pointing to old service as emergency backup)
```

## 📊 Current Status

### Git Branches

- ✅ `develop` - Created and configured
- ✅ `main` - Ready for production deployment
- ⏳ Branch protection - **Needs manual setup**

### Cloud Run Services

- ✅ `chat-staging` - Currently running (backup)
- ⏳ `chat-production` - **Ready to deploy**

### Domains

- ✅ `staging.chat.daza.ar` - Active (backup)
- ⏳ `chat.daza.ar` - **Needs DNS + verification**

### OAuth Clients

- ✅ Staging OAuth - Already configured
- ⏳ Production OAuth - **Needs creation**
- ⏳ Development OAuth - **Needs creation**

### Secrets

- ✅ Base secrets exist (auth, nextauth)
- ⏳ OAuth secrets - **Need update with production credentials**

## 🎯 Success Criteria

✅ **Complete when:**

1. `https://chat.daza.ar` is live and accessible
2. Production OAuth login works
3. All chat features functional
4. GitHub Actions auto-deploy from `main` works
5. Local development works on `develop` branch
6. Branch protection enforced
7. Old staging service still available as backup

## ⚠️ Rollback Plan

If anything goes wrong:

1. **DNS Rollback**: Keep using `staging.chat.daza.ar`
2. **Service Rollback**: Old `chat-staging` service still running
3. **Code Rollback**: Revert commits or use previous Cloud Run revision
4. **OAuth Rollback**: Keep old staging OAuth client active

## 📞 Support Resources

- **Google Cloud Console**: https://console.cloud.google.com
- **GitHub Repository**: https://github.com/roofsonfire/chat
- **Cloud Run Docs**: https://cloud.google.com/run/docs
- **OAuth Setup Guide**: `OAUTH-SETUP.md`
- **Deployment Guide**: `deployment/CLOUD-RUN-DEPLOYMENT.md`

---

**Next Action**: Start with Step 1 (GitHub Branch Protection) and work through steps 2-7 sequentially.

**Estimated Total Time**: 2-3 hours (including wait times for DNS/verification)

**Best Time to Do This**: Weekend or low-traffic period
