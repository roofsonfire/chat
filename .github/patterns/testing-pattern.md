# Testing Pattern

## Purpose

Comprehensive testing strategy for Next.js 15 application using Vitest, React Testing Library, and Storybook integration.

## Testing Philosophy

- **Unit Tests**: Test individual functions, utilities, and hooks in isolation
- **Integration Tests**: Test component interactions, API flows, and service integrations
- **Component Tests**: Test React components with Storybook + Vitest
- **Coverage Target**: >80% on critical paths

## Test Structure

### Unit Test Structure

```typescript
// src/lib/utils/__tests__/format.test.ts
import { describe, it, expect } from "vitest";
import { formatDate, formatCurrency } from "../format";

describe("formatDate", () => {
  it("should format ISO date to readable string", () => {
    const date = new Date("2025-01-15T10:30:00Z");
    expect(formatDate(date)).toBe("January 15, 2025");
  });

  it("should handle invalid dates", () => {
    expect(formatDate(null)).toBe("Invalid date");
  });
});

describe("formatCurrency", () => {
  it("should format number as USD currency", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("should handle zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("should handle negative numbers", () => {
    expect(formatCurrency(-100)).toBe("-$100.00");
  });
});
```

### Integration Test Structure

```typescript
// tests/integration/chat.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ChatService } from "@/lib/services/chat-service";
import { mockVertexAI } from "../helpers/chat-mocks";

describe("Chat Integration", () => {
  let chatService: ChatService;

  beforeEach(() => {
    // Setup
    chatService = new ChatService();
    mockVertexAI();
  });

  afterEach(() => {
    // Cleanup
    vi.clearAllMocks();
  });

  it("should send message and receive response", async () => {
    const response = await chatService.sendMessage({
      content: "Hello",
      role: "user",
    });

    expect(response).toMatchObject({
      content: expect.any(String),
      role: "assistant",
    });
  });

  it("should handle streaming responses", async () => {
    const chunks: string[] = [];

    await chatService.streamMessage(
      { content: "Tell me a story", role: "user" },
      (chunk) => chunks.push(chunk)
    );

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join("")).toContain("story");
  });

  it("should throw error on invalid message", async () => {
    await expect(
      chatService.sendMessage({ content: "", role: "user" })
    ).rejects.toThrow("Message content cannot be empty");
  });
});
```

## Real Example: Chat Service Tests

**File:** `tests/unit/chat-service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { ChatService } from "@/lib/services/chat-service";
import { VertexAIError } from "@/lib/errors";
import { mockGenerativeModel } from "../helpers/chat-mocks";

// Mock Vertex AI SDK
vi.mock("@google-cloud/vertexai", () => ({
  VertexAI: vi.fn(() => ({
    getGenerativeModel: mockGenerativeModel,
  })),
}));

describe("ChatService", () => {
  let chatService: ChatService;
  let generateContentMock: Mock;

  beforeEach(() => {
    chatService = new ChatService();
    generateContentMock = vi.fn();

    // Setup default mock behavior
    mockGenerativeModel.mockReturnValue({
      generateContent: generateContentMock,
    });
  });

  describe("sendMessage", () => {
    it("should send text message successfully", async () => {
      generateContentMock.mockResolvedValue({
        response: {
          text: () => "Hello! How can I help you?",
        },
      });

      const result = await chatService.sendMessage({
        content: "Hello",
        role: "user",
      });

      expect(result).toEqual({
        content: "Hello! How can I help you?",
        role: "assistant",
        timestamp: expect.any(Date),
      });

      expect(generateContentMock).toHaveBeenCalledWith({
        contents: [{ role: "user", parts: [{ text: "Hello" }] }],
      });
    });

    it("should handle multimodal message with image", async () => {
      const imageData = Buffer.from("fake-image-data");

      generateContentMock.mockResolvedValue({
        response: {
          text: () => "I see an image of a cat",
        },
      });

      const result = await chatService.sendMessage({
        content: "What's in this image?",
        role: "user",
        image: imageData,
      });

      expect(result.content).toBe("I see an image of a cat");

      expect(generateContentMock).toHaveBeenCalledWith({
        contents: [
          {
            role: "user",
            parts: [
              { text: "What's in this image?" },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageData.toString("base64"),
                },
              },
            ],
          },
        ],
      });
    });

    it("should throw ValidationError for empty message", async () => {
      await expect(
        chatService.sendMessage({ content: "", role: "user" })
      ).rejects.toThrow("Message content cannot be empty");
    });

    it("should throw VertexAIError on API failure", async () => {
      generateContentMock.mockRejectedValue(new Error("API rate limit"));

      await expect(
        chatService.sendMessage({ content: "Hello", role: "user" })
      ).rejects.toThrow(VertexAIError);
    });

    it("should handle safety filters", async () => {
      generateContentMock.mockResolvedValue({
        response: {
          text: () => "",
          candidates: [
            {
              finishReason: "SAFETY",
              safetyRatings: [
                { category: "HARM_CATEGORY_HARASSMENT", probability: "HIGH" },
              ],
            },
          ],
        },
      });

      await expect(
        chatService.sendMessage({
          content: "Inappropriate content",
          role: "user",
        })
      ).rejects.toThrow("Content blocked by safety filters");
    });
  });

  describe("streamMessage", () => {
    it("should stream response chunks", async () => {
      const chunks = ["Hello", " ", "world", "!"];
      const mockStream = {
        stream: (async function* () {
          for (const chunk of chunks) {
            yield { text: () => chunk };
          }
        })(),
      };

      generateContentMock.mockResolvedValue(mockStream);

      const received: string[] = [];
      await chatService.streamMessage(
        { content: "Hello", role: "user" },
        (chunk) => received.push(chunk)
      );

      expect(received).toEqual(chunks);
    });

    it("should handle streaming errors", async () => {
      generateContentMock.mockRejectedValue(new Error("Stream interrupted"));

      await expect(
        chatService.streamMessage({ content: "Hello", role: "user" }, () => {})
      ).rejects.toThrow(VertexAIError);
    });
  });
});
```

## React Component Testing

### Testing Client Components

```typescript
// tests/unit/chat-input.test.tsx
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { ChatInput } from "@/components/chat/chat-input"

describe("ChatInput", () => {
  it("should render input and send button", () => {
    render(<ChatInput onSendMessage={vi.fn()} />)

    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument()
  })

  it("should call onSendMessage when Enter is pressed", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()

    render(<ChatInput onSendMessage={onSend} />)

    const input = screen.getByPlaceholderText(/type a message/i)
    await user.type(input, "Hello{Enter}")

    await waitFor(() => {
      expect(onSend).toHaveBeenCalledWith("Hello", undefined)
    })
  })

  it("should not send empty messages", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()

    render(<ChatInput onSendMessage={onSend} />)

    const button = screen.getByRole("button", { name: /send/i })
    await user.click(button)

    expect(onSend).not.toHaveBeenCalled()
  })

  it("should handle image upload", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()

    render(<ChatInput onSendMessage={onSend} />)

    const file = new File(["image"], "test.png", { type: "image/png" })
    const input = screen.getByLabelText(/upload image/i)

    await user.upload(input, file)

    expect(screen.getByText("test.png")).toBeInTheDocument()
  })

  it("should disable send button while sending", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<ChatInput onSendMessage={onSend} />)

    const input = screen.getByPlaceholderText(/type a message/i)
    await user.type(input, "Hello")

    const button = screen.getByRole("button", { name: /send/i })
    await user.click(button)

    expect(button).toBeDisabled()
  })
})
```

### Testing Server Components

```typescript
// tests/unit/chat-page.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ChatPage from "@/app/page";

// Mock Next.js utilities
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("ChatPage", () => {
  it("should render chat interface", async () => {
    const page = await ChatPage();
    render(page);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText(/chat/i)).toBeInTheDocument();
  });
});
```

## API Route Testing

```typescript
// tests/unit/api/chat.test.ts
import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/chat/route";
import { NextRequest } from "next/server";

describe("POST /api/chat", () => {
  it("should return chat response", async () => {
    const request = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Hello",
        conversationId: "test-123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("response");
    expect(data).toHaveProperty("conversationId");
  });

  it("should validate request body", async () => {
    const request = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "" }), // Invalid
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("should handle rate limiting", async () => {
    const request = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "x-forwarded-for": "1.2.3.4" },
      body: JSON.stringify({ message: "Hello" }),
    });

    // Make multiple requests
    for (let i = 0; i < 10; i++) {
      await POST(request);
    }

    const response = await POST(request);
    expect(response.status).toBe(429);
  });
});
```

## Mocking Strategies

### Mocking External Services

```typescript
// tests/helpers/chat-mocks.ts
import { vi } from "vitest";

export const mockGenerativeModel = vi.fn();

export function mockVertexAI(responses: string[] = ["Default response"]) {
  let callCount = 0;

  mockGenerativeModel.mockReturnValue({
    generateContent: vi.fn().mockResolvedValue({
      response: {
        text: () => responses[callCount++ % responses.length],
      },
    }),
  });
}

export function mockVertexAIError(error: Error) {
  mockGenerativeModel.mockReturnValue({
    generateContent: vi.fn().mockRejectedValue(error),
  });
}
```

### Mocking Next.js Modules

```typescript
// tests/setup.ts
import { vi } from "vitest"

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}))

// Mock Next.js image
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

// Mock fetch
global.fetch = vi.fn()

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

### Mocking Environment Variables

```typescript
// tests/helpers/env.ts
import { vi } from "vitest";

export function mockEnv(overrides: Record<string, string> = {}) {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NEXTAUTH_SECRET: "test-secret",
      NEXTAUTH_URL: "http://localhost:3000",
      GOOGLE_PROJECT_ID: "test-project",
      GOOGLE_LOCATION: "us-central1",
      ...overrides,
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });
}
```

## Storybook Integration Tests

```typescript
// src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "UI/Button",
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "default",
    children: "Click me",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    // Test button renders
    expect(button).toBeInTheDocument();

    // Test button is clickable
    await userEvent.click(button);
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");

    expect(button).toBeDisabled();
  },
};
```

## Test Coverage

### Running Tests with Coverage

```bash
# Run all tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- chat-service.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/*.stories.{ts,tsx}",
        ".storybook/",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

## Test Organization

```
tests/
├── setup.ts                    # Global test setup
├── helpers/                    # Test utilities
│   ├── chat-mocks.ts          # Service mocks
│   ├── env.ts                 # Environment helpers
│   └── render.tsx             # Custom render functions
├── fixtures/                   # Test data
│   ├── messages.ts
│   └── users.ts
├── unit/                       # Unit tests
│   ├── chat-service.test.ts
│   ├── errors.test.ts
│   └── utils/
├── integration/                # Integration tests
│   ├── chat.spec.ts
│   └── auth.spec.ts
└── manual/                     # Manual testing scripts
    ├── test-auth.mjs
    └── test-vertex-ai.js
```

## Best Practices

✅ **Do:**

- Write descriptive test names that explain what is being tested
- Test behavior, not implementation details
- Use meaningful assertions with clear error messages
- Mock external dependencies (APIs, databases)
- Test edge cases and error scenarios
- Keep tests isolated and independent
- Use beforeEach/afterEach for setup/cleanup
- Follow AAA pattern: Arrange, Act, Assert

❌ **Don't:**

- Test internal implementation details
- Write brittle tests that break on refactoring
- Have tests depend on each other
- Use real external services in tests
- Ignore test failures or skip tests
- Test framework code (React, Next.js internals)
- Over-mock - test real integration when possible

## Performance Testing

```typescript
import { performance } from "perf_hooks";

describe("Performance Tests", () => {
  it("should process message in under 100ms", async () => {
    const start = performance.now();

    await chatService.sendMessage({
      content: "Hello",
      role: "user",
    });

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
});
```

## Related Patterns

- [API Route Pattern](api-route-pattern.md) - Testing API endpoints
- [Service Layer Pattern](service-layer-pattern.md) - Testing services
- [Error Handling Pattern](error-handling-pattern.md) - Testing error scenarios

## External References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Storybook Testing](https://storybook.js.org/docs/writing-tests)

---

**Last Updated:** November 2025
