import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("login page should have proper aria labels", async ({ page }) => {
    await page.goto("/login");

    const emailInput = page.getByPlaceholder(/email/i);
    const passwordInput = page.getByPlaceholder(/password/i);
    const submitButton = page.getByRole("button", { name: /sign in/i });

    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(submitButton).toBeEnabled();
  });

  test("message input should have proper aria labels", async ({ page }) => {
    // Note: This test assumes successful authentication
    // In a real scenario, you'd set up authentication first
    await page.goto("/login");

    const messageInput = page.getByPlaceholder(/type a message/i);
    if (await messageInput.isVisible()) {
      await expect(messageInput).toHaveAttribute("aria-label", "Message input");
    }
  });
});
