import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("Password Utilities", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it("should generate different hashes for same password", async () => {
      const password = "testpassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty strings", async () => {
      const hash = await hashPassword("");
      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should handle special characters", async () => {
      const password = "p@$$w0rd!#%&*()";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(20);
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testpassword123";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword("wrongpassword", hash);
      expect(isValid).toBe(false);
    });

    it("should reject password with different casing", async () => {
      const password = "TestPassword123";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword("testpassword123", hash);
      expect(isValid).toBe(false);
    });

    it("should handle empty password verification", async () => {
      const hash = await hashPassword("nonempty");
      const isValid = await verifyPassword("", hash);

      expect(isValid).toBe(false);
    });

    it("should handle verification with empty hash", async () => {
      const isValid = await verifyPassword("password", "");
      expect(isValid).toBe(false);
    });
  });

  describe("Integration", () => {
    it("should complete full hash and verify cycle", async () => {
      const passwords = [
        "simple",
        "Complex!Password123",
        "🔐emoji_password",
        "very long password with many words and spaces",
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        const isValid = await verifyPassword(password, hash);
        expect(isValid).toBe(true);
      }
    });
  });
});
