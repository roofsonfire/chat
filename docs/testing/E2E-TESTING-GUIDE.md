# End-to-End (E2E) Testing Guide

## Overview

This project uses **Playwright** for E2E testing, following official Next.js and Playwright best practices for production-grade testing.

## Key Features

- **Automated server management**: Playwright automatically starts/stops the Next.js server
- **Environment-aware**: Uses dev server locally, production build in CI
- **Test isolation**: Environment variables loaded from `.env.test`
- **Comprehensive coverage**: Authentication, chat flows, accessibility, image upload, error handling

## Quick Start

### Prerequisites

1. **Install Playwright browsers** (one-time setup):

   ```bash
   npx playwright install --with-deps
   ```

2. **Ensure `.env.test` exists** with all required variables (including the test-only auth flag):
   ```bash
   cp .env.local .env.test
   ```

# Edit .env.test with ENABLE_TEST_CREDENTIALS=true and the test account values

````

### Running Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests with browser UI visible (headed mode)
npm run test:e2e:headed

# Run tests in interactive UI mode
npm run test:e2e:ui

# Debug a specific test
npm run test:e2e:debug

# View last test report
npm run test:e2e:report
````

## Testing Strategy

### Local Development

- **Server**: Uses `npm run dev` for fast feedback
- **Browser reuse**: Reuses existing dev server if running (`reuseExistingServer: true`)
- **Hot reload**: Changes to code don't require restarting tests

### Continuous Integration (CI)

- **Server**: Uses `npm run build && npm run start` for production-like testing
- **No server reuse**: Always starts fresh server (`reuseExistingServer: false`)
- **Performance**: Single worker for stability (`workers: 1`)

## Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // Prevents test isolation issues
  workers: process.env.CI ? 1 : 2, // 1 in CI, 2 locally
  timeout: 60 * 1000, // 60 seconds per test

  webServer: {
    // Dev server locally, production build in CI
    command: process.env.CI ? "npm run build && npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to start
  },

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 10 * 1000, // 10 seconds
    navigationTimeout: 15 * 1000, // 15 seconds
  },
});
```

### Environment Setup (`tests/playwright-env-setup.ts`)

Environment variables are automatically loaded from `.env.test` using `dotenv`:

```typescript
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.test before Playwright initializes
config({ path: resolve(__dirname, "../.env.test") });
```

This runs **before** Playwright starts, ensuring all env vars are available.

## Test Structure

```
tests/
├── e2e/
│   ├── accessibility.spec.ts    # Accessibility & ARIA tests
│   ├── auth.spec.ts              # Authentication flows
│   ├── chat.spec.ts              # Chat functionality (main suite)
│   └── home.spec.ts              # Home page tests
├── helpers/
│   └── auth.ts                   # Authentication helper functions
└── playwright-env-setup.ts      # Environment setup (loaded first)
```

## Test Categories

### 1. Authentication (`auth.spec.ts`)

- Login form validation
- Invalid credentials handling
- Session persistence

> ℹ️ **Important:** The E2E suite uses the credentials provider behind the `ENABLE_TEST_CREDENTIALS` flag. Production runs rely solely on Google sign-in, so keep this flag disabled outside automated testing contexts.

### 2. Chat Functionality (`chat.spec.ts`)

- **Basic**: Empty state, message input, typing
- **Message Sending**: Display, loading indicators, input clearing
- **Streaming**: AI response streaming, multiple messages
- **Image Upload**: Button visibility, preview, removal, sending
- **Error Handling**: API errors, empty message prevention
- **Chat History**: Auto-scroll, message ordering
- **Accessibility**: ARIA labels, keyboard navigation
- **Edge Cases**: Long messages, special characters, rapid messages

### 3. Accessibility (`accessibility.spec.ts`)

- Proper ARIA attributes
- Form input labels
- Semantic HTML structure

### 4. Home Page (`home.spec.ts`)

- Header display
- Meta tags validation

## Best Practices

### 1. **Test Against Production Builds (CI)**

Following Next.js official recommendations:

> "We recommend running your tests against your production code to more closely resemble how your application will behave."

- **CI**: Tests run against `npm run build && npm run start`
- **Local**: Tests run against `npm run dev` for speed

### 2. **Use Helper Functions**

```typescript
import { login, setupAuthenticatedPage } from "../helpers/auth";

test("should display chat interface", async ({ page }) => {
  await setupAuthenticatedPage(page);
  // Test authenticated features
});
```

### 3. **Wait for Elements Properly**

```typescript
// ✅ Good: Explicit wait with timeout
await page.waitForSelector('input[type="email"]', { timeout: 10000 });

// ✅ Good: Playwright auto-waits for visibility
await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

// ❌ Bad: No wait
await page.fill('input[type="email"]', email); // May fail if not loaded
```

### 4. **Handle Async Operations**

```typescript
// Wait for API response
await page.waitForResponse(
  (resp) => resp.url().includes("/api/chat") && resp.status() === 200
);

// Wait for streaming to complete
await page.waitForFunction(() => {
  const button = document.querySelector('button[type="submit"]');
  return !button?.disabled;
});
```

### 5. **Test Accessibility**

```typescript
// Check ARIA attributes
await expect(emailInput).toHaveAttribute("type", "email");
await expect(messageInput).toHaveAttribute("aria-label", /message/i);

// Check keyboard navigation
await messageInput.press("Tab");
await expect(sendButton).toBeFocused();
```

## Debugging Tests

### 1. **Run in Headed Mode**

```bash
npm run test:e2e:headed
```

See the browser while tests run.

### 2. **Use Debug Mode**

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector for step-by-step debugging.

### 3. **View Traces**

Traces are captured on first retry. View them:

```bash
npm run test:e2e:report
```

### 4. **Run Specific Test**

```bash
npx playwright test auth.spec.ts
npx playwright test -g "should show login form"
```

### 5. **Enable Debug Logs**

```bash
DEBUG=pw:browser npm run test:e2e
```

Shows browser launch debugging info.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "lts/*"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm run test:e2e
        env:
          CI: true
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
          AUTH_USER_EMAIL: ${{ secrets.AUTH_USER_EMAIL }}
          AUTH_USER_PASSWORD_HASH: ${{ secrets.AUTH_USER_PASSWORD_HASH }}
          GOOGLE_PROJECT_ID: ${{ secrets.GOOGLE_PROJECT_ID }}
          GOOGLE_LOCATION: ${{ secrets.GOOGLE_LOCATION }}
          GOOGLE_VERTEX_AI_MODEL_ID: ${{ secrets.GOOGLE_VERTEX_AI_MODEL_ID }}

      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Docker Example

```dockerfile
FROM mcr.microsoft.com/playwright:v1.48.0-noble

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Run tests
CMD ["npm", "run", "test:e2e"]
```

## Environment Variables

Required in `.env.test`:

```bash
# NextAuth
NEXTAUTH_SECRET=your-test-secret-key
NEXTAUTH_URL=http://localhost:3000

# Test User Credentials
AUTH_USER_EMAIL=test@example.com
AUTH_USER_PASSWORD_HASH=$2b$10$...

# Google Vertex AI
GOOGLE_PROJECT_ID=your-test-project-id
GOOGLE_LOCATION=us-central1
GOOGLE_VERTEX_AI_MODEL_ID=gemini-1.5-flash-002
```

## Performance Optimization

### 1. **Workers**

- **Local**: 2 workers for parallel execution
- **CI**: 1 worker for stability and resource management

### 2. **Timeouts**

- **Test**: 60 seconds (covers streaming responses)
- **Action**: 10 seconds (clicks, fills, etc.)
- **Navigation**: 15 seconds (page loads)
- **Server startup**: 120 seconds (allows for build time in CI)

### 3. **Retries**

- **Local**: 0 retries (fast feedback)
- **CI**: 2 retries (handles flakiness)

### 4. **Global Timeout**

- **CI only**: 15 minutes for entire test run
- Prevents runaway tests from consuming resources

## Troubleshooting

### Issue: "Timeout waiting for http://localhost:3000"

**Cause**: Server failed to start

**Solutions**:

1. Check `.env.test` has all required variables
2. Ensure port 3000 is not already in use: `lsof -i :3000`
3. Increase `webServer.timeout` in config
4. Check server logs: `stdout: "pipe"` in config

### Issue: "Element not found"

**Cause**: Page not fully loaded or element selector changed

**Solutions**:

1. Add explicit wait: `await page.waitForSelector(selector)`
2. Use Playwright's auto-waiting: `await expect(locator).toBeVisible()`
3. Check if element exists: `await locator.count()` > 0
4. Increase timeout: `{ timeout: 15000 }`

### Issue: "Test flakiness in CI"

**Cause**: Race conditions, network timing, resource constraints

**Solutions**:

1. Use `workers: 1` in CI
2. Add `await page.waitForLoadState('networkidle')`
3. Increase timeouts for CI: `timeout: process.env.CI ? 90000 : 60000`
4. Use `test.setTimeout(90000)` for specific slow tests

### Issue: "Production build too slow"

**Cause**: Building before tests takes time

**Solutions**:

1. Use dev server locally: Already configured!
2. Cache `.next` folder in CI
3. Use `--turbopack` for faster builds (already enabled)
4. Consider splitting tests into separate CI jobs

## Related Documentation

- [Playwright Official Docs](https://playwright.dev/docs/intro)
- [Next.js Testing with Playwright](https://nextjs.org/docs/app/guides/testing/playwright)
- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [E2E Testing Summary](./E2E-TESTING-SUMMARY.md)

## Contributing

When adding new tests:

1. Follow existing test structure and patterns
2. Use descriptive test names: `test("should...", async ({ page }) => { ... })`
3. Add proper waits for async operations
4. Test both happy paths and error cases
5. Include accessibility checks where relevant
6. Update this documentation if adding new test categories

---

**Last Updated**: October 7, 2025
