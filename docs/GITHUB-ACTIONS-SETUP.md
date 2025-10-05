# GitHub Actions Configuration Guide

This document explains the GitHub Actions CI/CD workflow configuration and how to set up required secrets.

## Workflow Overview

The CI/CD pipeline includes 4 parallel jobs:

1. **Lint and Type Check**: ESLint, TypeScript, Prettier
2. **Unit Tests**: Vitest unit tests with coverage
3. **E2E Tests**: Playwright end-to-end tests
4. **Build Check**: Next.js build verification

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

**Purpose**: Upload test coverage reports to Codecov  
**Where to get it**:

1. Sign up at https://codecov.io
2. Add your repository
3. Copy the upload token

**Note**: If not configured, coverage upload will be skipped (this is fine for most projects).

##### 2. UPSTASH_REDIS_REST_URL (Required for E2E tests)

**Purpose**: Redis connection for rate limiting in E2E tests  
**Where to get it**:

1. Sign up at https://console.upstash.com
2. Create a Redis database
3. Copy the REST URL from the database details

##### 3. UPSTASH_REDIS_REST_TOKEN (Required for E2E tests)

**Purpose**: Redis authentication token  
**Where to get it**: Same place as UPSTASH_REDIS_REST_URL

##### 4. GOOGLE_PROJECT_ID (Required for E2E tests)

**Purpose**: Google Cloud project for Vertex AI  
**Where to get it**:

1. Go to https://console.cloud.google.com
2. Select or create a project
3. Copy the Project ID

##### 5. GOOGLE_LOCATION (Required for E2E tests)

**Purpose**: Region for Vertex AI resources  
**Common values**: `us-central1`, `us-east1`, `europe-west1`

##### 6. GOOGLE_VERTEX_AI_MODEL_ID (Required for E2E tests)

**Purpose**: Vertex AI model identifier  
**Common values**: `gemini-1.5-flash-002`, `gemini-1.5-pro-002`

## Workflow Behavior Without Secrets

### Without CODECOV_TOKEN

- ✅ All tests run normally
- ⚠️ Coverage reports not uploaded to Codecov
- ✅ Build succeeds

### Without Upstash/Google Secrets

- ✅ Lint and type check pass
- ✅ Unit tests pass (mocked services)
- ⚠️ E2E tests will fail if they require API calls
- ✅ Build check uses dummy values and passes

## Local Development

For local development, create a `.env.local` file with actual credentials:

```bash
# Copy from .env.example
cp .env.example .env.local

# Then fill in your actual values:
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_LOCATION=us-central1
GOOGLE_VERTEX_AI_MODEL_ID=gemini-1.5-flash-002
```

**Never commit `.env.local` to git!** (It's already in `.gitignore`)

## Testing the Workflow

### Test Locally Before Pushing

```bash
# Run all checks that CI will run
npm run lint
npm test -- --run
npm run test:e2e
npm run build
```

### View Workflow Runs

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Click on a workflow run to see details
4. Click on a job to see logs

## Troubleshooting

### "Context access might be invalid" Warnings

**Problem**: Yellow warning icons in GitHub editor  
**Solution**: These are informational only. Configure the secrets as described above, or ignore if not needed.  
**Impact**: None - workflow runs successfully

### E2E Tests Failing

**Problem**: E2E tests fail with authentication errors  
**Solution**: Configure UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, and Google Cloud secrets  
**Workaround**: Skip E2E tests temporarily by adding `if: false` to the e2e-tests job

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
e2e-tests:
  name: E2E Tests
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
- ✅ Reasonable timeouts (15 min for E2E tests)

## Support

If you encounter issues:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review workflow logs in the Actions tab
3. Check if secrets are configured correctly
4. Verify `.env.example` matches your setup

## Summary

The warnings you see are informational and indicate secrets that should be configured for full functionality. The workflow will run successfully without them, but some features (like coverage upload and E2E tests with real APIs) will be limited.

**Priority**:

- 🔴 High: UPSTASH and GOOGLE secrets (for E2E tests)
- 🟡 Medium: CODECOV_TOKEN (for coverage tracking)
- 🟢 Low: All jobs run locally without issues

Configure secrets when ready, and your CI/CD pipeline will have full functionality! 🚀
