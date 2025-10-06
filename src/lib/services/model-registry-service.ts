import { VertexAI } from "@google-cloud/vertexai";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export interface VertexAIModel {
  name: string;
  displayName: string;
  description?: string;
  supportedGenerationMethods?: string[];
  inputTokenLimit?: number;
  outputTokenLimit?: number;
}

/**
 * Service for managing available Vertex AI models
 *
 * Note: Vertex AI doesn't provide a public API to list all available models.
 * This service validates model availability by attempting to instantiate them.
 */
export class ModelRegistryService {
  private vertexAI: VertexAI;

  // Known Gemini models available in Vertex AI
  // Note: Model availability varies by project and region
  private readonly KNOWN_MODELS: VertexAIModel[] = [
    {
      name: "gemini-2.5-flash-image",
      displayName: "Gemini 2.5 Flash (Image Gen)",
      description: "Generate and edit images with Gemini",
      supportedGenerationMethods: ["generateContent", "streamGenerateContent"],
      inputTokenLimit: 1000000,
      outputTokenLimit: 8192,
    },
  ];

  constructor() {
    this.vertexAI = new VertexAI({
      project: env.GOOGLE_PROJECT_ID,
      location: env.GOOGLE_LOCATION,
    });
  }

  /**
   * Validate if a model is accessible in the current project/region
   * @param modelId - Model ID to validate
   * @returns true if model is accessible
   */
  private async validateModel(modelId: string): Promise<boolean> {
    try {
      // Try to instantiate the model - if it fails, the model is not available
      const model = this.vertexAI.getGenerativeModel({ model: modelId });

      // Quick validation - try to count tokens for a simple request
      await model.countTokens({
        contents: [{ role: "user", parts: [{ text: "test" }] }],
      });

      return true;
    } catch (error) {
      logger.debug(`Model ${modelId} not available`, { error });
      return false;
    }
  }

  /**
   * Fetch available models by validating known models
   * @returns Array of available models in the current region
   */
  async fetchAvailableModels(): Promise<VertexAIModel[]> {
    try {
      logger.info("Validating available Gemini models in region", {
        region: env.GOOGLE_LOCATION,
      });

      // Validate models in parallel with a timeout
      const validationPromises = this.KNOWN_MODELS.map(async (model) => {
        const isAvailable = await Promise.race([
          this.validateModel(model.name),
          new Promise<boolean>((resolve) =>
            setTimeout(() => resolve(false), 5000)
          ), // 5s timeout
        ]);

        return isAvailable ? model : null;
      });

      const results = await Promise.all(validationPromises);
      const availableModels = results.filter(
        (model): model is VertexAIModel => model !== null
      );

      logger.info(`Found ${availableModels.length} available Gemini models`);

      return availableModels.length > 0
        ? availableModels
        : this.getFallbackModels();
    } catch (error) {
      logger.error("Error validating models", { error });
      return this.getFallbackModels();
    }
  }

  /**
   * Get fallback models (commonly available models)
   */
  private getFallbackModels(): VertexAIModel[] {
    return [
      {
        name: "gemini-2.5-flash-image",
        displayName: "Gemini 2.5 Flash (Image Gen)",
        description: "Generate and edit images with Gemini",
      },
    ];
  }

  /**
   * Get models with fallback
   * Returns validated models or fallback list if validation fails
   */
  async getModelsWithFallback(): Promise<VertexAIModel[]> {
    try {
      const models = await this.fetchAvailableModels();
      return models.length > 0 ? models : this.getFallbackModels();
    } catch (error) {
      logger.warn("Using fallback model list", { error });
      return this.getFallbackModels();
    }
  }
}
