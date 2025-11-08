import { z } from "zod";

const BASE64_IMAGE_PATTERN =
  /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/;
const MAX_BASE64_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

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
          content: z
            .string()
            .max(10000, "Message content is too long")
            .optional()
            .default(""),
          image: z
            .string()
            .regex(BASE64_IMAGE_PATTERN, {
              message:
                "Image must be a base64-encoded data URL with an allowed MIME type",
            })
            .refine((value) => {
              const matches = value.match(BASE64_IMAGE_PATTERN);
              if (!matches || matches.length < 3) {
                return false;
              }
              const data = matches[2] ?? "";
              if (!data) {
                return false;
              }
              const estimatedBytes = Math.ceil((data.length * 3) / 4);
              return estimatedBytes <= MAX_BASE64_IMAGE_BYTES;
            }, "Image exceeds maximum allowed size of 5MB")
            .optional(),
          timestamp: z
            .union([z.date(), z.string()])
            .optional()
            .transform((val) =>
              val ? (typeof val === "string" ? new Date(val) : val) : new Date()
            ),
        })
        .refine(
          (data) => {
            // User messages must have content or image
            if (data.role === "user") {
              return data.content.trim().length > 0 || data.image;
            }
            // Assistant messages can have empty content (they may contain generated images)
            return true;
          },
          {
            message:
              "User messages must contain either text content or an image",
            path: ["content"],
          }
        )
    )
    .min(1, "At least one message is required")
    .max(100, "Too many messages in conversation"),
  modelId: z
    .string()
    .regex(/^gemini-[\w.-]+$/, "Invalid model ID format")
    .optional(),
});
