import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { RateLimiterRes } from "rate-limiter-flexible";

import {
  rateLimitMiddleware,
  extractClientIp,
  clearRateLimitStateForTesting,
} from "@/middleware/rate-limit";

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("rateLimitMiddleware", () => {
  beforeEach(() => {
    vi.stubEnv("DISABLE_RATE_LIMIT", "false");
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    await clearRateLimitStateForTesting("203.0.113.10");
    await clearRateLimitStateForTesting("203.0.113.11");
    await clearRateLimitStateForTesting("203.0.113.12");
  });

  const createRequest = (url: string, headers?: HeadersInit) =>
    new NextRequest(url, {
      method: "GET",
      headers,
    });

  it("uses x-real-ip when provided", () => {
    const request = createRequest("http://localhost:3000/api/chat", {
      "x-real-ip": "203.0.113.10",
      "x-forwarded-for": "198.51.100.1",
    });

    expect(extractClientIp(request)).toBe("203.0.113.10");
  });

  it("falls back to first valid x-forwarded-for entry", () => {
    const request = createRequest("http://localhost:3000/api/chat", {
      "x-forwarded-for": "203.0.113.11, 198.51.100.2",
    });

    expect(extractClientIp(request)).toBe("203.0.113.11");
  });

  it("returns localhost when forwarded header contains no valid ip", () => {
    const request = createRequest("http://localhost:3000/api/chat", {
      "x-forwarded-for": "malicious.example.com",
    });

    expect(extractClientIp(request)).toBe("127.0.0.1");
  });

  it("enforces chat API rate limit", async () => {
    const ip = "203.0.113.12";
    const request = () =>
      new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "x-real-ip": ip,
        },
      });

    const allowedResponses: Array<RateLimiterRes | NextResponse> = [];

    // Chat API limit is 3 requests per 30 seconds
    for (let i = 0; i < 3; i += 1) {
      const result = await rateLimitMiddleware(request());
      allowedResponses.push(result);
    }

    const blocked = await rateLimitMiddleware(request());

    allowedResponses.forEach((result) => {
      expect(result).toBeInstanceOf(RateLimiterRes);
    });

    expect(blocked).toBeInstanceOf(NextResponse);
    expect((blocked as NextResponse).status).toBe(429);
    expect((blocked as NextResponse).headers.get("Retry-After")).toBeTruthy();
  });
});
