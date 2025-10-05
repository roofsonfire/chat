import { z } from "zod";

const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  AUTH_USER_EMAIL: z.string().email(),
  AUTH_USER_PASSWORD_HASH: z.string().min(1),
  GOOGLE_PROJECT_ID: z.string().min(1),
  GOOGLE_LOCATION: z.string().min(1),
  GOOGLE_VERTEX_AI_MODEL_ID: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

/**
 * Validates and parses environment variables with user-friendly error messages.
 * @throws {Error} With detailed information about missing or invalid environment variables
 */
function parseEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const missingVars = result.error.issues.map((err) => {
      const path = err.path.join(".");
      return `  - ${path}: ${err.message}`;
    });

    throw new Error(
      `Environment variable validation failed:\n${missingVars.join("\n")}\n\n` +
        `Please check your .env.local file and ensure all required variables are set.\n` +
        `See .env.example for reference.`
    );
  }

  return result.data;
}

export const env = parseEnv();
