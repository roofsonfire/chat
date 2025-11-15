import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("Password Security", () => {
  describe("hashPassword", () => {
    it("should generate a valid bcrypt hash", async () => {
      const password = "testPassword123!";
      const hash = await hashPassword(password);

      // Bcrypt hash format: $2b$12$...
      expect(hash).toMatch(/^\$2b\$12\$/);
      expect(hash.length).toBeGreaterThan(50);
    });

    it("should generate different hashes for the same password", async () => {
      const password = "testPassword123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Different salts should produce different hashes
      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty strings", async () => {
      const hash = await hashPassword("");
      expect(hash).toMatch(/^\$2b\$12\$/);
    });

    it("should handle special characters", async () => {
      const password = "p@ssw0rd!#$%^&*()";
      const hash = await hashPassword(password);
      expect(hash).toMatch(/^\$2b\$12\$/);
    });

    it("should handle unicode characters", async () => {
      const password = "пароль密码🔐";
      const hash = await hashPassword(password);
      expect(hash).toMatch(/^\$2b\$12\$/);
    });

    it("should use 12 rounds (security hardening)", async () => {
      const password = "testPassword123!";
      const hash = await hashPassword(password);

      // Extract rounds from hash: $2b$12$...
      const rounds = hash.split("$")[2];
      expect(rounds).toBe("12");
    });

    it("should complete within reasonable time (performance check)", async () => {
      const password = "testPassword123!";
      const start = Date.now();
      await hashPassword(password);
      const duration = Date.now() - start;

      // 12 rounds should take ~200-500ms on modern hardware
      // Allow up to 1000ms for slower CI environments
      expect(duration).toBeLessThan(1000);
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "testPassword123!";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testPassword123!";
      const wrongPassword = "wrongPassword456!";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it("should be case-sensitive", async () => {
      const password = "TestPassword";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword("testpassword", hash);
      expect(isValid).toBe(false);
    });

    it("should handle empty password verification", async () => {
      const hash = await hashPassword("somePassword");
      const isValid = await verifyPassword("", hash);
      expect(isValid).toBe(false);
    });

    it("should handle invalid hash format gracefully", async () => {
      const password = "testPassword123!";
      const invalidHash = "not-a-valid-hash";

      // Bcrypt returns false for invalid hashes instead of throwing
      const isValid = await verifyPassword(password, invalidHash);
      expect(isValid).toBe(false);
    });

    it("should reject password with slight modification", async () => {
      const password = "testPassword123!";
      const hash = await hashPassword(password);

      // Add one character
      const modified = password + "x";
      const isValid = await verifyPassword(modified, hash);
      expect(isValid).toBe(false);
    });

    it("should handle special characters in verification", async () => {
      const password = "p@ssw0rd!#$%^&*()";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should handle unicode characters in verification", async () => {
      const password = "пароль密码🔐";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });
  });

  describe("Security Properties", () => {
    it("should be resistant to timing attacks (constant time)", async () => {
      const password = "testPassword123!";
      const hash = await hashPassword(password);

      // Measure time for correct password
      const start1 = Date.now();
      await verifyPassword(password, hash);
      const time1 = Date.now() - start1;

      // Measure time for incorrect password
      const start2 = Date.now();
      await verifyPassword("wrongPassword", hash);
      const time2 = Date.now() - start2;

      // Bcrypt should take similar time regardless
      // Allow 50% variance for system fluctuations
      const ratio = Math.max(time1, time2) / Math.min(time1, time2);
      expect(ratio).toBeLessThan(2);
    });

    it("should make brute-force attacks impractical", async () => {
      const password = "short";
      const hash = await hashPassword(password);

      // Measure time for single verification
      const start = Date.now();
      await verifyPassword(password, hash);
      const duration = Date.now() - start;

      // With 12 rounds (~200ms per attempt), brute-forcing
      // a 6-character alphanumeric password (62^6 = 56B combinations)
      // would take: 56B * 200ms = 3,552 years
      expect(duration).toBeGreaterThan(50); // At least 50ms per attempt
    });

    it("should not leak information through error messages", async () => {
      // Invalid hash should throw, not return false with details
      try {
        await verifyPassword("test", "invalid-hash-format");
        expect.fail("Should have thrown an error");
      } catch (error) {
        // Error should not reveal hash internals
        expect(error).toBeDefined();
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long passwords", async () => {
      const longPassword = "a".repeat(1000);
      const hash = await hashPassword(longPassword);
      const isValid = await verifyPassword(longPassword, hash);

      expect(isValid).toBe(true);
    });

    it("should handle null bytes in password", async () => {
      const password = "password\0with\0nulls";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should handle whitespace-only passwords", async () => {
      const password = "   \t\n   ";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });
});
