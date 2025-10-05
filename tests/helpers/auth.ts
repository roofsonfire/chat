import { Page } from "@playwright/test";

/**
 * Test credentials for authentication
 */
export const TEST_USER = {
  email: process.env.NEXT_PUBLIC_TEST_EMAIL || "test@example.com",
  password: process.env.NEXT_PUBLIC_TEST_PASSWORD || "test123",
};

/**
 * Login helper for E2E tests
 * Navigates to login page and submits credentials
 */
export async function login(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
  await page.getByPlaceholder(/password/i).fill(TEST_USER.password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // Wait for redirect to home page
  await page.waitForURL("/", { timeout: 10000 });
}

/**
 * Setup authenticated page context
 * Creates a new context with authentication state
 */
export async function setupAuthenticatedPage(page: Page) {
  await login(page);
  // Ensure we're on the home page and chat is loaded
  await page.waitForSelector('[data-testid="chat-container"]', {
    timeout: 10000,
  });
}
