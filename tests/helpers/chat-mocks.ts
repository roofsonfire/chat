import { Page, Route } from "@playwright/test";

/**
 * Mock configuration for chat API responses
 */
export interface MockChatConfig {
  /** Simulated response text (can be chunked for streaming) */
  response: string;
  /** Delay between chunks in ms (default: 50) */
  streamDelay?: number;
  /** Chunk size for streaming (default: 10 characters) */
  chunkSize?: number;
  /** Whether to simulate an error */
  error?: boolean;
  /** Error message if error is true */
  errorMessage?: string;
  /** HTTP status code for error responses */
  errorStatus?: number;
}

/**
 * Creates a streaming response for the chat API
 * Simulates the server-sent events behavior
 */
function createStreamingResponse(
  text: string,
  chunkSize: number = 10,
  delay: number = 50
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let position = 0;

  return new ReadableStream({
    async pull(controller) {
      if (position >= text.length) {
        controller.close();
        return;
      }

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, delay));

      const chunk = text.slice(position, position + chunkSize);
      position += chunkSize;

      controller.enqueue(encoder.encode(chunk));
    },
  });
}

/**
 * Mock the chat API endpoint for testing
 * Intercepts POST requests to /api/chat and returns mock responses
 */
export async function mockChatAPI(page: Page, config: MockChatConfig) {
  await page.route("**/api/chat", async (route: Route) => {
    const {
      response,
      streamDelay = 50,
      chunkSize = 10,
      error,
      errorMessage,
      errorStatus,
    } = config;

    if (error) {
      await route.fulfill({
        status: errorStatus || 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: errorMessage || "Internal server error",
        }),
      });
      return;
    }

    // Create streaming response
    const stream = createStreamingResponse(response, chunkSize, streamDelay);

    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: {
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
      body: await streamToString(stream),
    });
  });
}

/**
 * Helper to convert a ReadableStream to a string
 */
async function streamToString(
  stream: ReadableStream<Uint8Array>
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result;
}

/**
 * Wait for a message with specific text to appear in the chat
 */
export async function waitForMessage(
  page: Page,
  text: string,
  role: "user" | "assistant" = "assistant",
  timeout: number = 10000
) {
  const selector = `[data-testid="message-${role}"] [data-testid="message-text"]`;
  await page.waitForSelector(selector, { timeout });

  const messages = await page.locator(selector).allTextContents();
  const found = messages.some((msg) => msg.includes(text));

  if (!found) {
    throw new Error(`Message with text "${text}" not found for role "${role}"`);
  }
}

/**
 * Get all messages from the chat history
 */
export async function getAllMessages(page: Page) {
  const userMessages = await page
    .locator('[data-testid="message-user"] [data-testid="message-text"]')
    .allTextContents();

  const assistantMessages = await page
    .locator('[data-testid="message-assistant"] [data-testid="message-text"]')
    .allTextContents();

  return {
    user: userMessages,
    assistant: assistantMessages,
    all: [...userMessages, ...assistantMessages],
  };
}

/**
 * Send a message in the chat
 */
export async function sendMessage(page: Page, message: string) {
  await page.getByTestId("message-input").fill(message);
  await page.getByTestId("send-message-button").click();
}

/**
 * Upload an image to the chat
 */
export async function uploadImage(page: Page, imagePath: string) {
  const fileInput = await page.locator('[data-testid="image-upload-input"]');
  await fileInput.setInputFiles(imagePath);
}

/**
 * Clear all mock routes
 */
export async function clearMocks(page: Page) {
  await page.unroute("**/api/chat");
}
