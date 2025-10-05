/**
 * Feature Flags System
 *
 * Provides a type-safe feature flag system supporting:
 * - Simple boolean flags
 * - Environment-based flags
 * - User-based flags (by user ID or role)
 * - Percentage-based rollouts
 * - A/B testing support
 *
 * @example
 * ```typescript
 * // Check a feature flag
 * if (isFeatureEnabled('new-ui', { userId: '123' })) {
 *   // Show new UI
 * }
 *
 * // Use in React component
 * const Feature = () => {
 *   const enabled = useFeature('new-ui');
 *   return enabled ? <NewUI /> : <OldUI />;
 * };
 * ```
 */

import { logger } from "@/lib/logger";

/**
 * Feature flag definition
 */
export interface FeatureFlag {
  /** Unique feature identifier */
  key: string;
  /** Human-readable name */
  name: string;
  /** Description of what this feature does */
  description: string;
  /** Default enabled state */
  enabled: boolean;
  /** Optional: Enable only in specific environments */
  environments?: ("development" | "production" | "test")[];
  /** Optional: Enable for specific user IDs */
  allowedUsers?: string[];
  /** Optional: Enable for users with specific roles */
  allowedRoles?: string[];
  /** Optional: Enable for a percentage of users (0-100) */
  rolloutPercentage?: number;
  /** Optional: Restrict to specific user segments */
  segment?: string;
}

/**
 * Context for feature flag evaluation
 */
export interface FeatureContext {
  /** User ID for user-specific flags */
  userId?: string;
  /** User role for role-based flags */
  userRole?: string;
  /** User segment for segment-based flags */
  userSegment?: string;
  /** Environment override (defaults to NODE_ENV) */
  environment?: "development" | "production" | "test";
}

/**
 * All available feature flags
 */
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // UI Features
  "new-chat-ui": {
    key: "new-chat-ui",
    name: "New Chat UI",
    description: "New redesigned chat interface with improved UX",
    enabled: false,
    environments: ["development"],
    rolloutPercentage: 0,
  },

  "dark-mode": {
    key: "dark-mode",
    name: "Dark Mode",
    description: "Dark theme support",
    enabled: true,
    environments: ["development", "production"],
  },

  // Performance Features
  "performance-monitoring": {
    key: "performance-monitoring",
    name: "Performance Monitoring",
    description: "Core Web Vitals and custom performance tracking",
    enabled: true,
    environments: ["production"],
  },

  "lazy-loading": {
    key: "lazy-loading",
    name: "Lazy Loading",
    description: "Lazy load chat messages and components",
    enabled: true,
  },

  // AI Features
  "streaming-responses": {
    key: "streaming-responses",
    name: "Streaming Responses",
    description: "Stream AI responses token by token",
    enabled: true,
  },

  "multimodal-input": {
    key: "multimodal-input",
    name: "Multimodal Input",
    description: "Support for image uploads in chat",
    enabled: true,
  },

  "advanced-ai-model": {
    key: "advanced-ai-model",
    name: "Advanced AI Model",
    description: "Use more advanced AI model (higher cost)",
    enabled: false,
    rolloutPercentage: 10,
    segment: "premium",
  },

  // Experimental Features
  "voice-input": {
    key: "voice-input",
    name: "Voice Input",
    description: "Voice-to-text input for chat messages",
    enabled: false,
    environments: ["development"],
  },

  "chat-history-export": {
    key: "chat-history-export",
    name: "Chat History Export",
    description: "Export chat conversations to various formats",
    enabled: false,
    rolloutPercentage: 25,
  },

  // Admin Features
  "admin-panel": {
    key: "admin-panel",
    name: "Admin Panel",
    description: "Administrative dashboard and controls",
    enabled: false,
    allowedRoles: ["admin"],
  },

  "user-analytics": {
    key: "user-analytics",
    name: "User Analytics",
    description: "Track user behavior and usage patterns",
    enabled: true,
    environments: ["production"],
  },
} as const;

/**
 * Feature flag keys type
 */
export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/**
 * Hash function for consistent percentage-based rollouts
 * Uses a simple hash of userId + featureKey to determine if user is in rollout
 */
function hashUserForRollout(userId: string, featureKey: string): number {
  let hash = 0;
  const str = `${userId}-${featureKey}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100;
}

/**
 * Check if a feature is enabled for the given context
 *
 * @param featureKey - The feature flag key to check
 * @param context - Optional context for evaluation (user ID, role, environment)
 * @returns true if the feature is enabled, false otherwise
 *
 * @example
 * ```typescript
 * // Simple check
 * if (isFeatureEnabled('dark-mode')) {
 *   // Enable dark mode
 * }
 *
 * // Check with user context
 * if (isFeatureEnabled('advanced-ai-model', { userId: '123', userRole: 'premium' })) {
 *   // Use advanced model
 * }
 * ```
 */
export function isFeatureEnabled(
  featureKey: FeatureFlagKey,
  context?: FeatureContext
): boolean {
  const flag = FEATURE_FLAGS[featureKey];

  if (!flag) {
    logger.warn(`Feature flag not found: ${featureKey}`);
    return false;
  }

  // Check base enabled state
  if (!flag.enabled) {
    return false;
  }

  // Check environment
  if (flag.environments && flag.environments.length > 0) {
    const currentEnv =
      context?.environment ||
      (process.env.NODE_ENV as "development" | "production" | "test");
    if (!flag.environments.includes(currentEnv)) {
      return false;
    }
  }

  // Check user-specific access
  if (flag.allowedUsers && flag.allowedUsers.length > 0) {
    if (!context?.userId || !flag.allowedUsers.includes(context.userId)) {
      return false;
    }
  }

  // Check role-based access
  if (flag.allowedRoles && flag.allowedRoles.length > 0) {
    if (!context?.userRole || !flag.allowedRoles.includes(context.userRole)) {
      return false;
    }
  }

  // Check segment-based access
  if (flag.segment) {
    if (context?.userSegment !== flag.segment) {
      return false;
    }
  }

  // Check percentage rollout
  if (
    flag.rolloutPercentage !== undefined &&
    flag.rolloutPercentage < 100 &&
    context?.userId
  ) {
    const userHash = hashUserForRollout(context.userId, featureKey);
    if (userHash >= flag.rolloutPercentage) {
      return false;
    }
  }

  return true;
}

/**
 * Get all enabled features for the given context
 *
 * @param context - Optional context for evaluation
 * @returns Array of enabled feature flag keys
 *
 * @example
 * ```typescript
 * const enabledFeatures = getEnabledFeatures({ userId: '123' });
 * console.log('Enabled features:', enabledFeatures);
 * ```
 */
export function getEnabledFeatures(context?: FeatureContext): FeatureFlagKey[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).filter((key) =>
    isFeatureEnabled(key, context)
  );
}

/**
 * Get feature flag details
 *
 * @param featureKey - The feature flag key
 * @returns The feature flag definition or undefined if not found
 */
export function getFeatureFlag(
  featureKey: FeatureFlagKey
): FeatureFlag | undefined {
  return FEATURE_FLAGS[featureKey];
}

/**
 * Get all feature flags
 *
 * @returns Record of all feature flags
 */
export function getAllFeatureFlags(): Record<string, FeatureFlag> {
  return FEATURE_FLAGS;
}
