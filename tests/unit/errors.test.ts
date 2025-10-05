import { describe, it, expect } from "vitest";
import { AppError, VertexAIError } from "@/lib/errors";

describe("Custom Errors", () => {
  describe("AppError", () => {
    it("should create error with message and status code", () => {
      const error = new AppError("Test error", 400);

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(400);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it("should have correct prototype", () => {
      const error = new AppError("Test", 500);

      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
    });

    it("should preserve stack trace", () => {
      const error = new AppError("Test", 500);

      expect(error.stack).toBeDefined();
    });
  });

  describe("VertexAIError", () => {
    it("should create error with default message", () => {
      const error = new VertexAIError();

      expect(error.message).toBe(
        "An unexpected error occurred with the Vertex AI service."
      );
      expect(error.statusCode).toBe(500);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(VertexAIError);
    });

    it("should create error with custom message", () => {
      const customMessage = "Custom AI error message";
      const error = new VertexAIError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.statusCode).toBe(500);
    });

    it("should have correct prototype chain", () => {
      const error = new VertexAIError();

      expect(Object.getPrototypeOf(error)).toBe(VertexAIError.prototype);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(VertexAIError);
    });
  });
});
