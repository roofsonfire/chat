import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the application header", async ({ page }) => {
    await page.goto("/");
    const header = page.getByRole("heading", { name: /ai chat assistant/i });
    await expect(header).toBeVisible();
  });

  test("should have proper meta tags", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AI Chat Assistant/);
  });
});
