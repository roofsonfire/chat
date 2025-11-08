import { env } from "@/lib/env";
import type { AuthOptions, Account, User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { allowlist } from "@/lib/auth/allowlist";
import { validateCredentials } from "@/lib/auth/provider";
import { logger } from "@/lib/logger";

function maskEmail(email?: string | null): string {
  if (!email) {
    return "unknown";
  }
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) {
    return "redacted";
  }
  const visible = localPart.slice(0, 2);
  const maskedLocal =
    localPart.length <= 2
      ? `${visible}*`
      : `${visible}${"*".repeat(localPart.length - 2)}`;
  return `${maskedLocal}@${domain}`;
}

// --- Auth Callback Functions ---

async function handleSignIn({
  user,
  account,
}: {
  user: User;
  account: Account | null;
  profile?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}) {
  logger.info("[NextAuth][signIn] Callback triggered", {
    userEmail: maskEmail(user?.email),
    provider: account?.provider,
    isInAllowlist: user?.email ? allowlist.includes(user.email) : false,
  });

  if (!user?.email) {
    logger.error("[NextAuth][signIn] No email provided by user");
    return false;
  }

  const isAllowed = allowlist.includes(user.email);

  if (!isAllowed) {
    logger.warn("[NextAuth][signIn] User not in allowlist", {
      email: maskEmail(user.email),
    });
    return false;
  }

  logger.info("[NextAuth][signIn] User allowed", {
    email: maskEmail(user.email),
  });
  return true;
}

async function populateJwt({
  token,
  user,
  account,
}: {
  token: JWT;
  user?: User;
  account?: Account | null;
  profile?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}) {
  logger.info("[NextAuth][jwt] Callback triggered", {
    hasUser: !!user,
    tokenHasEmail: Boolean(token?.email),
    accountProvider: account?.provider,
  });

  if (user) {
    token.email = user.email;
    token.name = user.name;
  }

  return token;
}

async function createSession({
  session,
  token,
}: {
  session: Session;
  token: JWT;
  user: User;
}) {
  logger.info("[NextAuth][session] Callback triggered", {
    hasSessionUser: Boolean(session?.user),
    tokenHasEmail: Boolean(token?.email),
  });

  if (token?.email && session.user) {
    session.user.email = token.email as string;
  }
  if (token?.name && session.user) {
    session.user.name = token.name as string;
  }

  return session;
}

const providers: AuthOptions["providers"] = [
  GoogleProvider({
    clientId: env.GOOGLE_CLIENT_ID!,
    clientSecret: env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        scope: "openid email profile",
      },
    },
  }),
];

if (env.ENABLE_TEST_CREDENTIALS === "true") {
  providers.push(
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedUser = await validateCredentials(
          credentials ?? undefined
        );
        if (validatedUser) {
          logger.info("[NextAuth][authorize] Credentials validated", {
            email: maskEmail(validatedUser.email),
          });
        } else {
          logger.warn("[NextAuth][authorize] Invalid credentials provided");
        }
        return validatedUser;
      },
    })
  );
}

export const authOptions: AuthOptions = {
  providers,
  secret: env.NEXTAUTH_SECRET,
  // Enable detailed logs to help diagnose provider errors in staging
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(
      code: string,
      metadata?: Error | { [key: string]: unknown; error: Error }
    ) {
      logger.error(
        `[NextAuth][error] ${code}`,
        metadata ? { metadata } : undefined
      );
    },
    warn(code: string) {
      logger.warn(`[NextAuth][warn] ${code}`, { code });
    },
    debug(code: string, metadata?: unknown) {
      logger.debug(
        `[NextAuth][debug] ${code}`,
        metadata ? { metadata } : undefined
      );
    },
  },
  // ✅ SECURITY FIX: Explicit cookie security configuration
  cookies: {
    sessionToken: {
      name: `${env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        sameSite: "lax", // CSRF protection
        path: "/",
        secure: env.NODE_ENV === "production", // HTTPS only in production
        domain: env.NODE_ENV === "production" ? ".daza.ar" : undefined,
      },
    },
    callbackUrl: {
      name: `${env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `${env.NODE_ENV === "production" ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: env.NODE_ENV === "production",
      },
    },
  },
  // ✅ SECURITY FIX: Session timeout configuration
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update every hour
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    signIn: handleSignIn,
    jwt: populateJwt,
    session: createSession,
  },
};
