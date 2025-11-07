/**
 * Options supported when fulfilling intercepted network requests.
 */
interface RouteFulfillOptions {
  status?: number;
  contentType?: string;
  headers?: Record<string, string>;
  body?: string;
}

/**
 * Minimal shape of the Playwright `Route` object leveraged by these helpers.
 */
interface ChatRoute {
  fulfill: (options: RouteFulfillOptions) => Promise<void>;
}

/**
 * Minimal locator surface required by the chat test helpers.
 */
interface ChatLocator {
  allTextContents: () => Promise<string[]>;
  setInputFiles?: (files: string | string[]) => Promise<void>;
}

/**
 * Reduced Playwright `Page` contract for the mocked chat flows.
 */
interface ChatPage {
  route: (
    match: string,
    handler: (route: ChatRoute) => Promise<void>
  ) => Promise<void>;
  waitForSelector: (
    selector: string,
    options?: {
      timeout?: number;
    }
  ) => Promise<void>;
  locator: (selector: string) => ChatLocator;
  getByTestId: (testId: string) => {
    fill: (value: string) => Promise<void>;
    click: () => Promise<void>;
  };
  unroute: (match: string) => Promise<void>;
}

/**
 * Mock configuration for chat API responses
 */
export interface MockChatConfig {
  /** Simulated response text (can be chunked for streaming) */
  response: string;
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
function createStreamingBody(text: string, chunkSize: number = 10): string {
  if (!text) {
    return "";
  }

  let body = "";

  for (let position = 0; position < text.length; position += chunkSize) {
    const chunk = text.slice(position, position + chunkSize);
    body += `${JSON.stringify({ type: "text", content: chunk })}\n`;
  }

  return body;
}

/**
 * Mock the chat API endpoint for testing
 * Intercepts POST requests to /api/chat and returns mock responses
 */
export async function mockChatAPI(page: ChatPage, config: MockChatConfig) {
  await page.route("**/api/chat", async (route: ChatRoute) => {
    const {
      response,
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

    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      headers: {
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
      body: createStreamingBody(response, chunkSize),
    });
  });
}

/**
 * Wait for a message with specific text to appear in the chat
 */
/**
 * Wait for a message with specific text to appear in the chat
 */
export async function waitForMessage(
  page: ChatPage,
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
export interface ChatMessages {
  user: string[];
  assistant: string[];
  all: string[];
}

export async function getAllMessages(page: ChatPage): Promise<ChatMessages> {
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
export async function sendMessage(page: ChatPage, message: string) {
  await page.getByTestId("message-input").fill(message);
  await page.getByTestId("send-message-button").click();
}

/**
 * Upload an image to the chat
 */
export async function uploadImage(page: ChatPage, imagePath: string) {
  const fileInput = page.locator('[data-testid="image-upload-input"]');
  if (!fileInput.setInputFiles) {
    throw new Error("Current test environment does not support file uploads");
  }

  await fileInput.setInputFiles(imagePath);
}

/**
 * Clear all mock routes
 */
export async function clearMocks(page: ChatPage) {
  await page.unroute("**/api/chat");
}
