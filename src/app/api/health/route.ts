import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";

/**
 * Basic health check endpoint for container orchestration (Cloud Run, Kubernetes)
 * Returns 200 OK if the application is running and can accept traffic
 *
 * This is a lightweight check used by load balancers and orchestrators
 * to determine if the instance should receive traffic.
 *
 * @returns 200 OK with basic status
 */
export async function GET(): Promise<NextResponse> {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "chat-app",
      version: process.env.npm_package_version || "unknown",
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    logger.error("Health check failed", { error });

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 503 }
    );
  }
}

// Disable caching for health checks
export const dynamic = "force-dynamic";
export const revalidate = 0;
