/**
 * Available Google Vertex AI models for chat
 * Based on Gemini model family available in Vertex AI
 *
 * Note: Model availability depends on your Google Cloud project configuration.
 * Check Model Garden for available models in your region.
 */
export const VERTEX_AI_MODELS = {
  "gemini-2.5-flash-image": {
    id: "gemini-2.5-flash-image",
    name: "Gemini 2.5 Flash (Image Gen)",
    description: "Generate and edit images with Gemini",
    capabilities: ["text", "image-input", "image-output"],
  },
} as const;

export type VertexAIModelId = keyof typeof VERTEX_AI_MODELS;

export const DEFAULT_MODEL_ID: VertexAIModelId = "gemini-2.5-flash-image";
