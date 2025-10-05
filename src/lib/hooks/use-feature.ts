"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  isFeatureEnabled,
  getEnabledFeatures,
  type FeatureFlagKey,
  type FeatureContext,
} from "@/lib/features/flags";

/**
 * Hook to check if a feature is enabled
 *
 * Automatically includes user context from NextAuth session
 *
 * @param featureKey - The feature flag key to check
 * @param customContext - Optional custom context to override session data
 * @returns true if feature is enabled
 *
 * @example
 * ```tsx
 * const NewFeature = () => {
 *   const enabled = useFeature('new-chat-ui');
 *
 *   if (!enabled) {
 *     return <OldUI />;
 *   }
 *
 *   return <NewUI />;
 * };
 * ```
 */
export function useFeature(
  featureKey: FeatureFlagKey,
  customContext?: Partial<FeatureContext>
): boolean {
  const { data: session } = useSession();
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    const context: FeatureContext = {
      userId: session?.user?.email || customContext?.userId,
      userRole: customContext?.userRole,
      userSegment: customContext?.userSegment,
      environment: customContext?.environment,
    };

    const result = isFeatureEnabled(featureKey, context);
    setEnabled(result);
  }, [featureKey, session, customContext]);

  return enabled;
}

/**
 * Hook to get all enabled features for current user
 *
 * @param customContext - Optional custom context to override session data
 * @returns Array of enabled feature keys
 *
 * @example
 * ```tsx
 * const FeatureList = () => {
 *   const features = useFeatures();
 *
 *   return (
 *     <ul>
 *       {features.map(key => (
 *         <li key={key}>{key}</li>
 *       ))}
 *     </ul>
 *   );
 * };
 * ```
 */
export function useFeatures(
  customContext?: Partial<FeatureContext>
): FeatureFlagKey[] {
  const { data: session } = useSession();
  const [features, setFeatures] = useState<FeatureFlagKey[]>([]);

  useEffect(() => {
    const context: FeatureContext = {
      userId: session?.user?.email || customContext?.userId,
      userRole: customContext?.userRole,
      userSegment: customContext?.userSegment,
      environment: customContext?.environment,
    };

    const result = getEnabledFeatures(context);
    setFeatures(result);
  }, [session, customContext]);

  return features;
}
