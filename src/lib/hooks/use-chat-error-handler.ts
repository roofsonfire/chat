import { Message } from "@/lib/types";
import { logger } from "../logger";

export function useChatErrorHandler() {
  const handleChatError = (
    error: unknown,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  ) => {
    logger.error("Error fetching chat response", { error });

    // Add error message to chat for user feedback
    const errorMessage: Message = {
      role: "assistant",
      content:
        "Sorry, I encountered an error processing your request. Please try again.",
    };

    setMessages((prev) => [...prev, errorMessage]);
  };

  return {
    handleChatError,
  };
}
