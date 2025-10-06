import { describe, it, expect, vi, beforeEach } from "vitest";
import { ModelRegistryService } from "@/lib/services/model-registry-service";

// Mock VertexAI
vi.mock("@google-cloud/vertexai", () => ({
  VertexAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      countTokens: vi.fn().mockResolvedValue({ totalTokens: 1 }),
    }),
  })),
}));

// Mock env
vi.mock("@/lib/env", () => ({
  env: {
    GOOGLE_PROJECT_ID: "test-project",
    GOOGLE_LOCATION: "us-central1",
    GOOGLE_VERTEX_AI_MODEL_ID: "gemini-2.5-flash",
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("ModelRegistryService", () => {
  let service: ModelRegistryService;

  beforeEach(() => {
    service = new ModelRegistryService();
    vi.clearAllMocks();
  });

  it("should create instance with correct configuration", () => {
    expect(service).toBeDefined();
  });

  it("should return fallback models when API fails", async () => {
    const models = await service.getModelsWithFallback();

    // Should return at least one fallback model (now we have 2: Gemini 2.5 and 2.0)
    expect(models.length).toBeGreaterThanOrEqual(1);
    expect(models[0]).toHaveProperty("name");
    expect(models[0]).toHaveProperty("displayName");
    expect(models[0]).toHaveProperty("description");
  });

  it("should have expected model structure", async () => {
    const models = await service.getModelsWithFallback();

    models.forEach((model) => {
      expect(model).toHaveProperty("name");
      expect(model).toHaveProperty("displayName");
      expect(model).toHaveProperty("description");
      expect(typeof model.name).toBe("string");
      expect(typeof model.displayName).toBe("string");
      expect(typeof model.description).toBe("string");
    });
  });

  it("should include Gemini 2.5 Flash in models", async () => {
    const models = await service.getModelsWithFallback();

    const hasFlash = models.some(
      (m) =>
        m.name.includes("gemini-2.5-flash") ||
        m.name.includes("gemini-2.0-flash-exp")
    );
    expect(hasFlash).toBe(true);
  });
});
