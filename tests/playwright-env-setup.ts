/**
 * Environment setup for Playwright E2E tests.
 * This file loads environment variables from .env.test
 * See: https://playwright.dev/docs/test-parameterize#env-files
 */
import { config } from "dotenv";
import path from "node:path";

// Load .env.test file
config({ path: path.resolve(process.cwd(), ".env.test") });

// Verify critical environment variables are loaded
const requiredEnvVars = [
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "AUTH_USER_EMAIL",
  "AUTH_USER_PASSWORD_HASH",
  "GOOGLE_PROJECT_ID",
  "GOOGLE_LOCATION",
  "GOOGLE_VERTEX_AI_MODEL_ID",
  "NEXT_PUBLIC_TEST_EMAIL",
  "NEXT_PUBLIC_TEST_PASSWORD",
  "DISABLE_RATE_LIMIT",
  "SKIP_VERTEX_MODEL_VALIDATION",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(
    `⚠️  Warning: Missing environment variables for tests: ${missingVars.join(", ")}`
  );
  console.warn("Tests may fail. Check your .env.test file.");
}

export {};
