import { test, expect } from "@playwright/test";
import { setupAuthenticatedPage } from "../helpers/auth";
import { mockChatAPI, waitForMessage, clearMocks } from "../helpers/chat-mocks";

test.describe("Accessibility smoke", () => {
  test("login form exposes accessible roles", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /login/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Sign In$/i })
    ).toBeEnabled();
  });

  test("chat input works with keyboard only", async ({ page }) => {
    await setupAuthenticatedPage(page);
    await mockChatAPI(page, { response: "Keyboard ack" });

    const messageInput = page.getByTestId("message-input");
    await messageInput.focus();
    await page.keyboard.type("Keyboard message");
    await page.keyboard.press("Enter");

    await waitForMessage(page, "Keyboard message", "user");
    await clearMocks(page);
  });
});
