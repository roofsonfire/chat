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

export const env = envSchema.parse(process.env);
