import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "@/lib/env";

export async function authMiddleware(
  req: NextRequest
): Promise<NextResponse | void> {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return;
  }

  const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });

  if (!token && pathname !== "/login") {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
