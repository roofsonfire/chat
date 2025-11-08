import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { logger } from "@/lib/logger";

// --- Rate Limiting Configuration ---

/**
 * NOTE: In-memory rate limiting is suitable for single-instance deployments.
 *
 * CURRENT STATUS: ✅ Working correctly for current deployment (0-1 Cloud Run instances)
 *
 * LIMITATIONS:
 * - Rate limits reset on server restart
 * - Each Cloud Run instance maintains independent counters
 * - Ineffective when scaling beyond 3+ instances (attacker can bypass by hitting different instances)
 *
 * MIGRATION TRIGGER:
 * - When Cloud Run regularly scales to 3+ instances during normal traffic
 * - When rate limit bypass attempts detected in production logs
 * - When account-level rate limiting required (not just IP-based)
 *
 * SOLUTION: Migrate to Upstash Redis for distributed rate limiting
 * See: docs/features/RATE-LIMITING-MIGRATION.md
 *
 * Security Assessment: Finding #4 (MEDIUM) - Documented and accepted for current scale
 */

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_SECONDS = 15;
const CHAT_API_RATE_LIMIT_REQUESTS = 3;
const CHAT_API_RATE_LIMIT_WINDOW_SECONDS = 30;

const rateLimiter = new RateLimiterMemory({
  points: RATE_LIMIT_REQUESTS,
  duration: RATE_LIMIT_WINDOW_SECONDS,
  blockDuration: 0,
});

const chatAPIRateLimiter = new RateLimiterMemory({
  points: CHAT_API_RATE_LIMIT_REQUESTS,
  duration: CHAT_API_RATE_LIMIT_WINDOW_SECONDS,
  blockDuration: 0,
});

export function extractClientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  const forwarded = req.headers.get("x-forwarded-for");
  if (!forwarded) {
    return "127.0.0.1";
  }
  const clientIp = forwarded
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)[0];
  if (!clientIp) {
    return "127.0.0.1";
  }
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  if (ipv4Regex.test(clientIp) || ipv6Regex.test(clientIp)) {
    return clientIp;
  }
  return "127.0.0.1";
}

export async function rateLimitMiddleware(
  req: NextRequest
): Promise<NextResponse | RateLimiterRes> {
  if (process.env.DISABLE_RATE_LIMIT === "true") {
    return new RateLimiterRes();
  }

  const ip = extractClientIp(req);
  const { pathname } = req.nextUrl;
  const isChatAPI = pathname.startsWith("/api/chat");

  const limiter = isChatAPI ? chatAPIRateLimiter : rateLimiter;
  const limit = isChatAPI ? CHAT_API_RATE_LIMIT_REQUESTS : RATE_LIMIT_REQUESTS;

  try {
    return await limiter.consume(ip);
  } catch (rateLimitError) {
    if (
      rateLimitError &&
      typeof rateLimitError === "object" &&
      "msBeforeNext" in rateLimitError
    ) {
      const rejectedResult = rateLimitError as { msBeforeNext: number };
      const retryAfterSeconds = Math.ceil(rejectedResult.msBeforeNext / 1000);

      logger.warn("Rate limit exceeded", {
        ip,
        path: pathname,
        retryAfter: retryAfterSeconds,
        rateLimiter: isChatAPI ? "chat-api" : "general",
      });

      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          retryAfter: retryAfterSeconds,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "Retry-After": retryAfterSeconds.toString(),
          },
        }
      );
    }
    throw rateLimitError;
  }
}

export async function clearRateLimitStateForTesting(ip: string): Promise<void> {
  if (process.env.NODE_ENV !== "test") {
    return;
  }

  await Promise.allSettled([
    rateLimiter.delete(ip),
    chatAPIRateLimiter.delete(ip),
  ]);
}
