# Common Mistakes & Solutions

Quick reference for issues developers commonly encounter while working on this project.

## 🔧 Environment Configuration

### Mistake: Missing Protocol in NEXTAUTH_URL

**Symptom**: OAuth redirect fails with `invalid_request` error

**Wrong**:

```bash
NEXTAUTH_URL=localhost:3000
NEXTAUTH_URL=chat.daza.ar
```

**Correct**:

```bash
# Local development
NEXTAUTH_URL=http://localhost:3000

# Production
NEXTAUTH_URL=https://chat.daza.ar
```

---

### Mistake: Wrong Vertex AI Region

**Symptom**: `Model not found` or `404` errors from Vertex AI

**Issue**: Gemini 2.5 models are not available in all regions

**Solution**: Use supported regions:

```bash
# Supported regions (as of Nov 2025)
GOOGLE_LOCATION=us-central1  # ✅ Recommended
GOOGLE_LOCATION=us-east1     # ✅ Supported
GOOGLE_LOCATION=us-west1     # ✅ Supported
GOOGLE_LOCATION=europe-west1 # ✅ Supported

# Check model availability
node tests/manual/test-available-models.mjs
```

---

### Mistake: Forgotten Password Hash Generation

**Symptom**: Login always fails with credentials provider

**Issue**: Copied example hash instead of generating your own

**Fix**:

```bash
# Generate proper bcrypt hash
npm run hash-password

# Enter your password when prompted
# Copy the output hash to .env.local
AUTH_USER_PASSWORD_HASH=<paste-hash-here>
```

**Why it matters**: Each hash is unique. Example hashes from docs won't work for your password.

---

## ☁️ Google Cloud Setup

### Mistake: Application Default Credentials Not Set

**Symptom**: `Could not load the default credentials` error

**Root Cause**: Local environment not authenticated with Google Cloud

**Solution**:

```bash
# Option 1: Login with gcloud (recommended for local dev)
gcloud auth application-default login

# Option 2: Use service account (CI/CD or production)
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Verify authentication
gcloud auth application-default print-access-token
```

---

### Mistake: Vertex AI API Not Enabled

**Symptom**: `Permission denied` or `API not enabled for project` errors

**Solution**:

```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID

# Verify enabled services
gcloud services list --enabled | grep vertex

# Expected output:
# aiplatform.googleapis.com  Vertex AI API
```

---

### Mistake: Wrong Project ID

**Symptom**: Resources not found, billing errors, "project not found"

**Diagnosis**:

```bash
# Check current project
gcloud config get-value project

# List all available projects
gcloud projects list

# Check environment variable
echo $GOOGLE_PROJECT_ID
```

**Solution**:

```bash
# Set correct project globally
gcloud config set project YOUR_CORRECT_PROJECT_ID

# Or set in .env.local
GOOGLE_PROJECT_ID=your-correct-project-id
```

---

## 💻 Development

### Mistake: Port Already in Use

**Symptom**: `Error: listen EADDRINUSE: address already in use :::3000`

**Cause**: Another process is using port 3000 (maybe a zombie Next.js process)

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000

# Output shows:
# COMMAND   PID   USER
# node    12345  you

# Kill the process
kill -9 12345

# Or use a different port
PORT=3001 npm run dev
```

**Preventive**: Always stop dev server with Ctrl+C instead of closing terminal.

---

### Mistake: Stale Node Modules

**Symptom**:

- Strange TypeScript errors
- Missing dependencies after pulling new code
- "Cannot find module" errors for packages that exist

**Solution**:

```bash
# Nuclear option: Clean install
rm -rf node_modules package-lock.json .next
npm install

# Less aggressive: Clear Next.js cache only
rm -rf .next
npm run dev
```

**When to use**: After `git pull`, after switching branches, or when deps seem corrupted.

---

### Mistake: TypeScript Errors After Update

**Symptom**: TypeScript errors that weren't there before, or IDE not recognizing types

**Solution**:

**In VS Code**:

```
Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux)
→ "TypeScript: Restart TS Server"
```

**In terminal**:

```bash
# Rebuild TypeScript
npm run build

# Check for type errors explicitly
npm run type-check
```

**Why it happens**: TypeScript server caches can become stale after updates or branch switches.

---

## 🚀 Deployment

### Mistake: Secrets Not Accessible to Cloud Run

**Symptom**: Cloud Run service starts but crashes with "secret not found" or auth errors

**Root Cause**: Cloud Run service account lacks Secret Manager access

**Solution**:

```bash
# Get project number (not ID)
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')

# Grant Secret Accessor role to Cloud Run's default service account
gcloud secrets add-iam-policy-binding nextauth-secret \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Verify access granted
gcloud secrets get-iam-policy nextauth-secret

# Expected output includes:
# - member: serviceAccount:123456789-compute@developer.gserviceaccount.com
#   role: roles/secretmanager.secretAccessor
```

**Do this for ALL secrets**: `nextauth-secret`, `google-oauth-secret`, etc.

---

### Mistake: OAuth Redirect URI Mismatch

**Symptom**: OAuth login fails with:

```
Error 400: redirect_uri_mismatch
The redirect URI in the request does not match the ones authorized for the OAuth client.
```

**Root Cause**: `NEXTAUTH_URL` doesn't match Google OAuth Console configuration

**Diagnosis**:

```bash
# 1. Check NEXTAUTH_URL in Cloud Run
gcloud run services describe chat-production \
  --region=us-central1 \
  --format='get(spec.template.spec.containers[0].env)' | grep NEXTAUTH_URL

# Expected: NEXTAUTH_URL=https://chat.daza.ar

# 2. Check Google OAuth Console
# https://console.cloud.google.com/apis/credentials
# Authorized redirect URIs MUST include:
# https://chat.daza.ar/api/auth/callback/google
```

**Solution**: Ensure **exact match** including:

- Protocol (https://)
- Domain (chat.daza.ar)
- Path (/api/auth/callback/google)
- No trailing slashes

**Full fix guide**: See [docs/fixes/OAUTH-ALLOWLIST-FIX.md](../fixes/OAUTH-ALLOWLIST-FIX.md)

---

### Mistake: Container Fails Health Checks

**Symptom**: Cloud Run deployment rolls back with:

```
ERROR: Revision is not ready and cannot serve traffic.
The user-provided container failed to start and listen on the port defined by PORT.
```

**Common Causes**:

1. App not listening on `$PORT` environment variable
2. Application crashes during startup
3. Health check timeout (default: 300s)

**Diagnosis**:

```bash
# Check detailed logs
gcloud run logs read chat-production \
  --region=us-central1 \
  --limit=100 \
  --format=json | jq .

# Look for:
# - "Listening on port 3000" (wrong - should be $PORT)
# - Uncaught exceptions
# - Missing environment variables
```

**Solution 1 - Port Issue**:

```typescript
// In Next.js app, ensure you use process.env.PORT
const PORT = parseInt(process.env.PORT || "3000", 10);
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

**Solution 2 - Missing Environment Variables**:

```bash
# Check what's set
gcloud run services describe chat-production \
  --region=us-central1 \
  --format='get(spec.template.spec.containers[0].env)'

# Add missing variables
gcloud run services update chat-production \
  --set-env-vars="MISSING_VAR=value" \
  --region=us-central1
```

**Solution 3 - Increase Timeout**:

```bash
gcloud run deploy chat-production \
  --timeout=300s \
  --region=us-central1
```

---

## 🧪 Testing

### Mistake: Tests Fail Only in CI

**Symptom**: Tests pass locally but fail in GitHub Actions

**Common Causes**:

1. Different Node.js version
2. Missing environment variables in CI
3. Timezone differences
4. File path issues (Windows vs Linux)

**Solution**:

**1. Match Node version**:

```bash
# Check CI Node version in .github/workflows/test.yml
# Match it locally
nvm use 22  # or whatever version CI uses
```

**2. Set CI environment variables**:

```yaml
# In .github/workflows/test.yml
env:
  NODE_ENV: test
  NEXTAUTH_SECRET: test-secret-for-ci
  # Add other required vars
```

**3. Run tests in CI mode locally**:

```bash
CI=true npm test
```

**4. Check for hardcoded paths**:

```bash
# Search for Windows-style paths
grep -r "C:\\\\" tests/

# Search for absolute paths
grep -r "/Users/" tests/
```

---

### Mistake: Snapshot Tests Fail After UI Update

**Symptom**: Tests fail with `Snapshot failed. The snapshot file has changed.`

**Cause**: You intentionally changed the UI, and snapshots need updating

**Solution**:

```bash
# Update all snapshots (only if changes are intentional!)
npm test -- -u

# Or update specific test file
npm test -- -u path/to/test.test.ts

# Review changes before committing
git diff tests/
```

**⚠️ Warning**: Only update snapshots if you **intended** to change the UI. Review diffs carefully!

---

## 🔀 Git & GitHub

### Mistake: Pre-commit Hooks Fail

**Symptom**: Can't commit due to lint/format errors:

```
husky - pre-commit hook failed (add --no-verify to bypass)
```

**Solution**:

**Option 1 - Fix the issues** (recommended):

```bash
# Auto-fix lint issues
npm run lint

# Auto-format code
npm run format

# Try commit again
git commit -m "your message"
```

**Option 2 - Reinstall hooks** (if broken):

```bash
npm run prepare
```

**Option 3 - Emergency bypass** (use sparingly):

```bash
git commit --no-verify -m "your message"
```

**⚠️ Warning**: Only use `--no-verify` in emergencies. Fix issues properly when possible.

---

### Mistake: Accidentally Committed Secrets

**Symptom**: `.env.local` or API keys visible in git history

**Immediate action**:

```bash
# If NOT pushed yet:
# Remove from last commit
git reset HEAD~1

# Remove file from staging
git restore --staged .env.local

# Add to .gitignore if not already
echo ".env.local" >> .gitignore

# Commit without secrets
git add .
git commit -m "your message"
```

**If already pushed**:

1. **Rotate all exposed secrets immediately**
2. See [docs/GIT-HISTORY-CLEANUP.md](../GIT-HISTORY-CLEANUP.md) for history rewrite
3. Force push (⚠️ coordinate with team)

**Prevention**: Always check `git status` before committing.

---

## 🆘 Getting Help

If you encounter an issue not listed here:

### 1. Check Existing Resources

- [GitHub Issues](https://github.com/roofsonfire/chat/issues) - Known issues
- [Documentation Index](../README.md) - Full docs
- [Deployment Guides](../deployment/) - Deployment-specific issues

### 2. Check Logs

```bash
# Local development
# Check terminal output

# Cloud Run production
gcloud run logs read chat-production \
  --region=us-central1 \
  --limit=100
```

### 3. Search the Codebase

```bash
# Search for error message
grep -r "your error message" .

# Search for similar patterns
grep -r "similar code pattern" src/
```

### 4. Create a New Issue

Include:

- **Error message** (full text, not screenshot)
- **Steps to reproduce** (detailed)
- **Environment details** (OS, Node version, local/Cloud Run)
- **What you've tried** (list troubleshooting steps)
- **Expected vs actual behavior**

**Good issue example**:

```markdown
## Error

`Error: EADDRINUSE: address already in use :::3000`

## Environment

- OS: macOS 14.1
- Node: 22.11.0
- Running: `npm run dev`

## Steps to Reproduce

1. Start dev server: `npm run dev`
2. Close terminal without stopping server
3. Try to start again: `npm run dev`

## What I've Tried

- Restarted terminal
- Ran `lsof -i :3000` but no output

## Expected

Dev server should start on port 3000

## Actual

Error message about port in use
```

---

## 📚 Related Documentation

- [Deployment Troubleshooting](../deployment/CLOUD-RUN-DEPLOYMENT.md#common-deployment-errors--solutions)
- [Development Guide](../DEVELOPMENT.md#troubleshooting)
- [OAuth Setup Guide](../OAUTH-SETUP.md)
- [Security Best Practices](../SECURITY.md)

---

_Last Updated: November 11, 2025_  
_Contributions: Add your mistakes here via PR to help future developers!_
