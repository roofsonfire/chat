import { env } from "@/lib/env";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { allowlist } from "@/lib/auth/allowlist";
import { validateCredentials } from "@/lib/auth/provider";

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
        return validateCredentials(credentials ?? undefined);
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
      console.error("[NextAuth][error]", code, metadata);
    },
    warn(code: string) {
      console.warn("[NextAuth][warn]", code);
    },
    debug(code: string, metadata?: unknown) {
      console.debug("[NextAuth][debug]", code, metadata);
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("[NextAuth][signIn] Callback triggered", {
        userEmail: user?.email,
        provider: account?.provider,
        allowlist,
        isInAllowlist: user?.email ? allowlist.includes(user.email) : false,
      });

      if (!user?.email) {
        console.error("[NextAuth][signIn] No email provided by user");
        return false;
      }

      const isAllowed = allowlist.includes(user.email);

      if (!isAllowed) {
        console.warn("[NextAuth][signIn] User not in allowlist", {
          email: user.email,
          allowlist,
        });
        return false;
      }

      console.log("[NextAuth][signIn] User allowed", { email: user.email });
      return true;
    },
    async jwt({ token, user }) {
      console.log("[NextAuth][jwt] Callback triggered", {
        hasToken: !!token,
        hasUser: !!user,
        userEmail: user?.email || token?.email,
      });

      if (user) {
        token.email = user.email;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth][session] Callback triggered", {
        hasSession: !!session,
        hasToken: !!token,
        sessionUserEmail: session?.user?.email,
        tokenEmail: token?.email,
      });

      if (token?.email && session.user) {
        session.user.email = token.email as string;
      }
      if (token?.name && session.user) {
        session.user.name = token.name as string;
      }

      return session;
    },
  },
};
