import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { authMiddleware } from "./middleware/auth";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import {
  createCspNonce,
  securityHeadersMiddleware,
} from "./middleware/security";

// --- Middleware Helper Functions ---

/**
 * Validates Origin header against allowlist
 */
function isAllowedOrigin(origin: string): boolean {
  const ALLOWED_ORIGINS = [
    "https://chat.daza.ar",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Validates Referer header against allowlist
 */
function isAllowedReferer(referer: string): boolean {
  const ALLOWED_DOMAINS = ["chat.daza.ar", "localhost:3000", "127.0.0.1:3000"];

  try {
    const url = new URL(referer);
    return ALLOWED_DOMAINS.includes(url.host);
  } catch {
    // Invalid URL format
    return false;
  }
}

/**
 * CSRF protection middleware
 * Requires Origin OR Referer header for state-changing requests
 * Validates both against allowlist
 */
function handleCsrf(req: NextRequest): NextResponse | void {
  logger.debug("handleCsrf: Request received", {
    method: req.method,
    url: req.url,
  });

  // Skip CSRF check for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    logger.debug("handleCsrf: Skipping for safe method", {
      method: req.method,
    });
    return;
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  logger.debug("handleCsrf: Headers received", {
    origin,
    referer,
    method: req.method,
    path: req.nextUrl.pathname,
  });

  // REQUIRE at least one header for state-changing requests
  if (!origin && !referer) {
    logger.warn("CSRF check failed: Missing Origin and Referer headers", {
      method: req.method,
      path: req.nextUrl.pathname,
      ip:
        (req.headers.get("x-forwarded-for") ?? "127.0.0.1")
          .split(",")[0]
          ?.trim() ?? "127.0.0.1",
    });

    return new NextResponse(
      JSON.stringify({ error: "Missing required security headers" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Validate Origin if present
  if (origin && !isAllowedOrigin(origin)) {
    logger.warn("CSRF check failed: Invalid Origin", {
      origin,
      method: req.method,
      path: req.nextUrl.pathname,
      ip:
        (req.headers.get("x-forwarded-for") ?? "127.0.0.1")
          .split(",")[0]
          ?.trim() ?? "127.0.0.1",
    });

    return new NextResponse(JSON.stringify({ error: "Invalid origin" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate Referer if Origin is missing
  if (!origin && referer && !isAllowedReferer(referer)) {
    logger.warn("CSRF check failed: Invalid Referer", {
      referer,
      method: req.method,
      path: req.nextUrl.pathname,
      ip:
        (req.headers.get("x-forwarded-for") ?? "127.0.0.1")
          .split(",")[0]
          ?.trim() ?? "127.0.0.1",
    });

    return new NextResponse(JSON.stringify({ error: "Invalid referer" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.debug("handleCsrf: CSRF check passed", {
    validatedHeader: origin ? "origin" : "referer",
  });
}

// --- Main Middleware ---

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ PRODUCTION: Skip middleware for health check endpoints
  // These must be accessible by Cloud Run / Kubernetes probes without auth or rate limiting
  if (pathname.startsWith("/api/health")) {
    logger.debug("middleware: Health check endpoint - skipping middleware", {
      pathname,
    });
    return NextResponse.next();
  }

  logger.info("middleware: Request received", {
    url: req.url,
    method: req.method,
    ip:
      (req.headers.get("x-forwarded-for") ?? "127.0.0.1")
        .split(",")[0]
        ?.trim() ?? "127.0.0.1",
  });

  const csrfResponse = handleCsrf(req);
  if (csrfResponse) {
    logger.warn("middleware: CSRF check failed, returning 403");
    return csrfResponse;
  }

  const rateLimitResult = await rateLimitMiddleware(req);
  if (rateLimitResult instanceof NextResponse) {
    logger.warn("middleware: Rate limit exceeded, returning 429");
    return rateLimitResult;
  }

  const authResponse = await authMiddleware(req);
  if (authResponse) {
    logger.info("middleware: Auth middleware returned a response");
    return authResponse;
  }

  const nonce = createCspNonce();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-csp-nonce", nonce);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  logger.debug("middleware: NextResponse.next() called");

  const isChatAPI = req.nextUrl.pathname.startsWith("/api/chat");
  const limit = isChatAPI ? 3 : 10; // CHAT_API_RATE_LIMIT_REQUESTS : RATE_LIMIT_REQUESTS
  logger.debug("middleware: Rate limit details", {
    isChatAPI,
    limit,
    remaining: rateLimitResult.remainingPoints,
  });

  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set(
    "X-RateLimit-Remaining",
    rateLimitResult.remainingPoints.toString()
  );
  response.headers.set(
    "X-RateLimit-Reset",
    (Date.now() + rateLimitResult.msBeforeNext).toString()
  );
  logger.debug("middleware: Rate limit headers set");

  const finalResponse = securityHeadersMiddleware(response, nonce);
  logger.info("middleware: Request processed successfully");
  return finalResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|middleware-error|.*\\..*).*)",
  ],
};
