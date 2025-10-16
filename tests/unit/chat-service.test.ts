import { describe, it, expect, vi } from "vitest";
import { ChatService } from "@/lib/services/chat-service";
import { VertexAI } from "@google-cloud/vertexai";
import { handleVertexAIError } from "@/lib/errors/vertex-ai-errors";

// Mock VertexAI
vi.mock("@google-cloud/vertexai");

// Mock env
vi.mock("@/lib/env", () => ({
  env: {
    GOOGLE_PROJECT_ID: "test-project",
    GOOGLE_LOCATION: "us-central1",
    GOOGLE_VERTEX_AI_MODEL_ID: "gemini-2.5-flash",
  },
}));

// Mock logger to prevent console output in tests
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@/lib/errors/vertex-ai-errors", () => ({
  handleVertexAIError: vi.fn(),
}));

describe("ChatService", () => {
  it("should create instance with VertexAI configuration", () => {
    const chatService = new ChatService();

    expect(chatService).toBeDefined();
    expect(VertexAI).toHaveBeenCalledWith({
      project: "test-project",
      location: "us-central1",
    });
  });

  it("should call getGenerativeModel with correct model ID", async () => {
    const mockStream = async function* () {
      yield { text: () => "test" };
    };

    const mockGetModel = vi.fn().mockReturnValue({
      generateContentStream: vi.fn().mockResolvedValue({
        stream: mockStream(),
      }),
    });

    vi.mocked(VertexAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: mockGetModel,
        }) as unknown as VertexAI
    );

    const chatService = new ChatService();
    const messages = [
      { role: "user" as const, content: "Hello", timestamp: new Date() },
    ];

    await chatService.stream(messages);

    expect(mockGetModel).toHaveBeenCalledWith({
      model: "gemini-2.5-flash",
    });
  });

  it("should call handleVertexAIError on API failure", async () => {
    const apiError = new Error("API Error");
    const mockGetModel = vi.fn().mockReturnValue({
      generateContentStream: vi.fn().mockRejectedValue(apiError),
    });

    vi.mocked(VertexAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: mockGetModel,
        }) as unknown as VertexAI
    );

    const chatService = new ChatService();
    const messages = [
      { role: "user" as const, content: "Hello", timestamp: new Date() },
    ];

    await chatService.stream(messages);

    expect(handleVertexAIError).toHaveBeenCalledWith(
      apiError,
      "gemini-2.5-flash"
    );
  });

  it("should format messages with text content", async () => {
    let capturedRequest: {
      contents?: Array<{ role: string; parts: Array<{ text: string }> }>;
    } = {};

    const mockGetModel = vi.fn().mockReturnValue({
      generateContentStream: vi.fn().mockImplementation((req) => {
        capturedRequest = req;
        return Promise.resolve({
          stream: (async function* () {})(),
        });
      }),
    });

    vi.mocked(VertexAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: mockGetModel,
        }) as unknown as VertexAI
    );

    const chatService = new ChatService();
    const messages = [
      {
        role: "user" as const,
        content: "First message",
        timestamp: new Date(),
      },
      {
        role: "assistant" as const,
        content: "Response",
        timestamp: new Date(),
      },
      {
        role: "user" as const,
        content: "Second message",
        timestamp: new Date(),
      },
    ];
    await chatService.stream(messages);

    expect(capturedRequest.contents).toHaveLength(3);
    expect(capturedRequest.contents![0]).toEqual({
      role: "user",
      parts: [{ text: "First message" }],
    });
  });

  it("should include image data in message parts", async () => {
    let capturedRequest: {
      contents?: Array<{
        role: string;
        parts: Array<
          { text: string } | { inlineData: { mimeType: string; data: string } }
        >;
      }>;
    } = {};

    const mockGetModel = vi.fn().mockReturnValue({
      generateContentStream: vi.fn().mockImplementation((req) => {
        capturedRequest = req;
        return Promise.resolve({
          stream: (async function* () {})(),
        });
      }),
    });

    vi.mocked(VertexAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: mockGetModel,
        }) as unknown as VertexAI
    );

    const chatService = new ChatService();
    const messages = [
      {
        role: "user" as const,
        content: "What's this?",
        image: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
        timestamp: new Date(),
      },
    ];

    await chatService.stream(messages);

    expect(capturedRequest.contents![0]!.parts).toHaveLength(2);
    expect(capturedRequest.contents![0]!.parts[0]).toEqual({
      text: "What's this?",
    });
    expect(capturedRequest.contents![0]!.parts[1]).toEqual({
      inlineData: {
        mimeType: "image/jpeg",
        data: "/9j/4AAQSkZJRg==",
      },
    });
  });

  it("should use custom model ID when provided", async () => {
    const mockGetModel = vi.fn().mockReturnValue({
      generateContentStream: vi.fn().mockResolvedValue({
        stream: async function* () {
          yield { text: () => "test" };
        },
      }),
    });

    vi.mocked(VertexAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: mockGetModel,
        }) as unknown as VertexAI
    );

    const chatService = new ChatService();
    const messages = [
      { role: "user" as const, content: "Hello", timestamp: new Date() },
    ];

    await chatService.stream(messages, "gemini-1.5-pro-002");

    expect(mockGetModel).toHaveBeenCalledWith({
      model: "gemini-1.5-pro-002",
    });
  });

  it("should fall back to default model ID when not provided", async () => {
    const mockGetModel = vi.fn().mockReturnValue({
      generateContentStream: vi.fn().mockResolvedValue({
        stream: async function* () {
          yield { text: () => "test" };
        },
      }),
    });

    vi.mocked(VertexAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: mockGetModel,
        }) as unknown as VertexAI
    );

    const chatService = new ChatService();
    const messages = [
      { role: "user" as const, content: "Hello", timestamp: new Date() },
    ];

    await chatService.stream(messages);

    expect(mockGetModel).toHaveBeenCalledWith({
      model: "gemini-2.5-flash",
    });
  });
});
