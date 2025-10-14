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
 * Base message interface with common properties
 */
export interface BaseMessage {
  /** The role of the message sender (user or AI assistant) */
  role: "user" | "assistant";
  /** The text content of the message */
  content: string;
}

/**
 * User message with optional image upload
 */
export interface UserMessage extends BaseMessage {
  role: "user";
  /** Optional base64-encoded image data URL (for user uploads) */
  image?: string;
}

/**
 * Assistant message with optional generated images
 */
export interface AssistantMessage extends BaseMessage {
  role: "assistant";
  /** Optional array of AI-generated images (for assistant responses) */
  generatedImages?: GeneratedImage[];
}

/**
 * Union type for all message types
 */
export type Message = UserMessage | AssistantMessage;

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
  /** Optional detailed validation errors */
  details?: Array<{
    path: string;
    message: string;
    code: string;
  }>;
}
