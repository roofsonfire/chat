import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { logger } from "@/lib/logger";

// --- Rate Limiting Configuration ---
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

export async function rateLimitMiddleware(
  req: NextRequest
): Promise<NextResponse | RateLimiterRes> {
  if (process.env.DISABLE_RATE_LIMIT === "true") {
    return new RateLimiterRes();
  }

  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
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
