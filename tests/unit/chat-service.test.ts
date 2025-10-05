import { describe, it, expect, vi } from "vitest";
import { ChatService } from "@/lib/services/chat-service";
import { VertexAI } from "@google-cloud/vertexai";

// Mock VertexAI
vi.mock("@google-cloud/vertexai");

// Mock env
vi.mock("@/lib/env", () => ({
  env: {
    GOOGLE_PROJECT_ID: "test-project",
    GOOGLE_LOCATION: "us-central1",
    GOOGLE_VERTEX_AI_MODEL_ID: "gemini-1.5-flash-002",
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
        }) as any
    ); // eslint-disable-line @typescript-eslint/no-explicit-any

    const chatService = new ChatService();
    const messages = [{ role: "user" as const, content: "Hello" }];

    await chatService.stream(messages);

    expect(mockGetModel).toHaveBeenCalledWith({
      model: "gemini-1.5-flash-002",
    });
  });

  it("should throw VertexAIError on API failure", async () => {
    const mockGetModel = vi.fn().mockReturnValue({
      generateContentStream: vi.fn().mockRejectedValue(new Error("API Error")),
    });

    vi.mocked(VertexAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: mockGetModel,
        }) as any
    ); // eslint-disable-line @typescript-eslint/no-explicit-any

    const chatService = new ChatService();
    const messages = [{ role: "user" as const, content: "Hello" }];

    await expect(chatService.stream(messages)).rejects.toThrow();
  });

  it("should format messages with text content", async () => {
    let capturedRequest: any; // eslint-disable-line @typescript-eslint/no-explicit-any

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
        }) as any
    ); // eslint-disable-line @typescript-eslint/no-explicit-any

    const chatService = new ChatService();
    const messages = [
      { role: "user" as const, content: "First message" },
      { role: "assistant" as const, content: "Response" },
      { role: "user" as const, content: "Second message" },
    ];

    await chatService.stream(messages);

    expect(capturedRequest.contents).toHaveLength(3);
    expect(capturedRequest.contents[0]).toEqual({
      role: "user",
      parts: [{ text: "First message" }],
    });
  });

  it("should include image data in message parts", async () => {
    let capturedRequest: any; // eslint-disable-line @typescript-eslint/no-explicit-any

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
        }) as any
    ); // eslint-disable-line @typescript-eslint/no-explicit-any

    const chatService = new ChatService();
    const messages = [
      {
        role: "user" as const,
        content: "What's this?",
        image: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
      },
    ];

    await chatService.stream(messages);

    expect(capturedRequest.contents[0].parts).toHaveLength(2);
    expect(capturedRequest.contents[0].parts[0]).toEqual({
      text: "What's this?",
    });
    expect(capturedRequest.contents[0].parts[1]).toEqual({
      inlineData: {
        mimeType: "image/jpeg",
        data: "/9j/4AAQSkZJRg==",
      },
    });
  });
});
