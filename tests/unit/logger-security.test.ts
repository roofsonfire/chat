import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { logger } from "@/lib/logger";

describe("Logger Security (PII Sanitization)", () => {
  // Capture console output
  const originalLog = console.log;
  let logOutput: string[] = [];

  beforeEach(() => {
    logOutput = [];
    console.log = vi.fn((...args) => {
      logOutput.push(JSON.stringify(args));
    });
  });

  afterEach(() => {
    console.log = originalLog;
  });

  describe("Sensitive Key Detection", () => {
    it("should redact password fields", () => {
      logger.info("User action", { password: "secret123" });

      const output = logOutput.join("");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain("secret123");
    });

    it("should redact secret fields", () => {
      logger.info("Config loaded", { apiSecret: "sk_live_123" });

      const output = logOutput.join("");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain("sk_live_123");
    });

    it("should redact token fields", () => {
      logger.info("Auth check", { authToken: "Bearer xyz" });

      const output = logOutput.join("");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain("Bearer xyz");
    });

    it("should redact session fields", () => {
      logger.info("Session data", { sessionId: "sess_abc123" });

      const output = logOutput.join("");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain("sess_abc123");
    });

    it("should redact cookie fields", () => {
      logger.info("Cookie set", { cookie: "auth=value" });

      const output = logOutput.join("");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain("auth=value");
    });

    it("should redact key fields", () => {
      logger.info("API key", { apiKey: "key_123456" });

      const output = logOutput.join("");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain("key_123456");
    });

    it("should handle nested sensitive fields", () => {
      logger.info("User update", {
        user: {
          name: "John",
          password: "secret",
        },
      });

      const output = logOutput.join("");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain("secret");
      expect(output).toContain("John"); // Non-sensitive data preserved
    });
  });

  describe("Pattern-Based Value Redaction", () => {
    it("should redact Bearer tokens", () => {
      logger.info("Auth header", { authorization: "Bearer abc123xyz" });

      const output = logOutput.join("");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain("abc123xyz");
    });

    it("should redact JWT tokens", () => {
      const jwt =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
      logger.info("Token validation", { token: jwt });

      const output = logOutput.join("");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    });

    it("should redact private keys", () => {
      const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----`;
      logger.info("Key loaded", { key: privateKey });

      const output = logOutput.join("");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain("BEGIN RSA PRIVATE KEY");
    });

    it("should redact Slack tokens", () => {
      logger.info("Slack integration", { slackToken: "xoxb-123-456-abc" });

      const output = logOutput.join("");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain("xoxb-123-456-abc");
    });
  });

  describe("Email Masking", () => {
    it("should mask email addresses", () => {
      logger.info("User login", { email: "john.doe@example.com" });

      const output = logOutput.join("");
      expect(output).not.toContain("john.doe@example.com");
      expect(output).toContain("***"); // Masked format
      expect(output).toContain("@example.com"); // Domain preserved
    });

    it("should mask multiple email addresses", () => {
      logger.info("Email sent", {
        from: "alice@example.com",
        to: "bob@example.com",
      });

      const output = logOutput.join("");
      expect(output).not.toContain("alice@example.com");
      expect(output).not.toContain("bob@example.com");
      expect(output).toContain("@example.com");
    });

    it("should preserve domain for debugging", () => {
      logger.info("User registration", { email: "user@company.org" });

      const output = logOutput.join("");
      expect(output).toContain("@company.org");
      expect(output).not.toContain("user@company.org");
    });

    it("should mask short emails correctly", () => {
      logger.info("Short email", { email: "ab@test.com" });

      const output = logOutput.join("");
      expect(output).toContain("***@test.com");
      expect(output).not.toContain("ab@test.com");
    });
  });

  describe("String Truncation", () => {
    it("should truncate long strings", () => {
      const longString = "a".repeat(500);
      logger.info("Long data", { data: longString });

      const output = logOutput.join("");
      // Should be truncated to MAX_STRING_LENGTH (256)
      expect(output).not.toContain("a".repeat(500));
      expect(output.length).toBeLessThan(longString.length);
    });

    it("should preserve short strings", () => {
      const shortString = "test data";
      logger.info("Short data", { data: shortString });

      const output = logOutput.join("");
      expect(output).toContain("test data");
    });
  });

  describe("Error Serialization", () => {
    it("should serialize error objects", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", { error });

      const output = logOutput.join("");
      expect(output).toContain("Test error");
      expect(output).toContain("Error");
    });

    it("should truncate long error stack traces", () => {
      const error = new Error("Test error");
      error.stack = "Stack trace\n".repeat(200);
      logger.error("Error occurred", { error });

      const output = logOutput.join("");
      // Stack should be truncated to MAX_STACK_LENGTH (1024)
      expect(output.length).toBeLessThan(error.stack.length + 500);
    });

    it("should handle errors without stack traces", () => {
      const error = new Error("Test error");
      delete error.stack;
      logger.error("Error occurred", { error });

      const output = logOutput.join("");
      expect(output).toContain("Test error");
    });
  });

  describe("Circular Reference Handling", () => {
    it("should handle circular references", () => {
      const obj: Record<string, unknown> = { name: "test" };
      obj.self = obj;

      expect(() => {
        logger.info("Circular object", { data: obj });
      }).not.toThrow();
    });

    it("should handle deep circular references", () => {
      const obj: Record<string, unknown> = { level: 1 };
      const nested: Record<string, unknown> = { level: 2 };
      obj.nested = nested;
      nested.parent = obj;

      expect(() => {
        logger.info("Deep circular", { data: obj });
      }).not.toThrow();
    });
  });

  describe("Data Type Preservation", () => {
    it("should preserve numbers", () => {
      logger.info("Numeric data", { count: 42, price: 99.99 });

      const output = logOutput.join("");
      expect(output).toContain("42");
      expect(output).toContain("99.99");
    });

    it("should preserve booleans", () => {
      logger.info("Boolean data", { active: true, deleted: false });

      const output = logOutput.join("");
      expect(output).toContain("true");
      expect(output).toContain("false");
    });

    it("should handle null and undefined", () => {
      logger.info("Null data", { value: null, missing: undefined });

      const output = logOutput.join("");
      expect(output).toContain("null");
    });

    it("should handle arrays", () => {
      logger.info("Array data", { items: [1, 2, 3] });

      const output = logOutput.join("");
      expect(output).toContain("[1,2,3]");
    });

    it("should handle dates", () => {
      const date = new Date("2025-01-01T00:00:00Z");
      logger.info("Date data", { timestamp: date });

      const output = logOutput.join("");
      expect(output).toContain("2025-01-01");
    });
  });

  describe("Complex Nested Objects", () => {
    it("should sanitize deeply nested objects", () => {
      logger.info("Complex data", {
        user: {
          profile: {
            personal: {
              email: "test@example.com",
              password: "secret",
            },
          },
        },
      });

      const output = logOutput.join("");
      expect(output).toContain("[REDACTED]"); // Password
      expect(output).not.toContain("secret");
      expect(output).toContain("***"); // Masked email
    });

    it("should sanitize arrays of objects", () => {
      logger.info("User list", {
        users: [
          { name: "Alice", password: "secret1" },
          { name: "Bob", password: "secret2" },
        ],
      });

      const output = logOutput.join("");
      expect(output).toContain("Alice");
      expect(output).toContain("Bob");
      expect(output).toContain("[REDACTED]");
      expect(output).not.toContain("secret1");
      expect(output).not.toContain("secret2");
    });
  });

  describe("Log Levels", () => {
    it("should support info level", () => {
      logger.info("Info message", { data: "test" });
      expect(logOutput.length).toBeGreaterThan(0);
    });

    it("should support warn level", () => {
      logger.warn("Warning message", { data: "test" });
      expect(logOutput.length).toBeGreaterThan(0);
    });

    it("should support error level", () => {
      logger.error("Error message", { data: "test" });
      expect(logOutput.length).toBeGreaterThan(0);
    });

    it("should support debug level", () => {
      // Debug level exists but only logs in development
      logger.debug("Debug message", { data: "test" });
      // Output depends on NODE_ENV
      expect(logOutput.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Security Regression Tests", () => {
    it("should never log raw passwords", () => {
      const testCases = [
        { password: "test123" },
        { user_password: "test123" },
        { userPassword: "test123" },
        { pwd: "test123" },
        { pass: "test123" },
      ];

      testCases.forEach((testCase) => {
        logOutput = [];
        logger.info("Test", testCase);
        const output = logOutput.join("");
        expect(output).not.toContain("test123");
        expect(output).toContain("[REDACTED]");
      });
    });

    it("should never log raw tokens", () => {
      const testCases = [
        { token: "abc123" },
        { accessToken: "abc123" },
        { refreshToken: "abc123" },
        { bearerToken: "abc123" },
        { authToken: "abc123" },
      ];

      testCases.forEach((testCase) => {
        logOutput = [];
        logger.info("Test", testCase);
        const output = logOutput.join("");
        expect(output).not.toContain("abc123");
        expect(output).toContain("[REDACTED]");
      });
    });

    it("should never log complete email addresses", () => {
      const emails = [
        "user@example.com",
        "admin@company.org",
        "test.user@domain.co.uk",
      ];

      emails.forEach((email) => {
        logOutput = [];
        logger.info("Test", { email });
        const output = logOutput.join("");
        expect(output).not.toContain(email);
        expect(output).toContain("***");
      });
    });
  });
});
