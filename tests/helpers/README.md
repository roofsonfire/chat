# Test Helpers

This directory contains utility functions and helpers for E2E testing with Playwright.

## Files

### `auth.ts`

Authentication helpers for setting up authenticated test sessions.

**Functions:**

- `login(page)` - Logs in a user with test credentials
- `setupAuthenticatedPage(page)` - Sets up an authenticated page context ready for testing

**Environment Variables:**

- `NEXT_PUBLIC_TEST_EMAIL` - Test user email (default: test@example.com)
- `NEXT_PUBLIC_TEST_PASSWORD` - Test user password (default: test123)

### `chat-mocks.ts`

Mock utilities for the chat API endpoint, enabling reliable testing without real API calls.

**Functions:**

- `mockChatAPI(page, config)` - Mock the `/api/chat` endpoint with configurable responses
- `sendMessage(page, message)` - Send a message in the chat UI
- `waitForMessage(page, text, role, timeout)` - Wait for a specific message to appear
- `getAllMessages(page)` - Get all messages from the chat history
- `uploadImage(page, imagePath)` - Upload an image to the chat
- `clearMocks(page)` - Clear all mock routes

**MockChatConfig Options:**

- `response: string` - The response text to return
- `streamDelay?: number` - Delay between chunks in ms (default: 50)
- `chunkSize?: number` - Chunk size for streaming (default: 10)
- `error?: boolean` - Whether to simulate an error
- `errorMessage?: string` - Error message if error is true
- `errorStatus?: number` - HTTP status code for error responses

## Usage Example

```typescript
import { test, expect } from "@playwright/test";
import { setupAuthenticatedPage } from "../helpers/auth";
import {
  mockChatAPI,
  sendMessage,
  waitForMessage,
} from "../helpers/chat-mocks";

test("should send a message", async ({ page }) => {
  await setupAuthenticatedPage(page);

  await mockChatAPI(page, {
    response: "Hello! How can I help you?",
    streamDelay: 10,
  });

  await sendMessage(page, "Hi there!");

  await waitForMessage(page, "Hello! How can I help you?");

  const assistantMessage = page
    .locator('[data-testid="message-assistant"]')
    .first();
  await expect(assistantMessage).toBeVisible();
});
```

## Best Practices

1. **Always authenticate**: Use `setupAuthenticatedPage()` in `beforeEach` hooks
2. **Mock API calls**: Use `mockChatAPI()` to ensure reliable, fast tests
3. **Clean up**: Use `clearMocks()` in `afterEach` to prevent test pollution
4. **Wait for elements**: Use `waitForMessage()` instead of arbitrary timeouts
5. **Use test IDs**: Prefer `getByTestId()` over CSS selectors for stability
