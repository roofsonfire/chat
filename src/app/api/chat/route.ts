import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/lib/services/chat-service";
import { chatRequestSchema } from "@/lib/validation/chat-schema";
import { toReadableStream } from "@/lib/streaming/stream-utils";
import { logger } from "@/lib/logger";
import type { ChatErrorResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/chat - Stream AI responses for chat messages
 *
 * @param req - Next.js request object containing chat messages
 * @returns Streaming response with AI-generated text or error response
 */
export async function POST(req: NextRequest) {
  try {
    const parsedBody = chatRequestSchema.safeParse(await req.json());

    if (!parsedBody.success) {
      logger.warn("Invalid chat request", {
        errors: parsedBody.error.issues,
      });

      const errorResponse: ChatErrorResponse = {
        error: "Invalid request body",
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { messages } = parsedBody.data;
    const chatService = new ChatService();
    const stream = await chatService.stream(messages);

    const readableStream = toReadableStream(stream);

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    logger.error("Error in chat API", { error });

    const errorResponse: ChatErrorResponse = {
      error: "Internal server error",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
