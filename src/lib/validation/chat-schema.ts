import { z } from "zod";

/**
 * Validation schema for chat API requests.
 * Ensures messages have proper structure and reasonable constraints.
 */
export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z
          .string()
          .min(1, "Message content cannot be empty")
          .max(10000, "Message content is too long"),
        image: z.string().optional(),
      })
    )
    .min(1, "At least one message is required")
    .max(100, "Too many messages in conversation"),
});
