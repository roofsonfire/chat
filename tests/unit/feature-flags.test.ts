import { describe, it, expect, vi } from "vitest";
import {
  isFeatureEnabled,
  getEnabledFeatures,
  getFeatureFlag,
  getAllFeatureFlags,
  FEATURE_FLAGS,
  type FeatureContext,
  type FeatureFlagKey,
  type FeatureFlag,
} from "@/lib/features/flags";

describe("Feature Flags System", () => {
  describe("isFeatureEnabled", () => {
    it("should return true for enabled flags without restrictions", () => {
      const result = isFeatureEnabled("streaming-responses");
      expect(result).toBe(true);
    });

    it("should return false for disabled flags", () => {
      const result = isFeatureEnabled("new-chat-ui");
      expect(result).toBe(false);
    });

    it("should respect environment restrictions", () => {
      // dark-mode is enabled for development and production
      const devResult = isFeatureEnabled("dark-mode", {
        environment: "development",
      });
      expect(devResult).toBe(true);

      const prodResult = isFeatureEnabled("dark-mode", {
        environment: "production",
      });
      expect(prodResult).toBe(true);

      const testResult = isFeatureEnabled("dark-mode", {
        environment: "test",
      });
      expect(testResult).toBe(false);
    });

    it("should respect user-specific restrictions", () => {
      // Create a test flag with specific users
      const testFlag: FeatureFlag = {
        key: "admin-panel",
        name: "Admin Panel",
        description: "Test",
        enabled: true,
        allowedUsers: ["user1", "user2"],
      };
      vi.spyOn(FEATURE_FLAGS, "admin-panel", "get").mockReturnValue(testFlag);

      const allowedUser = isFeatureEnabled("admin-panel", { userId: "user1" });
      expect(allowedUser).toBe(true);

      const disallowedUser = isFeatureEnabled("admin-panel", {
        userId: "user3",
      });
      expect(disallowedUser).toBe(false);

      vi.restoreAllMocks();
    });

    it("should respect role-based restrictions", () => {
      // admin-panel requires admin role
      const adminUser = isFeatureEnabled("admin-panel", { userRole: "admin" });
      expect(adminUser).toBe(false); // Flag is disabled by default

      const regularUser = isFeatureEnabled("admin-panel", { userRole: "user" });
      expect(regularUser).toBe(false);
    });

    it("should respect segment-based restrictions", () => {
      // advanced-ai-model requires premium segment
      const premiumUser = isFeatureEnabled("advanced-ai-model", {
        userId: "user1",
        userSegment: "premium",
      });
      expect(premiumUser).toBe(false); // Flag is disabled

      const regularUser = isFeatureEnabled("advanced-ai-model", {
        userId: "user1",
        userSegment: "free",
      });
      expect(regularUser).toBe(false);
    });

    it("should handle percentage rollouts consistently", () => {
      // Create a test flag with 50% rollout
      const testFlag = {
        key: "test-rollout",
        name: "Test Rollout",
        description: "Test percentage rollout",
        enabled: true,
        rolloutPercentage: 50,
      };
      vi.spyOn(FEATURE_FLAGS, "advanced-ai-model", "get").mockReturnValue(
        testFlag as FeatureFlag
      );

      // Same user should always get same result
      const result1 = isFeatureEnabled("advanced-ai-model", {
        userId: "consistent-user",
      });
      const result2 = isFeatureEnabled("advanced-ai-model", {
        userId: "consistent-user",
      });
      expect(result1).toBe(result2);

      vi.restoreAllMocks();
    });

    it("should return false for non-existent flags", () => {
      const result = isFeatureEnabled("non-existent-flag" as FeatureFlagKey);
      expect(result).toBe(false);
    });

    it("should handle missing context gracefully", () => {
      const result = isFeatureEnabled("streaming-responses");
      expect(result).toBe(true);
    });
  });

  describe("getEnabledFeatures", () => {
    it("should return all enabled features without context", () => {
      const features = getEnabledFeatures();
      expect(features).toBeInstanceOf(Array);
      expect(features.length).toBeGreaterThan(0);
      expect(features).toContain("streaming-responses");
      expect(features).toContain("multimodal-input");
    });

    it("should filter features based on environment", () => {
      const devFeatures = getEnabledFeatures({ environment: "development" });
      const prodFeatures = getEnabledFeatures({ environment: "production" });

      // Both should be arrays
      expect(devFeatures).toBeInstanceOf(Array);
      expect(prodFeatures).toBeInstanceOf(Array);

      // Production should not include development-only features
      expect(prodFeatures).not.toContain("new-chat-ui");
    });

    it("should filter features based on user role", () => {
      const adminFeatures = getEnabledFeatures({ userRole: "admin" });
      const userFeatures = getEnabledFeatures({ userRole: "user" });

      expect(adminFeatures).toBeInstanceOf(Array);
      expect(userFeatures).toBeInstanceOf(Array);
    });

    it("should return empty array if no features enabled for context", () => {
      // Use a very restrictive context
      const features = getEnabledFeatures({
        environment: "test",
        userRole: "restricted",
        userSegment: "blocked",
      });

      expect(features).toBeInstanceOf(Array);
    });
  });

  describe("getFeatureFlag", () => {
    it("should return feature flag details", () => {
      const flag = getFeatureFlag("streaming-responses");
      expect(flag).toBeDefined();
      expect(flag?.key).toBe("streaming-responses");
      expect(flag?.name).toBe("Streaming Responses");
      expect(flag?.enabled).toBe(true);
    });

    it("should return undefined for non-existent flags", () => {
      const flag = getFeatureFlag("non-existent" as FeatureFlagKey);
      expect(flag).toBeUndefined();
    });

    it("should return complete flag configuration", () => {
      const flag = getFeatureFlag("admin-panel");
      expect(flag).toBeDefined();
      expect(flag).toHaveProperty("key");
      expect(flag).toHaveProperty("name");
      expect(flag).toHaveProperty("description");
      expect(flag).toHaveProperty("enabled");
      expect(flag).toHaveProperty("allowedRoles");
    });
  });

  describe("getAllFeatureFlags", () => {
    it("should return all feature flags", () => {
      const flags = getAllFeatureFlags();
      expect(flags).toBeDefined();
      expect(typeof flags).toBe("object");
      expect(Object.keys(flags).length).toBeGreaterThan(0);
    });

    it("should include all defined flags", () => {
      const flags = getAllFeatureFlags();
      expect(flags).toHaveProperty("streaming-responses");
      expect(flags).toHaveProperty("dark-mode");
      expect(flags).toHaveProperty("admin-panel");
      expect(flags).toHaveProperty("new-chat-ui");
    });

    it("should return flags with complete configuration", () => {
      const flags = getAllFeatureFlags();
      const firstFlag = Object.values(flags)[0];

      expect(firstFlag).toHaveProperty("key");
      expect(firstFlag).toHaveProperty("name");
      expect(firstFlag).toHaveProperty("description");
      expect(firstFlag).toHaveProperty("enabled");
    });
  });

  describe("Feature Flag Integration", () => {
    it("should handle complex context with multiple conditions", () => {
      const context: FeatureContext = {
        userId: "test-user",
        userRole: "admin",
        userSegment: "premium",
        environment: "production",
      };

      const features = getEnabledFeatures(context);
      expect(features).toBeInstanceOf(Array);

      // Check each feature is actually enabled
      features.forEach((key) => {
        expect(isFeatureEnabled(key, context)).toBe(true);
      });
    });

    it("should maintain consistency between direct check and getEnabledFeatures", () => {
      const context: FeatureContext = {
        userId: "test-user",
        environment: "development",
      };

      const enabledFeatures = getEnabledFeatures(context);

      // Every feature in enabledFeatures should pass isFeatureEnabled
      enabledFeatures.forEach((key) => {
        expect(isFeatureEnabled(key, context)).toBe(true);
      });

      // Features not in enabledFeatures should fail isFeatureEnabled
      const allKeys = Object.keys(FEATURE_FLAGS);
      const disabledFeatures = allKeys.filter(
        (key) => !enabledFeatures.includes(key as FeatureFlagKey)
      );

      disabledFeatures.forEach((key) => {
        expect(isFeatureEnabled(key as FeatureFlagKey, context)).toBe(false);
      });
    });
  });
});
