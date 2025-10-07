import { useState } from "react";
import { Message, GeneratedImage } from "@/lib/types";
import { logger } from "../logger";
import { DEFAULT_MODEL_ID } from "@/lib/constants/vertex-ai-models";
import type { StreamChunk } from "@/lib/streaming/stream-utils";
import { retryWithBackoff } from "@/lib/utils/retry-utils";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input && !image) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      ...(image && { image }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setImage(null);
    setIsLoading(true);

    try {
      const response = await retryWithBackoff(
        async () => {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [...messages, userMessage],
              modelId: selectedModel,
            }),
          });

          // Check for rate limit and throw error to trigger retry
          if (res.status === 429) {
            const errorData = await res.json();
            throw new Error(`Rate limit exceeded: ${errorData.error}`);
          }

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(
              `HTTP ${res.status}: ${errorData.error || "Unknown error"}`
            );
          }

          return res;
        },
        {
          maxRetries: 2,
          baseDelay: 2000, // Start with 2 seconds for rate limits
          maxDelay: 8000, // Max 8 seconds
        }
      );

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
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
    } catch (error) {
      logger.error("Error fetching chat response", { error });

      // Add error message to chat for user feedback
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setImage,
    selectedModel,
    setSelectedModel,
  };
}
