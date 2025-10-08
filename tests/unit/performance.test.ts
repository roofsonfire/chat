import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initPerformanceMonitoring } from "@/lib/performance";

// Mock web-vitals
vi.mock("web-vitals", () => ({
  onCLS: vi.fn((callback) => callback),
  onFCP: vi.fn((callback) => callback),
  onINP: vi.fn((callback) => callback),
  onLCP: vi.fn((callback) => callback),
  onTTFB: vi.fn((callback) => callback),
}));

describe("Performance Monitoring", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("initPerformanceMonitoring", () => {
    it("should initialize without errors", () => {
      expect(() => initPerformanceMonitoring()).not.toThrow();
    });

    it("should handle initialization errors gracefully", async () => {
      const { onCLS } = await import("web-vitals");
      vi.mocked(onCLS).mockImplementationOnce(() => {
        throw new Error("Init failed");
      });

      initPerformanceMonitoring();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to initialize performance monitoring:",
        expect.any(Error)
      );
    });
  });
});
