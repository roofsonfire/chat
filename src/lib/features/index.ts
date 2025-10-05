/**
 * Feature Flags System
 *
 * A comprehensive feature flag system for controlling feature rollouts,
 * A/B testing, and environment-specific features.
 *
 * ## Features
 * - Type-safe flag definitions
 * - Environment-based flags
 * - User-based flags (by ID or role)
 * - Percentage-based rollouts
 * - Segment-based targeting
 * - React hooks for client components
 * - Server-side utilities for API routes
 *
 * ## Usage
 *
 * ### Client Components
 * ```tsx
 * import { useFeature } from '@/lib/features';
 *
 * export function MyComponent() {
 *   const newUIEnabled = useFeature('new-chat-ui');
 *
 *   return newUIEnabled ? <NewUI /> : <OldUI />;
 * }
 * ```
 *
 * ### Server Components
 * ```tsx
 * import { isFeatureEnabled } from '@/lib/features';
 * import { getServerSession } from 'next-auth';
 *
 * export default async function Page() {
 *   const session = await getServerSession();
 *   const enabled = isFeatureEnabled('new-chat-ui', {
 *     userId: session?.user?.email
 *   });
 *
 *   return enabled ? <NewUI /> : <OldUI />;
 * }
 * ```
 *
 * ### API Routes
 * ```ts
 * import { isFeatureEnabledServer } from '@/lib/features';
 * import { getServerSession } from 'next-auth';
 *
 * export async function GET() {
 *   const session = await getServerSession();
 *
 *   if (isFeatureEnabledServer('admin-panel', session)) {
 *     // Return admin data
 *   }
 * }
 * ```
 */

// Core feature flag functions
export {
  isFeatureEnabled,
  getEnabledFeatures,
  getFeatureFlag,
  getAllFeatureFlags,
  FEATURE_FLAGS,
  type FeatureFlag,
  type FeatureFlagKey,
  type FeatureContext,
} from "./flags";

// Server-side utilities
export {
  isFeatureEnabledServer,
  getEnabledFeaturesServer,
  getContextFromSession,
} from "./server";

// Client-side hooks (Note: These must be imported from a "use client" component)
// export { useFeature, useFeatures } from '@/lib/hooks/use-feature';
