import { describe, it, expect } from "vitest";
import {
  VERTEX_AI_MODELS,
  DEFAULT_MODEL_ID,
  AVAILABLE_MODELS,
  type VertexAIModelId,
} from "@/lib/constants/vertex-ai-models";

describe("Vertex AI Models Constants", () => {
  it("should define VERTEX_AI_MODELS with correct structure", () => {
    expect(VERTEX_AI_MODELS).toBeDefined();
    expect(typeof VERTEX_AI_MODELS).toBe("object");
  });

  it("should have valid model entries", () => {
    Object.entries(VERTEX_AI_MODELS).forEach(([key, model]) => {
      expect(model).toHaveProperty("id");
      expect(model).toHaveProperty("name");
      expect(model).toHaveProperty("description");
      expect(model.id).toBe(key);
      expect(typeof model.name).toBe("string");
      expect(typeof model.description).toBe("string");
    });
  });

  it("should have DEFAULT_MODEL_ID that exists in VERTEX_AI_MODELS", () => {
    expect(DEFAULT_MODEL_ID).toBeDefined();
    expect(VERTEX_AI_MODELS[DEFAULT_MODEL_ID]).toBeDefined();
  });

  it("should have AVAILABLE_MODELS as an array", () => {
    expect(Array.isArray(AVAILABLE_MODELS)).toBe(true);
    expect(AVAILABLE_MODELS.length).toBeGreaterThan(0);
  });

  it("should have AVAILABLE_MODELS matching VERTEX_AI_MODELS entries", () => {
    const modelIds = Object.keys(VERTEX_AI_MODELS);
    expect(AVAILABLE_MODELS.length).toBe(modelIds.length);

    AVAILABLE_MODELS.forEach((model) => {
      expect(VERTEX_AI_MODELS[model.id as VertexAIModelId]).toBeDefined();
    });
  });

  it("should include Gemini 2.5 Flash as default", () => {
    expect(DEFAULT_MODEL_ID).toBe("gemini-2.5-flash");
  });

  it("should include Gemini 2.5 and 2.0 models", () => {
    expect(VERTEX_AI_MODELS["gemini-2.5-flash"]).toBeDefined();
    expect(VERTEX_AI_MODELS["gemini-2.5-flash"].name).toContain("Gemini 2.5");
    expect(VERTEX_AI_MODELS["gemini-2.0-flash-exp"]).toBeDefined();
  });
});
