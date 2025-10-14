import { Message, GeneratedImage } from "@/lib/types";
import { logger } from "../logger";
import type { StreamChunk } from "@/lib/streaming/stream-utils";

export function useStreamingParser() {
  const parseStream = async (
    response: Response,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  ) => {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let assistantText = "";
    const generatedImages: GeneratedImage[] = [];
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete JSON lines (delimited by \n)
      const lines = buffer.split("\n");
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const chunk = JSON.parse(line) as StreamChunk;

          if (chunk.type === "text") {
            assistantText += chunk.content;
          } else if (chunk.type === "image") {
            generatedImages.push({
              mimeType: chunk.mimeType,
              data: chunk.data,
            });
            console.log("🖼️ Generated image received:", {
              mimeType: chunk.mimeType,
              dataLength: chunk.data.length,
              totalImages: generatedImages.length,
            });
          }
        } catch (err) {
          logger.error("Failed to parse stream chunk", { line, error: err });
        }
      }

      // Update message with accumulated text and images after processing chunks
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          const updatedMessage = {
            ...lastMessage,
            content:
              assistantText ||
              (generatedImages.length > 0
                ? "I've generated an image for you."
                : ""),
            generatedImages:
              generatedImages.length > 0 ? [...generatedImages] : undefined,
          };
          return [...prev.slice(0, -1), updatedMessage];
        }
        const newMessage: Message = {
          role: "assistant" as const,
          content:
            assistantText ||
            (generatedImages.length > 0
              ? "I've generated an image for you."
              : ""),
          generatedImages:
            generatedImages.length > 0 ? [...generatedImages] : undefined,
        };
        return [...prev, newMessage];
      });
    }

    // Final update after stream completes to ensure all data is saved
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        console.log("✅ Final message update:", {
          textLength: assistantText.length,
          imageCount: generatedImages.length,
        });
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content:
              assistantText ||
              (generatedImages.length > 0
                ? "I've generated an image for you."
                : ""),
            generatedImages:
              generatedImages.length > 0 ? [...generatedImages] : undefined,
          },
        ];
      }
      return prev;
    });
  };

  return {
    parseStream,
  };
}
