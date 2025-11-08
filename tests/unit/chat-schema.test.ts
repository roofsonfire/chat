import { describe, it, expect } from "vitest";
import { Buffer } from "node:buffer";
import type { z } from "zod";

import { chatRequestSchema } from "@/lib/validation/chat-schema";

describe("chatRequestSchema", () => {
  type ChatMessage = z.infer<typeof chatRequestSchema>["messages"][number];

  const withTimestamp = (
    message: Omit<ChatMessage, "timestamp"> &
      Partial<Pick<ChatMessage, "timestamp">>
  ): ChatMessage => ({
    timestamp: new Date(),
    ...message,
  });

  const baseMessage = withTimestamp({
    role: "user",
    content: "Hello world",
  });

  const buildPayload = (messages: ChatMessage[] = [baseMessage]) => ({
    messages,
  });

  it("accepts valid text-only payloads", () => {
    expect(() => chatRequestSchema.parse(buildPayload())).not.toThrow();
  });

  it("rejects user messages without content or image", () => {
    expect(() =>
      chatRequestSchema.parse(
        buildPayload([
          withTimestamp({
            role: "user",
            content: "   ",
          }),
        ])
      )
    ).toThrow(/must contain either text content or an image/);
  });

  it("rejects invalid base64 image data", () => {
    expect(() =>
      chatRequestSchema.parse(
        buildPayload([
          withTimestamp({
            role: "user",
            content: "",
            image: "data:image/png;base64,not-valid",
          }),
        ])
      )
    ).toThrow(/Image must be a base64-encoded data URL/);
  });

  it("accepts images up to the 5MB limit", () => {
    const bytes = Buffer.alloc(5 * 1024 * 1024 - 512, 1);
    const base64 = bytes.toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    expect(() =>
      chatRequestSchema.parse(
        buildPayload([
          withTimestamp({
            role: "user",
            content: "",
            image: dataUrl,
          }),
        ])
      )
    ).not.toThrow();
  });

  it("rejects images over the 5MB limit", () => {
    const bytes = Buffer.alloc(5 * 1024 * 1024 + 1024, 1);
    const base64 = bytes.toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;

    expect(() =>
      chatRequestSchema.parse(
        buildPayload([
          withTimestamp({
            role: "user",
            content: "",
            image: dataUrl,
          }),
        ])
      )
    ).toThrow(/Image exceeds maximum allowed size/);
  });

  it("enforces maximum conversation length", () => {
    const messages = Array.from({ length: 101 }, (_, index) =>
      withTimestamp({
        role: "user",
        content: `Message ${index}`,
      })
    );

    expect(() => chatRequestSchema.parse({ messages })).toThrow(
      /Too many messages/
    );
  });
});
