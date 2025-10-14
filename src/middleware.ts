import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { authMiddleware } from "./middleware/auth";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import { securityHeadersMiddleware } from "./middleware/security";

// --- Middleware Helper Functions ---

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

// --- Main Middleware ---

export async function middleware(req: NextRequest) {
  try {
    const csrfResponse = handleCsrf(req);
    if (csrfResponse) return csrfResponse;

    const rateLimitResult = await rateLimitMiddleware(req);
    if (rateLimitResult instanceof NextResponse) return rateLimitResult;

    const authResponse = await authMiddleware(req);
    if (authResponse) return authResponse;

    const response = NextResponse.next();

    const isChatAPI = req.nextUrl.pathname.startsWith("/api/chat");
    const limit = isChatAPI ? 3 : 10; // CHAT_API_RATE_LIMIT_REQUESTS : RATE_LIMIT_REQUESTS

    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimitResult.remainingPoints.toString()
    );
    response.headers.set(
      "X-RateLimit-Reset",
      (Date.now() + rateLimitResult.msBeforeNext).toString()
    );

    return securityHeadersMiddleware(response);
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
