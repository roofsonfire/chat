/**
 * Chat-related constants
 */

/**
 * Default suggested prompts for empty state
 */
export const DEFAULT_PROMPTS = [
  "Explain quantum computing in simple terms",
  "Write a creative story about a robot",
  "Help me debug this TypeScript code",
  "Suggest ideas for a mobile app",
] as const;

/**
 * Type for suggested prompts
 */
export type SuggestedPrompt = (typeof DEFAULT_PROMPTS)[number];
