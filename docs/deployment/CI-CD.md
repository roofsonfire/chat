# CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

## Workflows

### CI Pipeline (`.github/workflows/ci.yml`)

The CI pipeline runs on every push and pull request to `main` and includes:

#### 1. Lint and Type Check

- **ESLint**: Enforces code quality rules
- **TypeScript**: Type checking with `tsc --noEmit`
- **Prettier**: Code formatting verification

#### 2. Unit Tests

- Runs Vitest unit tests with coverage
- Uploads coverage reports to Codecov
- 45+ tests covering core utilities and services
- Targets 80%+ code coverage

#### 3. E2E Tests

- Runs Playwright end-to-end tests
- Tests in Chrome, Firefox, and Safari (CI: Chrome only)
- Validates authentication flows and accessibility
- Uploads test reports as artifacts

#### 4. Build Check

- Verifies Next.js production build succeeds
- Ensures no build-time errors
- Validates TypeScript compilation

## Required Secrets

Configure these in GitHub repository settings (`Settings > Secrets and variables > Actions`):

### Required for E2E Tests:

- `GOOGLE_PROJECT_ID`: Google Cloud project ID
- `GOOGLE_LOCATION`: Vertex AI location (e.g., `us-central1`)
- `GOOGLE_VERTEX_AI_MODEL_ID`: Model name (e.g., `gemini-1.5-flash-002`)

### Optional:

- `CODECOV_TOKEN`: For code coverage reporting

## Local Development

### Run all checks locally:

```bash
# Lint and format check
npm run lint
npx prettier --check .
npx tsc --noEmit

# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Build check
npm run build
```

### Pre-commit Hooks

Husky automatically runs:

- `lint-staged` on staged files
- ESLint and Prettier fixes
- TypeScript checking

## CI/CD Status

Add badges to README.md:

```markdown
![CI](https://github.com/roofsonfire/chat/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/roofsonfire/chat/branch/main/graph/badge.svg)](https://codecov.io/gh/roofsonfire/chat)
```

## Continuous Deployment

For CD (deployment to production):

1. **Vercel/Netlify**: Connect GitHub repo in platform settings
2. **Manual Deploy**: Add deployment workflow after CI passes
3. **Docker**: Build and push images on tagged releases

## Troubleshooting

### E2E Tests Failing in CI

- Check environment variables are set in GitHub Secrets
- Verify Playwright browser installation
- Review uploaded test reports in GitHub Actions artifacts

### Build Failures

- Ensure all environment variables have valid dummy values in CI
- Check TypeScript errors with `npx tsc --noEmit`
- Verify dependencies are locked in `package-lock.json`

### Coverage Upload Issues

- Codecov token may be missing
- Coverage files may not be generated (check test run)
- Set `fail_ci_if_error: false` to make upload optional

## Performance

- Typical CI run time: 3-5 minutes
- Parallel jobs reduce total time
- Caching dependencies speeds up subsequent runs
