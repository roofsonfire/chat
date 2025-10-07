import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E testing.
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  // Set test timeout (default is 30s, increase to 60s)
  timeout: 60 * 1000,
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Increase timeout for actions and navigations
    actionTimeout: 10 * 1000, // 10 seconds for actions
    navigationTimeout: 15 * 1000, // 15 seconds for page navigations
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    command:
      "NODE_ENV=test npm run build && NODE_ENV=test node .next/standalone/server.js",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "pipe", // Show server logs in output
    stderr: "pipe",
  },
});
