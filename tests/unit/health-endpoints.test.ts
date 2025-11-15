import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextResponse } from "next/server";

import { GET as healthCheck } from "@/app/api/health/route";
import { GET as readinessCheck } from "@/app/api/health/ready/route";

describe("Health Check Endpoints", () => {
  describe("GET /api/health (Liveness Probe)", () => {
    it("should return 200 OK with health status", async () => {
      const response = await healthCheck();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        status: "healthy",
        service: "chat-app",
      });
      expect(data.timestamp).toBeDefined();
      expect(new Date(data.timestamp)).toBeInstanceOf(Date);
    });

    it("should include service metadata", async () => {
      const response = await healthCheck();
      const data = await response.json();

      expect(data.service).toBe("chat-app");
      expect(data.version).toBeDefined();
    });

    it("should return valid JSON", async () => {
      const response = await healthCheck();
      const contentType = response.headers.get("content-type");

      expect(contentType).toContain("application/json");
      await expect(response.json()).resolves.toBeDefined();
    });

    it("should not cache responses", async () => {
      const response1 = await healthCheck();
      const data1 = await response1.json();

      // Wait a tiny bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      const response2 = await healthCheck();
      const data2 = await response2.json();

      // Timestamps should be different (not cached)
      expect(data1.timestamp).not.toBe(data2.timestamp);
    });

    it("should handle errors gracefully", async () => {
      // Mock NextResponse.json to throw
      const originalJson = NextResponse.json;
      vi.spyOn(NextResponse, "json").mockImplementationOnce(() => {
        throw new Error("JSON serialization error");
      });

      const response = await healthCheck();

      expect(response.status).toBe(503);

      // Restore
      NextResponse.json = originalJson;
    });
  });

  describe("GET /api/health/ready (Readiness Probe)", () => {
    beforeEach(() => {
      // Reset environment for each test
      vi.resetModules();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return 200 OK when all checks pass", async () => {
      const response = await readinessCheck();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ready).toBe(true);
      expect(data.checks).toBeDefined();
    });

    it("should include all health checks", async () => {
      const response = await readinessCheck();
      const data = await response.json();

      expect(data.checks).toHaveProperty("environment");
      expect(data.checks).toHaveProperty("vertexAI");
      expect(data.checks).toHaveProperty("memory");
    });

    it("should validate environment variables", async () => {
      const response = await readinessCheck();
      const data = await response.json();

      expect(data.checks.environment).toBe(true);
    });

    it("should check Vertex AI initialization", async () => {
      const response = await readinessCheck();
      const data = await response.json();

      expect(data.checks.vertexAI).toBe(true);
    });

    it("should monitor memory usage", async () => {
      const response = await readinessCheck();
      const data = await response.json();

      expect(data.checks.memory).toBe(true);
    });

    it("should return 503 if any check fails", async () => {
      // Mock process.memoryUsage to simulate high memory
      const originalMemoryUsage = process.memoryUsage;
      vi.spyOn(process, "memoryUsage").mockReturnValue({
        rss: 600 * 1024 * 1024, // 600MB
        heapTotal: 500 * 1024 * 1024,
        heapUsed: 450 * 1024 * 1024, // 450MB > 400MB threshold
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024,
      });

      const response = await readinessCheck();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.ready).toBe(false);
      expect(data.checks.memory).toBe(false);
      expect(data.errors).toContain("High memory usage: 450.00MB");

      // Restore
      process.memoryUsage = originalMemoryUsage;
    });

    it("should include error details when checks fail", async () => {
      // Mock process.memoryUsage to fail
      const originalMemoryUsage = process.memoryUsage;
      vi.spyOn(process, "memoryUsage").mockReturnValue({
        rss: 600 * 1024 * 1024,
        heapTotal: 500 * 1024 * 1024,
        heapUsed: 450 * 1024 * 1024, // High memory
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024,
      });

      const response = await readinessCheck();
      const data = await response.json();

      expect(data.errors).toBeDefined();
      expect(data.errors.length).toBeGreaterThan(0);

      // Restore
      process.memoryUsage = originalMemoryUsage;
    });

    it("should include timestamp", async () => {
      const response = await readinessCheck();
      const data = await response.json();

      expect(data.timestamp).toBeDefined();
      expect(new Date(data.timestamp)).toBeInstanceOf(Date);
    });

    it("should include service metadata", async () => {
      const response = await readinessCheck();
      const data = await response.json();

      expect(data.service).toBe("chat-app");
      expect(data.version).toBeDefined();
    });

    it("should not cache responses", async () => {
      const response1 = await readinessCheck();
      const data1 = await response1.json();

      await new Promise((resolve) => setTimeout(resolve, 10));

      const response2 = await readinessCheck();
      const data2 = await response2.json();

      expect(data1.timestamp).not.toBe(data2.timestamp);
    });

    it("should handle unexpected errors gracefully", async () => {
      // Mock NextResponse.json to throw on first call only
      const originalJson = NextResponse.json;
      let callCount = 0;
      vi.spyOn(NextResponse, "json").mockImplementation((...args) => {
        callCount++;
        if (callCount === 1) {
          throw new Error("Unexpected error");
        }
        return originalJson(...args);
      });

      const response = await readinessCheck();

      expect(response.status).toBe(503);

      // Restore
      NextResponse.json = originalJson;
    });

    it("should return valid JSON even on failure", async () => {
      // Force a check to fail
      const originalMemoryUsage = process.memoryUsage;
      vi.spyOn(process, "memoryUsage").mockReturnValue({
        rss: 600 * 1024 * 1024,
        heapTotal: 500 * 1024 * 1024,
        heapUsed: 450 * 1024 * 1024, // High memory
        external: 10 * 1024 * 1024,
        arrayBuffers: 5 * 1024 * 1024,
      });

      const response = await readinessCheck();
      const contentType = response.headers.get("content-type");

      expect(contentType).toContain("application/json");
      await expect(response.json()).resolves.toBeDefined();

      // Restore
      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe("Health Endpoints Integration", () => {
    it("should have both liveness and readiness endpoints", async () => {
      const healthResponse = await healthCheck();
      const readyResponse = await readinessCheck();

      expect(healthResponse).toBeDefined();
      expect(readyResponse).toBeDefined();
    });

    it("should return different information levels", async () => {
      const healthResponse = await healthCheck();
      const healthData = await healthResponse.json();

      const readyResponse = await readinessCheck();
      const readyData = await readyResponse.json();

      // Health is basic
      expect(Object.keys(healthData).length).toBeLessThan(
        Object.keys(readyData).length
      );

      // Readiness has checks
      expect(readyData.checks).toBeDefined();
      expect(healthData.checks).toBeUndefined();
    });

    it("should both be fast to execute", async () => {
      const healthStart = Date.now();
      await healthCheck();
      const healthDuration = Date.now() - healthStart;

      const readyStart = Date.now();
      await readinessCheck();
      const readyDuration = Date.now() - readyStart;

      // Health should be faster (basic check)
      expect(healthDuration).toBeLessThan(100);

      // Readiness can be slower but still reasonable
      expect(readyDuration).toBeLessThan(500);
    });
  });

  describe("Cloud Run Compatibility", () => {
    it("should work without authentication", async () => {
      // Health endpoints should not require auth (used by orchestrator)
      const healthResponse = await healthCheck();
      const readyResponse = await readinessCheck();

      expect(healthResponse.status).not.toBe(401);
      expect(readyResponse.status).not.toBe(401);
    });

    it("should return appropriate status codes for Cloud Run", async () => {
      // Cloud Run expects 200 for healthy, 503 for unhealthy
      const healthResponse = await healthCheck();

      expect([200, 503]).toContain(healthResponse.status);
    });

    it("should include all required metadata for monitoring", async () => {
      const response = await readinessCheck();
      const data = await response.json();

      // Useful for Cloud Run logs and monitoring
      expect(data.timestamp).toBeDefined();
      expect(data.service).toBeDefined();
      expect(data.version).toBeDefined();
    });
  });
});
