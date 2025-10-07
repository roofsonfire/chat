import { z } from "zod";

// Default values for test mode
const testDefaults = {
  NEXTAUTH_SECRET: "test-secret-for-e2e-tests-only",
  NEXTAUTH_URL: "http://localhost:3000",
  AUTH_USER_EMAIL: "test@example.com",
  AUTH_USER_PASSWORD_HASH:
    "$2b$10$abcdefghijklmnopqrstuuAbCdEfGhIjKlMnOpQrStUvWxYzAbCdE", // placeholder hash
  GOOGLE_PROJECT_ID: "test-project",
  GOOGLE_LOCATION: "us-central1",
  GOOGLE_VERTEX_AI_MODEL_ID: "gemini-2.5-flash-image",
};

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
 * In test mode (NODE_ENV=test), provides default values to avoid validation errors.
 * @throws {Error} With detailed information about missing or invalid environment variables
 */
function parseEnv(): EnvType {
  if (cachedEnv) {
    return cachedEnv;
  }

  // In test mode, merge test defaults with actual env vars
  const envToValidate =
    process.env.NODE_ENV === "test"
      ? { ...testDefaults, ...process.env }
      : process.env;

  const result = envSchema.safeParse(envToValidate);

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
