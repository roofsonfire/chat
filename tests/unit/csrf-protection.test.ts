import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

// Mock logger to avoid console output in tests
vi.mock("@/lib/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock auth middleware - always return null (pass through)
vi.mock("@/middleware/auth", () => ({
  authMiddleware: vi.fn(async () => null),
}));

// Mock rate limit middleware - always return remaining points (pass through)
vi.mock("@/middleware/rate-limit", () => ({
  rateLimitMiddleware: vi.fn(async () => ({
    remainingPoints: 10,
    msBeforeNext: 10000,
  })),
}));

// Mock security middleware - return response as-is
vi.mock("@/middleware/security", () => ({
  createCspNonce: vi.fn(() => "test-nonce-12345"),
  securityHeadersMiddleware: vi.fn((response: NextResponse) => response),
}));

// Import middleware after mocks are set up
const { middleware } = await import("@/middleware");

describe("CSRF Protection Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Safe HTTP Methods (GET, HEAD, OPTIONS)", () => {
    it("should allow GET requests without Origin or Referer", async () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "GET",
      });

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it("should allow HEAD requests without Origin or Referer", async () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "HEAD",
      });

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it("should allow OPTIONS requests without Origin or Referer", async () => {
      const request = new NextRequest("http://localhost:3000/api/test", {
        method: "OPTIONS",
      });

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe("State-Changing Methods (POST, PUT, DELETE, PATCH)", () => {
    describe("Missing Headers", () => {
      it("should reject POST request with no Origin or Referer", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Missing required security headers");
      });

      it("should reject PUT request with no Origin or Referer", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "PUT",
        });

        const response = await middleware(request);

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Missing required security headers");
      });

      it("should reject DELETE request with no Origin or Referer", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "DELETE",
        });

        const response = await middleware(request);

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Missing required security headers");
      });

      it("should reject PATCH request with no Origin or Referer", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "PATCH",
        });

        const response = await middleware(request);

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Missing required security headers");
      });
    });

    describe("Valid Origin Header", () => {
      it("should allow POST with valid production origin", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            origin: "https://chat.daza.ar",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(200);
      });

      it("should allow POST with valid localhost origin (http)", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            origin: "http://localhost:3000",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(200);
      });

      it("should allow POST with valid 127.0.0.1 origin", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            origin: "http://127.0.0.1:3000",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(200);
      });
    });

    describe("Invalid Origin Header", () => {
      it("should reject POST with invalid origin", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            origin: "https://evil.com",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Invalid origin");
      });

      it("should reject POST with different port in origin", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            origin: "http://localhost:4000",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Invalid origin");
      });

      it("should reject POST with subdomain in origin", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            origin: "https://evil.chat.daza.ar",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Invalid origin");
      });
    });

    describe("Valid Referer Header (when Origin is missing)", () => {
      it("should allow POST with valid production referer", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            referer: "https://chat.daza.ar/",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(200);
      });

      it("should allow POST with valid localhost referer", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            referer: "http://localhost:3000/chat",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(200);
      });

      it("should allow POST with valid 127.0.0.1 referer", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            referer: "http://127.0.0.1:3000/",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(200);
      });
    });

    describe("Invalid Referer Header (when Origin is missing)", () => {
      it("should reject POST with invalid referer domain", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            referer: "https://evil.com/page",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Invalid referer");
      });

      it("should reject POST with malformed referer", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            referer: "not-a-valid-url",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Invalid referer");
      });

      it("should reject POST with wrong port in referer", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            referer: "http://localhost:8080/",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Invalid referer");
      });
    });

    describe("Origin Takes Precedence Over Referer", () => {
      it("should validate Origin when both Origin and Referer present", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            origin: "http://localhost:3000",
            referer: "https://evil.com/page",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        // Should pass because Origin is valid (Referer ignored)
        expect(response.status).toBe(200);
      });

      it("should reject when Origin invalid even with valid Referer", async () => {
        const request = new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: {
            origin: "https://evil.com",
            referer: "http://localhost:3000/",
            "content-type": "application/json",
          },
        });

        const response = await middleware(request);

        // Should fail because Origin is invalid
        expect(response.status).toBe(403);
        const body = await response.json();
        expect(body.error).toBe("Invalid origin");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle requests with empty Origin header", async () => {
      const request = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          origin: "",
          "content-type": "application/json",
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toBe("Missing required security headers");
    });

    it("should handle requests with empty Referer header", async () => {
      const request = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          referer: "",
          "content-type": "application/json",
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toBe("Missing required security headers");
    });
  });
});
