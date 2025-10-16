import { Message } from "@/lib/types";

export function useChatErrorHandler() {
  const handleChatError = (
    error: unknown,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  ) => {
    // Log error details for debugging (without console noise in development)
    if (process.env.NODE_ENV === "development") {
      console.debug("Chat API Error Details:", error);
    }

    // Determine error type and provide appropriate user message
    let errorMessage =
      "Sorry, I encountered an error processing your request. Please try again.";

    if (error instanceof Error) {
      const errorString = error.message.toLowerCase();

      if (errorString.includes("rate limit") || errorString.includes("429")) {
        errorMessage =
          "I'm receiving too many requests right now. Please wait a moment and try again.";
      } else if (
        errorString.includes("network") ||
        errorString.includes("fetch")
      ) {
        errorMessage =
          "There seems to be a connection issue. Please check your internet connection and try again.";
      } else if (
        errorString.includes("unauthorized") ||
        errorString.includes("403")
      ) {
        errorMessage =
          "There appears to be an authentication issue. Please refresh the page and try again.";
      } else if (errorString.includes("timeout")) {
        errorMessage = "The request timed out. Please try again.";
      }
    }

    // Add error message to chat for user feedback
    const errorMessageObj: Message = {
      role: "assistant",
      content: errorMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, errorMessageObj]);
  };

  return {
    handleChatError,
  };
}
