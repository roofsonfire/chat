import { test, expect } from "@playwright/test";

test.describe("Home smoke test", () => {
  test("renders the landing page shell", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/AI Chat Assistant/);
    await expect(
      page.getByRole("heading", { name: /ai chat assistant/i })
    ).toBeVisible();
  });
});
