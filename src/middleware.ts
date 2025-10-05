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
 * Add security headers to responses
 * Implements defense-in-depth security practices
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking attacks
  response.headers.set("X-Frame-Options", "DENY");

  // Enable browser XSS protection
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Prevent MIME type sniffing
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Enforce HTTPS in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  // Referrer policy - balance privacy and functionality
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions policy - restrict potentially dangerous features
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
      "style-src 'self' 'unsafe-inline'", // Styled components require unsafe-inline
      "img-src 'self' data: blob:", // Allow data URIs for base64 images
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  return response;
}

/**
 * Middleware for authentication, rate limiting, and security.
 * Protects all routes except public assets and auth endpoints.
 *
 * Security Features:
 * - CSRF protection via origin validation
 * - Security headers (CSP, HSTS, etc.)
 * - Rate limiting with IP-based identification
 * - Authentication enforcement
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
    // CSRF Protection: Origin validation for state-changing requests
    if (req.method !== "GET" && req.method !== "HEAD") {
      const origin = req.headers.get("origin");
      const host = req.headers.get("host");

      // Allow requests with no origin (e.g., Postman, cURL) in development
      if (origin && host) {
        const originUrl = new URL(origin);
        const expectedOrigin = originUrl.hostname;
        const actualHost = host.split(":")[0]; // Remove port if present

        if (expectedOrigin !== actualHost && expectedOrigin !== "localhost") {
          logger.warn("CSRF protection: Origin mismatch", {
            origin: expectedOrigin,
            host: actualHost,
            method: req.method,
            path: req.nextUrl.pathname,
          });

          return new NextResponse(
            JSON.stringify({
              error: "Invalid origin",
            }),
            {
              status: 403,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
      }
    }
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

    // Create response and add security headers
    const response = NextResponse.next();

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", RATE_LIMIT_REQUESTS.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());

    // Add security headers
    return addSecurityHeaders(response);
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
