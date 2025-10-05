import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
});

/**
 * Middleware for authentication and rate limiting.
 * Protects all routes except public assets and auth endpoints.
 */
export async function middleware(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      logger.warn("Rate limit exceeded", { ip, path: req.nextUrl.pathname });
      return new NextResponse("Too many requests. Please try again later.", {
        status: 429,
      });
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

    return NextResponse.next();
  } catch (error) {
    logger.error("Middleware error", { error, path: req.nextUrl.pathname });
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
