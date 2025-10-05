import { env } from "@/lib/env";
import { verifyPassword } from "./password";
import { User } from "next-auth";

type Credentials = Record<"email" | "password", string>;

export async function validateCredentials(
  credentials: Credentials | undefined
): Promise<User | null> {
  if (!credentials) {
    return null;
  }

  const { email, password } = credentials;
  const isAuthorized = email === env.AUTH_USER_EMAIL;

  if (!isAuthorized) {
    return null;
  }

  const isPasswordValid = await verifyPassword(
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
}
