/**
 * Represents a generated image from the AI model
 */
export interface GeneratedImage {
  /** MIME type of the generated image */
  mimeType: string;
  /** Base64-encoded image data */
  data: string;
  /** Aspect ratio of the generated image */
  aspectRatio?: string;
}

/**
 * Represents a message in the chat conversation.
 */
export interface Message {
  /** The role of the message sender (user or AI assistant) */
  role: "user" | "assistant";
  /** The text content of the message */
  content: string;
  /** Optional base64-encoded image data URL (for user uploads) */
  image?: string;
  /** Optional array of AI-generated images (for assistant responses) */
  generatedImages?: GeneratedImage[];
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
