"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

/**
 * Hook to fetch available models from the API
 * Caches the result in state to avoid repeated requests
 */
export function useAvailableModels() {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/models");

        if (!response.ok) {
          throw new Error("Failed to fetch models");
        }

        const data = await response.json();

        // Transform API response to ModelOption format
        const modelOptions: ModelOption[] = data.models.map(
          (model: {
            name: string;
            displayName: string;
            description?: string;
          }) => ({
            id: model.name,
            name: model.displayName || model.name,
            description: model.description || "Vertex AI model",
          })
        );

        setModels(modelOptions);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        logger.error("Error fetching models", { error: err });
        setError(new Error(errorMessage));

        // Fallback to hardcoded models
        setModels([
          {
            id: "gemini-2.5-flash",
            name: "Gemini 2.5 Flash",
            description: "Fast and efficient model",
          },
          {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro",
            description: "Most capable model for complex tasks",
          },
          {
            id: "gemini-2.0-flash-exp",
            name: "Gemini 2.0 Flash (Experimental)",
            description: "Experimental model",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchModels();
  }, []);

  return { models, isLoading, error };
}
