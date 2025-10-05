import { NextRequest, NextResponse } from "next/server";
import { ChatService } from "@/lib/services/chat-service";
import { chatRequestSchema } from "@/lib/validation/chat-schema";
import { toReadableStream } from "@/lib/streaming/stream-utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const parsedBody = chatRequestSchema.safeParse(await req.json());

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { messages } = parsedBody.data;
    const chatService = new ChatService();
    const stream = await chatService.stream(messages);

    const readableStream = toReadableStream(stream);

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
