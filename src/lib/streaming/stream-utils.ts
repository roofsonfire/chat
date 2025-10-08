/**
 * Stream chunk types for multimodal responses
 */
export interface TextChunk {
  type: "text";
  content: string;
}

export interface ImageChunk {
  type: "image";
  mimeType: string;
  data: string;
}

export type StreamChunk = TextChunk | ImageChunk;
