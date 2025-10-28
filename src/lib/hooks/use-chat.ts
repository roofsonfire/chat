"use client";

import { Message } from "@/lib/types";
import { useChatState } from "./use-chat-state";
import { useChatAPI } from "./use-chat-api";
import { useStreamingParser } from "./use-streaming-parser";
import { useChatErrorHandler } from "./use-chat-error-handler";
import { logger } from "@/lib/logger";

export function useChat() {
  const {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    isLoading,
    setIsLoading,
    image,
    setImage,
    selectedModel,
    setSelectedModel,
  } = useChatState();

  logger.info("useChat", { messages, input, isLoading, image, selectedModel });

  const { sendChatRequest } = useChatAPI();
  const { parseStream } = useStreamingParser();
  const { handleChatError } = useChatErrorHandler();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input && !image) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
      ...(image && { image }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setImage(null);
    setIsLoading(true);

    try {
      const response = await sendChatRequest(
        [...messages, userMessage],
        selectedModel
      );
      await parseStream(response, setMessages);
    } catch (error) {
      handleChatError(error, setMessages);
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
