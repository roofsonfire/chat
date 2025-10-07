import { defineConfig, devices } from "@playwright/test";
import "./tests/playwright-env-setup";

/**
 * Playwright configuration for E2E testing.
 * Optimized for production-grade testing with Next.js standalone mode.
 * See: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",
  // Disable fullyParallel to prevent test isolation issues with shared server
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Limit workers: 1 in CI, 2 locally (safe with shared webServer)
  workers: process.env.CI ? 1 : 2,
  reporter: "html",
  // Global timeout for entire test run (prevents runaway tests)
  globalTimeout: process.env.CI ? 15 * 60 * 1000 : undefined, // 15 minutes in CI
  // Per-test timeout
  timeout: 60 * 1000, // 60 seconds
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Reasonable timeouts for actions and navigations
    actionTimeout: 10 * 1000, // 10 seconds
    navigationTimeout: 15 * 1000, // 15 seconds
    // Disable service workers to prevent caching issues in tests
    serviceWorkers: "block",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Disable other browsers by default for faster feedback
    // Uncomment to test cross-browser compatibility
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],

  webServer: {
    // Environment variables are loaded via playwright-env-setup.ts
    // Use dev server locally, production build in CI (Next.js best practice)
    command: process.env.CI ? "npm run build && npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to start
    stdout: "pipe",
    stderr: "pipe",
  },
});
