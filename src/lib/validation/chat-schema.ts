import { z } from "zod";

/**
 * Validation schema for chat API requests.
 * Ensures messages have proper structure and reasonable constraints.
 */
export const chatRequestSchema = z.object({
  messages: z
    .array(
      z
        .object({
          role: z.enum(["user", "assistant"]),
          content: z.string().max(10000, "Message content is too long"),
          image: z.string().optional(),
        })
        .refine((data) => data.content.trim().length > 0 || data.image, {
          message: "Message must contain either text content or an image",
          path: ["content"],
        })
    )
    .min(1, "At least one message is required")
    .max(100, "Too many messages in conversation"),
  modelId: z
    .string()
    .regex(/^gemini-[\w.-]+$/, "Invalid model ID format")
    .optional(),
});
