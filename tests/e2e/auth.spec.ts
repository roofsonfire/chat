import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";

test.describe("Authentication journeys", () => {
  test("redirects unauthenticated users to the login screen", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForURL(/\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("allows users to sign in with valid credentials", async ({ page }) => {
    await login(page);

    await expect(page).toHaveURL("/");
    await expect(page.getByTestId("chat-container")).toBeVisible();
  });
});
