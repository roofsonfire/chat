import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/lib/services/chat-service";
import { chatRequestSchema } from "@/lib/validation/chat-schema";
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
  const requestId = Math.random().toString(36).substring(7);

  try {
    logger.info("Chat API request received", { requestId });

    const body = await req.json();
    logger.debug("Request body received", {
      requestId,
      hasMessages: !!body.messages,
      messageCount: body.messages?.length,
      hasModelId: !!body.modelId,
    });

    const parsedBody = chatRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      logger.warn("Invalid chat request", {
        requestId,
        errors: parsedBody.error.issues,
      });

      const errorResponse: ChatErrorResponse = {
        error: "Invalid request body",
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { messages, modelId } = parsedBody.data;

    logger.info("Processing validated chat request", {
      requestId,
      messageCount: messages.length,
      modelId: modelId || "default",
      hasImages: messages.some((m) => m.image),
    });

    const chatService = new ChatService();

    logger.debug("Starting stream generation", { requestId });
    const readableStream = await chatService.streamToReadable(
      messages,
      modelId
    );

    logger.info("Returning streaming response", { requestId });
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    logger.error("Error in chat API", {
      error,
      requestId,
      errorName: error instanceof Error ? error.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    const errorResponse: ChatErrorResponse = {
      error: "Internal server error",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
