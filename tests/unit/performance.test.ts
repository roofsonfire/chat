import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  initPerformanceMonitoring,
  performanceMark,
  performanceMeasure,
  trackEvent,
} from "@/lib/performance";

// Mock web-vitals
vi.mock("web-vitals", () => ({
  onCLS: vi.fn((callback) => callback),
  onFCP: vi.fn((callback) => callback),
  onINP: vi.fn((callback) => callback),
  onLCP: vi.fn((callback) => callback),
  onTTFB: vi.fn((callback) => callback),
}));

describe("Performance Monitoring", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
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

  describe("performanceMark", () => {
    it("should create a performance mark", () => {
      const markSpy = vi.spyOn(performance, "mark");

      performanceMark("test-mark");

      expect(markSpy).toHaveBeenCalledWith("test-mark");
    });

    it("should handle missing performance API", () => {
      const originalPerformance = global.performance;
      // @ts-expect-error Testing undefined scenario
      global.performance = undefined;

      expect(() => performanceMark("test-mark")).not.toThrow();

      global.performance = originalPerformance;
    });
  });

  describe("performanceMeasure", () => {
    it("should measure duration between marks", () => {
      performance.mark("start");
      performance.mark("end");

      const duration = performanceMeasure("test-measure", "start", "end");

      expect(duration).toBeGreaterThanOrEqual(0);
      expect(typeof duration).toBe("number");
    });

    it("should log measurement in development", () => {
      performance.mark("dev-start");

      const duration = performanceMeasure("dev-measure", "dev-start");

      if (duration !== null) {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining("[Performance] dev-measure")
        );
      }
    });

    it("should return null if measurement fails", () => {
      const duration = performanceMeasure(
        "invalid-measure",
        "non-existent-mark"
      );

      expect(duration).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("should handle missing performance API", () => {
      const originalPerformance = global.performance;
      // @ts-expect-error Testing undefined scenario
      global.performance = undefined;

      const duration = performanceMeasure("test", "start");

      expect(duration).toBeNull();

      global.performance = originalPerformance;
    });
  });

  describe("trackEvent", () => {
    it("should log events in development", () => {
      trackEvent("test-event", { key: "value" });

      expect(consoleLogSpy).toHaveBeenCalledWith("[Event]", "test-event", {
        key: "value",
      });
    });

    it("should track events without properties", () => {
      trackEvent("simple-event");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[Event]",
        "simple-event",
        undefined
      );
    });

    it("should handle complex event properties", () => {
      const properties = {
        string: "value",
        number: 123,
        boolean: true,
        nested: { key: "value" },
        array: [1, 2, 3],
      };

      trackEvent("complex-event", properties);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[Event]",
        "complex-event",
        properties
      );
    });
  });
});
