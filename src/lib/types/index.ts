/**
 * Represents a message in the chat conversation.
 */
export interface Message {
  /** The role of the message sender (user or AI assistant) */
  role: "user" | "assistant";
  /** The text content of the message */
  content: string;
  /** Optional base64-encoded image data URL */
  image?: string;
}

/**
 * Request payload for the chat API endpoint.
 */
export interface ChatRequest {
  /** Array of conversation messages */
  messages: Message[];
}

/**
 * Error response from the chat API.
 */
export interface ChatErrorResponse {
  /** Error message describing what went wrong */
  error: string;
}
