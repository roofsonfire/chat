import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { logger } from "@/lib/logger";

describe("Logger", () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("info", () => {
    it("should log info message", () => {
      logger.info("Test message");
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it("should log info message with context", () => {
      const context = { key: "value" };
      logger.info("Test message", context);
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });

  describe("warn", () => {
    it("should log warning message", () => {
      logger.warn("Warning message");
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "[WARN]",
        "Warning message",
        ""
      );
    });

    it("should log warning with context", () => {
      const context = { issue: "something" };
      logger.warn("Warning message", context);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "[WARN]",
        "Warning message",
        context
      );
    });
  });

  describe("error", () => {
    it("should log error message", () => {
      logger.error("Error message");
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[ERROR]",
        "Error message",
        ""
      );
    });

    it("should log error with context", () => {
      const context = { error: new Error("Test error") };
      logger.error("Error occurred", context);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[ERROR]",
        "Error occurred",
        context
      );
    });
  });

  describe("debug", () => {
    it("should log debug message in development", () => {
      logger.debug("Debug message");
      // Debug logs in development mode
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("[DEBUG]"),
        "Debug message",
        ""
      );
    });
  });
});
