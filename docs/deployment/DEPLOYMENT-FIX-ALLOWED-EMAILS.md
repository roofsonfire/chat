# Deployment Fix: ALLOWED_EMAILS Environment Variable

**Date:** November 7, 2025
**Status:** ✅ Fixed
**Impact:** Production deployment failing

## Problem

After merging PR #88 (which added the `ALLOWED_EMAILS` environment variable to the CI build job), the production deployment to Google Cloud Run was failing with this error:

```text
Error: Environment variable validation failed:
  - ALLOWED_EMAILS: Invalid input: expected string, received undefined
```

The issue occurred during the **Docker build stage** where Next.js tries to validate environment variables at build time.

## Root Cause

The security migration (PR #71) introduced a new required environment variable `ALLOWED_EMAILS` for invite-only access control. This variable was added to:

1. ✅ **CI/CD Pipeline** (`.github/workflows/ci.yml`) - Build Check job
2. ❌ **Production Deployment** (`.github/workflows/deploy-production.yml`) - Missing from Docker build

The Dockerfile needs `ALLOWED_EMAILS` during the `npm run build` step because Next.js validates all environment variables at build time via `src/lib/env.ts`.

## Solution

### 1. Updated Deployment Workflow

**File:** `.github/workflows/deploy-production.yml`

Added `ALLOWED_EMAILS` to the Docker build step:

```yaml
- name: Build and push Docker image
  id: docker-build
  env:
    ALLOWED_EMAILS: ${{ secrets.TEST_AUTH_USER_EMAIL }}
  run: |
    docker build \
      --build-arg NODE_ENV=production \
      --build-arg ALLOWED_EMAILS="${ALLOWED_EMAILS}" \
      --tag "${IMAGE_TAG}" \
      .
```

### 2. Updated Dockerfile

**File:** `Dockerfile`

Modified the builder stage to accept `ALLOWED_EMAILS` as a build argument:

```dockerfile
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments
ARG NODE_ENV=production
ARG ALLOWED_EMAILS

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV ALLOWED_EMAILS=${ALLOWED_EMAILS}
# ... other env vars ...

RUN npm run build
```

### 3. Updated Cloud Run Configuration

Added `ALLOWED_EMAILS` to runtime secrets:

```yaml
--set-secrets="...,ALLOWED_EMAILS=allowed-emails:latest"
```

Also added to the secret permissions list:

```bash
SECRETS=(
  # ... existing secrets ...
  allowed-emails
)
```

## Verification

### Workflow Status (After Fix)

```bash
gh run list --branch main --limit 3
```

| Workflow                         | Status     |
| -------------------------------- | ---------- |
| Deploy to Cloud Run (Production) | ✅ Success |
| CI/CD Pipeline                   | ✅ Success |
| CodeQL Security Analysis         | ✅ Success |

### Production Site Health

```bash
curl -I https://chat.daza.ar
HTTP/2 307 # Redirect to auth (expected)
```

## Related Changes

- **PR #71**: Security migration (introduced `ALLOWED_EMAILS` requirement)
- **PR #88**: Workflow fixes (added `ALLOWED_EMAILS` to CI, this deployment fix)
- **Commit fa4e3dd**: Deployment fix implementation

## Key Learnings

1. **Environment Variables at Build Time**: Next.js validates all environment variables during the build process (via Zod in `src/lib/env.ts`), not just at runtime.

2. **Docker Build Arguments**: Environment variables needed during Docker build must be passed as `--build-arg` and declared with `ARG` in the Dockerfile.

3. **CI vs Deployment**: Environment variables needed in both CI builds and production deployments should be added to both workflows.

4. **Secret Management**: Google Cloud Secret Manager secrets must be:
   - Created in Secret Manager
   - Added to IAM permissions for the Cloud Run service account
   - Referenced in the Cloud Run deployment configuration

## Prevention

To prevent similar issues in the future:

1. **Always test deployment workflow** after adding required environment variables
2. **Document new environment variables** in `.env.example` with build-time vs runtime requirements
3. **Update both CI and deployment workflows** when adding new required env vars
4. **Consider automated checks** for environment variable consistency across workflows

## References

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Docker Build Arguments](https://docs.docker.com/build/guide/build-args/)
- [Google Cloud Run Environment Variables](https://cloud.google.com/run/docs/configuring/environment-variables)
- [Zod Environment Validation](https://zod.dev/)

---

**Last Updated:** November 7, 2025
**Author:** Development Team
**Status:** ✅ Resolved
