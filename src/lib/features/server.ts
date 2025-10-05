/**
 * Server-side feature flag utilities
 *
 * Use these functions in API routes, server components, and server actions
 * to check feature flags without client-side hooks
 *
 * @example
 * ```typescript
 * // In an API route
 * export async function GET(request: Request) {
 *   const session = await getServerSession(authOptions);
 *   const context = getContextFromSession(session);
 *
 *   if (isFeatureEnabled('advanced-ai-model', context)) {
 *     // Use advanced model
 *   }
 * }
 * ```
 */

import { Session } from "next-auth";
import {
  isFeatureEnabled as checkFeature,
  getEnabledFeatures as getFeatures,
  type FeatureContext,
  type FeatureFlagKey,
} from "@/lib/features/flags";

/**
 * Extract feature context from NextAuth session
 *
 * @param session - NextAuth session object
 * @returns FeatureContext for use with feature flag functions
 */
export function getContextFromSession(session: Session | null): FeatureContext {
  return {
    userId: session?.user?.email || undefined,
    // Add role/segment extraction if you extend session type
    // userRole: session?.user?.role,
    // userSegment: session?.user?.segment,
  };
}

/**
 * Server-side feature flag check
 *
 * @param featureKey - Feature flag to check
 * @param session - NextAuth session (optional)
 * @param customContext - Custom context to override session data
 * @returns true if feature is enabled
 *
 * @example
 * ```typescript
 * import { isFeatureEnabledServer } from '@/lib/features/server';
 * import { getServerSession } from 'next-auth';
 *
 * export async function GET() {
 *   const session = await getServerSession(authOptions);
 *
 *   if (isFeatureEnabledServer('admin-panel', session)) {
 *     // Return admin data
 *   }
 * }
 * ```
 */
export function isFeatureEnabledServer(
  featureKey: FeatureFlagKey,
  session?: Session | null,
  customContext?: Partial<FeatureContext>
): boolean {
  const context: FeatureContext = {
    ...getContextFromSession(session || null),
    ...customContext,
  };

  return checkFeature(featureKey, context);
}

/**
 * Get all enabled features for server context
 *
 * @param session - NextAuth session (optional)
 * @param customContext - Custom context to override session data
 * @returns Array of enabled feature keys
 *
 * @example
 * ```typescript
 * const enabledFeatures = getEnabledFeaturesServer(session);
 * return Response.json({ features: enabledFeatures });
 * ```
 */
export function getEnabledFeaturesServer(
  session?: Session | null,
  customContext?: Partial<FeatureContext>
): FeatureFlagKey[] {
  const context: FeatureContext = {
    ...getContextFromSession(session || null),
    ...customContext,
  };

  return getFeatures(context);
}
