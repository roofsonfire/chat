import { test, expect } from "@playwright/test";
import { setupAuthenticatedPage } from "../helpers/auth";
import {
  mockChatAPI,
  sendMessage,
  waitForMessage,
  uploadImage,
  clearMocks,
} from "../helpers/chat-mocks";
import path from "node:path";

test.describe("Chat critical journeys", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
  });

  test.afterEach(async ({ page }) => {
    await clearMocks(page);
  });

  test("user can see the assistant reply after sending a message", async ({
    page,
  }) => {
    await mockChatAPI(page, {
      response: "Hello! How can I help you today?",
    });

    await sendMessage(page, "What is the weather like?");

    await waitForMessage(page, "What is the weather like?", "user");
    await waitForMessage(page, "Hello! How can I help you today?");

    await expect(page.getByTestId("message-user")).toContainText(
      "What is the weather like?"
    );
    await expect(page.getByTestId("message-assistant")).toContainText(
      "Hello! How can I help you today?"
    );
  });

  test("user can attach an image and send it with a message", async ({
    page,
  }) => {
    await mockChatAPI(page, {
      response: "I can see the image you sent!",
    });

    const imagePath = path.resolve(
      process.cwd(),
      "tests/fixtures/test-image.png"
    );
    await uploadImage(page, imagePath);
    await expect(page.getByTestId("image-preview")).toBeVisible();

    await sendMessage(page, "What do you see in this image?");

    await waitForMessage(page, "What do you see in this image?", "user");
    await waitForMessage(page, "I can see the image you sent!");

    const userMessage = page.getByTestId("message-user");
    await expect(userMessage).toContainText("What do you see in this image?");
    await expect(
      userMessage.locator('[data-testid="message-image"]')
    ).toBeVisible();
  });

  test("chat surfaces API failures to the user", async ({ page }) => {
    await mockChatAPI(page, {
      response: "",
      error: true,
      errorMessage: "Service temporarily unavailable",
      errorStatus: 503,
    });

    await sendMessage(page, "Trigger an error");

    await waitForMessage(page, "Trigger an error", "user");
    await waitForMessage(
      page,
      "Sorry, I encountered an error processing your request.",
      "assistant"
    );
  });
});
