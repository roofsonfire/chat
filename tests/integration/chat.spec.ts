import { POST } from "@/app/api/chat/route";
import { NextRequest } from "next/server";
import { vi } from "vitest";

// Mock the ChatService
vi.mock("@/lib/services/chat-service", () => ({
  ChatService: vi.fn().mockImplementation(() => ({
    streamToReadable: vi.fn().mockResolvedValue(
      new ReadableStream({
        start(controller) {
          controller.enqueue("Hello");
          controller.close();
        },
      })
    ),
  })),
}));

describe("POST /api/chat", () => {
  it("should return a streaming response for a valid request", async () => {
    const body = {
      messages: [{ role: "user", content: "Hello" }],
    };
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8"
    );
  });

  it("should return a 400 error for an invalid request", async () => {
    const body = {
      // Invalid body
    };
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const response = await POST(req);

    expect(response.status).toBe(400);
  });
});
