import bcrypt from "bcrypt";
import { env } from "@/lib/env";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const { email, password } = credentials;
        const isAuthorized = email === env.AUTH_USER_EMAIL;

        if (!isAuthorized) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          env.AUTH_USER_PASSWORD_HASH
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: "1",
          email: env.AUTH_USER_EMAIL,
          name: "Admin",
        };
      },
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};
