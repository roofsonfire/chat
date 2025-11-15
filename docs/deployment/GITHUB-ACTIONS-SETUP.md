# GitHub Actions Configuration Guide

This document explains the GitHub Actions CI/CD workflow configuration and how to set up required secrets.

## Workflow Overview

The CI/CD pipeline includes 4 parallel jobs:

1. **Lint and Type Check**: ESLint, TypeScript, Prettier
2. **Unit Tests**: Vitest unit tests with coverage
3. **Build Check**: Next.js build verification

## Secret Configuration Warnings

You may see warnings about "Context access might be invalid" for various secrets. These are **informational warnings** and won't prevent your workflow from running. They simply indicate that the secrets need to be configured in your repository settings.

### Required Secrets

To enable all features of the CI/CD pipeline, configure these secrets in your GitHub repository:

#### Navigation

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

#### Secrets to Add

##### 1. CODECOV_TOKEN (Optional)

## Workflow Behavior Without Secrets

### Without CODECOV_TOKEN

- ✅ All tests run normally
- ⚠️ Coverage reports not uploaded to Codecov
- ✅ Build succeeds

## Local Development

For local development, create a `.env.local` file with actual credentials:

```bash
# Copy from .env.example
cp .env.example .env.local

# Then fill in your actual values:
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_LOCATION=us-central1
GOOGLE_VERTEX_AI_MODEL_ID=gemini-1.5-flash-002

# Note: Rate limiting now uses in-memory storage (no Redis config needed!)
```

**Never commit `.env.local` to git!** (It's already in `.gitignore`)

## Testing the Workflow

### Test Locally Before Pushing

```bash
# Run all checks that CI will run
npm run lint
npm test -- --run
npm run build
```

### View Workflow Runs

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Click on a workflow run to see details
4. Click on a job to see logs

## 🚨 Common GitHub Actions Errors & Solutions

### Error: Authentication Failed in Deployment Job

**Symptom:**

```
ERROR: (gcloud.auth.activate-service-account) Failed to activate service account
Error: Process completed with exit code 1
```

**Root Cause:**
Service account key secret is missing, malformed, or lacks required permissions.

**Diagnosis:**

```bash
# Check if secret exists (in GitHub Settings → Secrets)
# Verify service account locally
gcloud iam service-accounts describe github-actions@norse-breaker-474323-n8.iam.gserviceaccount.com
```

**Solution:**

1. **Regenerate service account key:**

```bash
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@norse-breaker-474323-n8.iam.gserviceaccount.com
```

2. **Add to GitHub secrets:**

```bash
# Copy entire JSON content
cat github-actions-key.json | base64
```

3. **Update GitHub secret:**
   - Go to Settings → Secrets and variables → Actions
   - Update `GCP_SA_KEY` with the JSON content (not base64)

4. **Delete local key file:**

```bash
rm github-actions-key.json
```

**Prevention:**

- Use Workload Identity Federation instead of service account keys for better security
- Rotate keys every 90 days
- Audit service account permissions quarterly

### Error: Secrets Not Accessible in Workflow

**Symptom:**

```yaml
Run echo ${{ secrets.NEXTAUTH_SECRET }}
# Output: (empty)
```

**Root Cause:**
Secrets are not available in forked repository PRs or are not configured correctly.

**Diagnosis:**

```yaml
# Add debug step to workflow
- name: Debug Secrets
  run: |
    echo "Secret exists: ${{ secrets.NEXTAUTH_SECRET != '' }}"
```

**Solution:**

1. **For forks**: Secrets are intentionally hidden for security. Collaborator must run workflow on main repo.

2. **For missing secrets**: Add via GitHub UI:
   - Repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name must exactly match workflow reference

3. **For environment secrets**:

```yaml
# Use environment in job definition
jobs:
  deploy:
    environment: production # Makes environment secrets available
```

**Prevention:**

- Document all required secrets in README
- Use `.env.example` as reference
- Add secret validation step to workflow

### Error: Workload Identity Federation Authentication

**Symptom:**

```
Error: google-github-actions/auth failed with: retry function failed after 3 attempts
```

**Root Cause:**
Workload Identity Pool or Provider misconfigured.

**Diagnosis:**

```bash
# Verify Workload Identity Pool
gcloud iam workload-identity-pools list --location=global

# Check provider
gcloud iam workload-identity-pools providers describe github \
  --workload-identity-pool=github-pool \
  --location=global
```

**Solution:**

1. **Create Workload Identity Pool:**

```bash
gcloud iam workload-identity-pools create github-pool \
  --location=global \
  --display-name="GitHub Actions Pool"
```

2. **Create provider:**

```bash
gcloud iam workload-identity-pools providers create-oidc github \
  --location=global \
  --workload-identity-pool=github-pool \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

3. **Bind service account:**

```bash
gcloud iam service-accounts add-iam-policy-binding github-actions@norse-breaker-474323-n8.iam.gserviceaccount.com \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/OWNER/REPO"
```

**Prevention:**

- Use Workload Identity Federation over service account keys
- Test authentication in isolated workflow before production use
- Document Workload Identity setup in deployment guide

### Error: Deployment Timeout

**Symptom:**

```
Error: Timeout of 300000ms exceeded
The job running on runner GitHub Actions X has exceeded the maximum execution time
```

**Root Cause:**
Cloud Run deployment takes longer than GitHub Actions job timeout.

**Solution:**

1. **Increase workflow timeout:**

```yaml
jobs:
  deploy:
    timeout-minutes: 15 # Default is 360 (6 hours), but set reasonable limit
```

2. **Optimize Docker build:**

```dockerfile
# Use build cache
RUN --mount=type=cache,target=/root/.npm npm ci

# Multi-stage build
FROM node:20-alpine AS builder
# ... build steps ...
FROM node:20-alpine AS runner
COPY --from=builder /app/.next ./.next
```

3. **Check Cloud Run settings:**

```bash
# Increase Cloud Run timeout
gcloud run services update chat-staging \
  --region=us-central1 \
  --timeout=600 # 10 minutes
```

**Prevention:**

- Use layer caching in Cloud Build
- Pre-build dependencies in base image
- Monitor build times and optimize slow steps

### Error: Missing Environment Variables in Deployment

**Symptom:**

```
Error: Missing environment variable: NEXTAUTH_SECRET
Application failed to start
```

**Root Cause:**
Environment variables not passed from GitHub secrets to Cloud Run service.

**Diagnosis:**

```bash
# Check deployed service configuration
gcloud run services describe chat-staging \
  --region=us-central1 \
  --format="yaml(spec.template.spec.containers[0].env)"
```

**Solution:**

1. **Update workflow to pass env vars:**

```yaml
- name: Deploy to Cloud Run
  run: |
    gcloud run deploy chat-staging \
      --source . \
      --region=us-central1 \
      --set-env-vars="NEXTAUTH_URL=${{ secrets.NEXTAUTH_URL }}" \
      --set-secrets="NEXTAUTH_SECRET=nextauth-secret:latest"
```

2. **Verify secrets exist in Secret Manager:**

```bash
gcloud secrets list
gcloud secrets describe nextauth-secret
```

**Prevention:**

- Use Secret Manager for sensitive values
- Use `--set-env-vars` for non-sensitive configuration
- Add environment variable validation to startup script

### Error: Permission Denied Creating Cloud Run Service

**Symptom:**

```
ERROR: (gcloud.run.deploy) PERMISSION_DENIED: The caller does not have permission
Error: Process completed with exit code 1
```

**Root Cause:**
Service account used by GitHub Actions lacks required IAM roles.

**Diagnosis:**

```bash
# List current roles
gcloud projects get-iam-policy norse-breaker-474323-n8 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions@norse-breaker-474323-n8.iam.gserviceaccount.com"
```

**Solution:**

```bash
# Add required roles
gcloud projects add-iam-policy-binding norse-breaker-474323-n8 \
  --member="serviceAccount:github-actions@norse-breaker-474323-n8.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding norse-breaker-474323-n8 \
  --member="serviceAccount:github-actions@norse-breaker-474323-n8.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding norse-breaker-474323-n8 \
  --member="serviceAccount:github-actions@norse-breaker-474323-n8.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.builder"
```

**Prevention:**

- Use principle of least privilege
- Document required roles in README
- Audit service account permissions regularly
- Use custom roles for fine-grained control

### Error: Docker Image Build Cache Miss

**Symptom:**

```
# 4 [internal] load metadata for docker.io/library/node:20-alpine
# 4 DONE 2.5s
# ... Every layer rebuilds (slow builds)
```

**Root Cause:**
Build cache not configured or invalidated.

**Solution:**

1. **Enable Cloud Build caching:**

```bash
gcloud builds submit \
  --tag gcr.io/norse-breaker-474323-n8/chat \
  --cache-from gcr.io/norse-breaker-474323-n8/chat:latest
```

2. **Update Dockerfile for better caching:**

```dockerfile
# Copy package files first (changes less frequently)
COPY package*.json ./
RUN npm ci

# Copy source code last (changes most frequently)
COPY . .
```

3. **Use BuildKit cache mounts:**

```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=cache,target=/root/.npm npm ci
```

**Prevention:**

- Order Dockerfile instructions by change frequency
- Use `.dockerignore` to exclude unnecessary files
- Monitor build times and optimize slow steps

## Troubleshooting

### "Context access might be invalid" Warnings

**Problem**: Yellow warning icons in GitHub editor
**Solution**: These are informational only. Configure the secrets as described above, or ignore if not needed.
**Impact**: None - workflow runs successfully

### Coverage Upload Failing

**Problem**: Codecov step fails
**Solution**: Add CODECOV_TOKEN secret
**Workaround**: This won't fail the build due to `fail_ci_if_error: false`

### Build Failing

**Problem**: Build check fails
**Solution**:

1. Run `npm run build` locally to reproduce
2. Fix any TypeScript or build errors
3. Commit and push fixes

## Workflow Customization

### Disable a Job

Add `if: false` to skip a job:

```yaml
unit-tests:
  name: Unit Tests
  if: false # Temporarily disabled
  runs-on: ubuntu-latest
  # ...
```

### Run on Different Branches

Modify the `on` section:

```yaml
on:
  push:
    branches: [main, develop] # Run on main and develop
  pull_request:
    branches: [main]
```

### Add More Node Versions

Test on multiple Node versions:

```yaml
unit-tests:
  strategy:
    matrix:
      node-version: [18, 20, 21]
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
```

## Best Practices

1. **Always run tests locally** before pushing
2. **Keep secrets secure** - never commit them
3. **Monitor workflow runs** - fix failures quickly
4. **Update dependencies** regularly for security
5. **Use matrix testing** for critical libraries
6. **Cache dependencies** to speed up builds (already configured)
7. **Set reasonable timeouts** to prevent hanging builds

## Performance Optimization

The workflow is already optimized with:

- ✅ Dependency caching (`cache: "npm"`)
- ✅ Parallel job execution (4 jobs run simultaneously)
- ✅ Selective test running (unit tests don't rebuild app)

## Support

If you encounter issues:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review workflow logs in the Actions tab
3. Check if secrets are configured correctly
4. Verify `.env.example` matches your setup

## Summary

The warnings you see are informational and indicate secrets that should be configured for full functionality. The workflow will run successfully without them, but some features (like coverage upload) will be limited.

**Priority**:

- 🟡 Medium: CODECOV_TOKEN (for coverage tracking)
- 🟢 Low: All jobs run locally without issues
- ✅ Bonus: Rate limiting works out-of-the-box (no Redis needed!)

Configure secrets when ready, and your CI/CD pipeline will have full functionality! 🚀
