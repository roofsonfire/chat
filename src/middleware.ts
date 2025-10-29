import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { authMiddleware } from "./middleware/auth";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import { securityHeadersMiddleware } from "./middleware/security";

// --- Middleware Helper Functions ---

function handleCsrf(req: NextRequest): NextResponse | void {
  logger.debug("handleCsrf: Request received", {
    method: req.method,
    url: req.url,
  });
  if (req.method === "GET" || req.method === "HEAD") {
    logger.debug("handleCsrf: Skipping for GET/HEAD request");
    return;
  }

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  logger.debug("handleCsrf: Origin and Host", { origin, host });

  if (origin && host) {
    const originUrl = new URL(origin);
    const expectedOrigin = originUrl.hostname;
    const actualHost = host.split(":")[0];
    logger.debug("handleCsrf: Parsed Origin and Host", {
      expectedOrigin,
      actualHost,
    });

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
  logger.debug("handleCsrf: CSRF check passed");
}

// --- Main Middleware ---

export async function middleware(req: NextRequest) {
  logger.info("middleware: Request received", {
    url: req.url,
    method: req.method,
    ip: req.ip,
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

  const response = NextResponse.next();
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

  const finalResponse = securityHeadersMiddleware(response);
  logger.info("middleware: Request processed successfully");
  return finalResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|middleware-error|.*\\..*).*)",
  ],
};
