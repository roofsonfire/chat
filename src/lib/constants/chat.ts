/**
 * Chat-related constants
 */

/**
 * Default suggested prompts shown in EmptyState
 * These prompts help users get started with the chat
 */
export const DEFAULT_PROMPTS = [
  "Help me write a professional email",
  "Explain quantum computing in simple terms",
  "Create a workout plan for beginners",
  "Suggest creative project ideas",
] as const;

/**
 * Type for suggested prompts
 */
export type SuggestedPrompt = (typeof DEFAULT_PROMPTS)[number];
