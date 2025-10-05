import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

/** Rate limit: 5 requests per 10 seconds per IP */
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW = "10 s";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW),
  analytics: true,
  prefix: "chat-app-ratelimit",
});

/**
 * Middleware for authentication and rate limiting.
 * Protects all routes except public assets and auth endpoints.
 *
 * Rate Limiting:
 * - Applies to all requests (including API routes)
 * - Uses IP-based identification
 * - Sliding window: 5 requests per 10 seconds
 *
 * Authentication:
 * - Redirects unauthenticated users to /login
 * - Allows access to /api/auth/* for NextAuth
 * - Redirects authenticated users away from /login
 */
export async function middleware(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      logger.warn("Rate limit exceeded", {
        ip,
        path: req.nextUrl.pathname,
        reset: new Date(reset).toISOString(),
      });

      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Authentication check
    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // Allow requests for next-auth session and provider fetching
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    // Redirect to login if no token and not on the login page
    if (!token && pathname !== "/login") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If the user is authenticated and tries to access the login page, redirect to home
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", RATE_LIMIT_REQUESTS.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());

    return response;
  } catch (error) {
    logger.error("Middleware error", { error, path: req.nextUrl.pathname });
    // Allow request to proceed on middleware errors to avoid breaking the app
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
