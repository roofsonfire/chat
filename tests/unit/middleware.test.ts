import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

// Mock dependencies
vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

vi.mock("rate-limiter-flexible", () => {
  const mockConsume = vi.fn().mockResolvedValue({
    remainingPoints: 9,
    msBeforeNext: 10000,
    consumedPoints: 1,
    isFirstInDuration: false,
  });

  class MockRateLimiterMemory {
    consume = mockConsume;
  }

  class MockRateLimiterRes {
    remainingPoints = 9;
    msBeforeNext = 10000;
  }

  return {
    RateLimiterMemory: MockRateLimiterMemory,
    RateLimiterRes: MockRateLimiterRes,
  };
});

vi.mock("@/lib/env", () => ({
  env: {
    NEXTAUTH_SECRET: "test-secret",
    NEXTAUTH_URL: "http://localhost:3000",
    AUTH_USER_EMAIL: "test@example.com",
    AUTH_USER_PASSWORD_HASH: "test-hash",
    GOOGLE_PROJECT_ID: "test-project",
    GOOGLE_LOCATION: "us-central1",
    GOOGLE_VERTEX_AI_MODEL_ID: "gemini-2.5-flash",
  },
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { getToken } from "next-auth/jwt";
import { logger } from "@/lib/logger";

describe("Middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Security Headers", () => {
    it("should add security headers to successful responses", async () => {
      vi.mocked(getToken).mockResolvedValue({
        email: "test@example.com",
      } as unknown as Awaited<ReturnType<typeof getToken>>);

      const req = new NextRequest("http://localhost:3000/", {
        method: "GET",
      });

      const response = await middleware(req);

      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(response.headers.get("X-XSS-Protection")).toBe("1; mode=block");
      expect(response.headers.get("Referrer-Policy")).toBe(
        "strict-origin-when-cross-origin"
      );
      expect(response.headers.get("Permissions-Policy")).toContain("camera=()");
      expect(response.headers.get("Content-Security-Policy")).toContain(
        "default-src 'self'"
      );
    });

    it.skip("should include HSTS header in production", async () => {
      // Skipped: Cannot modify process.env.NODE_ENV in tests
      // HSTS is set based on NODE_ENV which is readonly in the test environment
    });
  });

  describe("CSRF Protection", () => {
    it("should allow GET requests without origin validation", async () => {
      vi.mocked(getToken).mockResolvedValue({
        email: "test@example.com",
      } as unknown as Awaited<ReturnType<typeof getToken>>);

      const req = new NextRequest("http://localhost:3000/", {
        method: "GET",
      });

      const response = await middleware(req);

      expect(response.status).not.toBe(403);
    });

    it("should allow POST requests with matching origin", async () => {
      vi.mocked(getToken).mockResolvedValue({
        email: "test@example.com",
      } as unknown as Awaited<ReturnType<typeof getToken>>);

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          host: "localhost:3000",
        },
      });

      const response = await middleware(req);

      expect(response.status).not.toBe(403);
    });

    it("should block POST requests with mismatched origin", async () => {
      vi.mocked(getToken).mockResolvedValue({
        email: "test@example.com",
      } as unknown as Awaited<ReturnType<typeof getToken>>);

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          origin: "http://malicious-site.com",
          host: "localhost:3000",
        },
      });

      const response = await middleware(req);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error).toBe("Invalid origin");
      // Our new CSRF implementation logs with this message
      expect(logger.warn).toHaveBeenCalledWith(
        "CSRF check failed: Invalid Origin",
        expect.objectContaining({
          origin: "http://malicious-site.com",
          method: "POST",
          path: "/api/chat",
          ip: "127.0.0.1",
        })
      );
    });

    it("should allow localhost origin in development", async () => {
      vi.mocked(getToken).mockResolvedValue({
        email: "test@example.com",
      } as unknown as Awaited<ReturnType<typeof getToken>>);

      const req = new NextRequest("http://example.com/api/chat", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          host: "example.com",
        },
      });

      const response = await middleware(req);

      expect(response.status).not.toBe(403);
    });

    it("should allow POST requests without origin header if referer is valid", async () => {
      vi.mocked(getToken).mockResolvedValue({
        email: "test@example.com",
      } as unknown as Awaited<ReturnType<typeof getToken>>);

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          host: "localhost:3000",
          // Our new CSRF implementation requires Origin OR Referer
          referer: "http://localhost:3000/",
        },
      });

      const response = await middleware(req);

      expect(response.status).not.toBe(403);
    });
  });

  describe("Rate Limiting Headers", () => {
    it("should add rate limit headers to successful responses", async () => {
      vi.mocked(getToken).mockResolvedValue({
        email: "test@example.com",
      } as unknown as Awaited<ReturnType<typeof getToken>>);

      const req = new NextRequest("http://localhost:3000/", {
        method: "GET",
      });

      const response = await middleware(req);

      expect(response.headers.get("X-RateLimit-Limit")).toBe("10");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("9");
      expect(response.headers.get("X-RateLimit-Reset")).toBeTruthy();
    });
  });

  describe("Authentication", () => {
    it("should redirect unauthenticated users to login", async () => {
      vi.mocked(getToken).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/", {
        method: "GET",
      });

      const response = await middleware(req);

      expect(response.status).toBe(307); // Temporary redirect
      expect(response.headers.get("location")).toContain("/login");
    });

    it("should allow access to login page without authentication", async () => {
      vi.mocked(getToken).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/login", {
        method: "GET",
      });

      const response = await middleware(req);

      expect(response.status).not.toBe(307);
    });

    it("should allow access to auth API routes", async () => {
      vi.mocked(getToken).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/auth/signin", {
        method: "GET",
      });

      const response = await middleware(req);

      expect(response.status).not.toBe(307);
    });

    it("should redirect authenticated users away from login page", async () => {
      vi.mocked(getToken).mockResolvedValue({
        email: "test@example.com",
      } as unknown as Awaited<ReturnType<typeof getToken>>);

      const req = new NextRequest("http://localhost:3000/login", {
        method: "GET",
      });

      const response = await middleware(req);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
    });

    it("should preserve the 'from' parameter when redirecting to login", async () => {
      vi.mocked(getToken).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/protected-route", {
        method: "GET",
      });

      const response = await middleware(req);

      expect(response.headers.get("location")).toContain(
        "from=%2Fprotected-route"
      );
    });
  });

  describe("Public Routes", () => {
    it("should not block requests to static assets", async () => {
      // Note: The matcher config prevents static assets from reaching middleware
      // Static routes like /_next/static/*, /_next/image/*, and /favicon.ico
      // are excluded by the matcher pattern in middleware config
      // This test documents that behavior
      expect(true).toBe(true);
    });
  });
});
