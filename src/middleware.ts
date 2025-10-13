import { getToken, JWT } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { env } from "@/lib/env";
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

// --- Middleware Helper Functions ---

async function handleRateLimiting(
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

function handleCsrf(req: NextRequest): NextResponse | void {
  if (req.method === "GET" || req.method === "HEAD") {
    return;
  }

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (origin && host) {
    const originUrl = new URL(origin);
    const expectedOrigin = originUrl.hostname;
    const actualHost = host.split(":")[0];

    if (expectedOrigin !== actualHost && expectedOrigin !== "localhost") {
      logger.warn("CSRF protection: Origin mismatch", {
        origin: expectedOrigin,
        host: actualHost,
        method: req.method,
        path: req.nextUrl.pathname,
      });

      return new NextResponse(JSON.stringify({ error: "Invalid origin" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}

async function handleAuth(
  req: NextRequest,
  token: JWT | null
): Promise<NextResponse | void> {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return;
  }

  if (!token && pathname !== "/login") {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://accounts.google.com",
      "frame-src 'self' https://accounts.google.com",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  return response;
}

// --- Main Middleware ---

export async function middleware(req: NextRequest) {
  try {
    const csrfResponse = handleCsrf(req);
    if (csrfResponse) return csrfResponse;

    const rateLimitResult = await handleRateLimiting(req);
    if (rateLimitResult instanceof NextResponse) return rateLimitResult;

    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
    const authResponse = await handleAuth(req, token);
    if (authResponse) return authResponse;

    const response = NextResponse.next();

    const isChatAPI = req.nextUrl.pathname.startsWith("/api/chat");
    const limit = isChatAPI
      ? CHAT_API_RATE_LIMIT_REQUESTS
      : RATE_LIMIT_REQUESTS;

    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimitResult.remainingPoints.toString()
    );
    response.headers.set(
      "X-RateLimit-Reset",
      (Date.now() + rateLimitResult.msBeforeNext).toString()
    );

    return addSecurityHeaders(response);
  } catch (error) {
    logger.error("Middleware error", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
      errorObject: JSON.stringify(error, null, 2),
      path: req.nextUrl.pathname,
    });

    const errorUrl = new URL("/middleware-error", req.url);
    return NextResponse.redirect(errorUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|middleware-error|.*\\..*).*)",
  ],
};
