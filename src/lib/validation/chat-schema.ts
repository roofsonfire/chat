import { z } from "zod";

export const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      image: z.string().optional(),
    })
  ),
});
