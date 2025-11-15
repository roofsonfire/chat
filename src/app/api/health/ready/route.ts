import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

/**
 * Readiness probe endpoint for container orchestration
 * Performs deeper health checks including external dependencies
 *
 * This endpoint verifies:
 * - Application is running
 * - Environment variables are configured
 * - Vertex AI can be initialized (doesn't actually call API)
 *
 * Used by load balancers to determine if instance can handle traffic.
 * More comprehensive than /api/health (liveness probe).
 *
 * @returns 200 OK if ready, 503 Service Unavailable if not ready
 */
export async function GET(): Promise<NextResponse> {
  const checks: Record<string, boolean> = {};
  const errors: string[] = [];

  try {
    // Check 1: Environment variables
    try {
      checks.environment = !!(
        env.GOOGLE_PROJECT_ID &&
        env.GOOGLE_LOCATION &&
        env.NEXTAUTH_SECRET
      );

      if (!checks.environment) {
        errors.push("Missing required environment variables");
      }
    } catch (error) {
      checks.environment = false;
      errors.push("Environment validation failed");
      logger.error("Environment check failed", { error });
    }

    // Check 2: Vertex AI initialization (doesn't make API call)
    try {
      const vertexAI = new VertexAI({
        project: env.GOOGLE_PROJECT_ID,
        location: env.GOOGLE_LOCATION,
      });

      checks.vertexAI = !!vertexAI;
    } catch (error) {
      checks.vertexAI = false;
      errors.push("Vertex AI initialization failed");
      logger.error("Vertex AI check failed", { error });
    }

    // Check 3: Node.js process health
    try {
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;

      // Flag if memory usage exceeds 400MB (Cloud Run default is 512MB)
      checks.memory = memoryUsageMB < 400;

      if (!checks.memory) {
        errors.push(`High memory usage: ${memoryUsageMB.toFixed(2)}MB`);
      }
    } catch (error) {
      checks.memory = false;
      errors.push("Memory check failed");
      logger.error("Memory check failed", { error });
    }

    // Determine overall readiness
    const isReady = Object.values(checks).every((check) => check === true);

    const response = {
      ready: isReady,
      checks,
      timestamp: new Date().toISOString(),
      service: "chat-app",
      version: process.env.npm_package_version || "unknown",
      ...(errors.length > 0 && { errors }),
    };

    if (isReady) {
      return NextResponse.json(response, { status: 200 });
    } else {
      logger.warn("Readiness check failed", { checks, errors });
      return NextResponse.json(response, { status: 503 });
    }
  } catch (error) {
    logger.error("Readiness check error", { error });

    return NextResponse.json(
      {
        ready: false,
        timestamp: new Date().toISOString(),
        error: "Readiness check failed unexpectedly",
      },
      { status: 503 }
    );
  }
}

// Disable caching for readiness checks
export const dynamic = "force-dynamic";
export const revalidate = 0;
