import { NextResponse } from "next/server";
import { ModelRegistryService } from "@/lib/services/model-registry-service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// Cache duration in seconds (1 hour)
const CACHE_DURATION = 3600;

/**
 * GET /api/models - Fetch available Vertex AI models
 *
 * @returns JSON array of available models
 */
export async function GET() {
  try {
    const modelRegistry = new ModelRegistryService();
    const models = await modelRegistry.getModelsWithFallback();

    return NextResponse.json(
      { models },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
        },
      }
    );
  } catch (error) {
    logger.error("Error in models API", { error });

    return NextResponse.json(
      { error: "Failed to fetch available models" },
      { status: 500 }
    );
  }
}
