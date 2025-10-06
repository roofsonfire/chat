import { z } from "zod";

const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  AUTH_USER_EMAIL: z.string().email(),
  AUTH_USER_PASSWORD_HASH: z.string().min(1),
  GOOGLE_PROJECT_ID: z.string().min(1),
  GOOGLE_LOCATION: z.string().min(1),
  GOOGLE_VERTEX_AI_MODEL_ID: z.string().min(1),
});

type EnvType = z.infer<typeof envSchema>;

let cachedEnv: EnvType | null = null;

/**
 * Validates and parses environment variables with user-friendly error messages.
 * Uses lazy evaluation to defer validation until runtime.
 * @throws {Error} With detailed information about missing or invalid environment variables
 */
function parseEnv(): EnvType {
  if (cachedEnv) {
    return cachedEnv;
  }

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

  cachedEnv = result.data;
  return result.data;
}

// Export a Proxy that validates only when accessed
export const env = new Proxy({} as EnvType, {
  get(_target, prop: string) {
    const validated = parseEnv();
    return validated[prop as keyof EnvType];
  },
});
