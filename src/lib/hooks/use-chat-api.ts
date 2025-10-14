import { Message } from "@/lib/types";
import { retryWithBackoff } from "@/lib/utils/retry-utils";

export function useChatAPI() {
  const sendChatRequest = async (messages: Message[], modelId: string) => {
    const response = await retryWithBackoff(
      async () => {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            modelId,
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

    return response;
  };

  return {
    sendChatRequest,
  };
}
