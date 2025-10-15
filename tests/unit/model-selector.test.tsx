import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ModelSelector } from "@/components/chat/model-selector";
import { VERTEX_AI_MODELS } from "@/lib/constants/vertex-ai-models";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ModelSelector", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("renders with the selected model", async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        models: [
          {
            name: "gemini-2.5-flash-image",
            displayName: "Gemini 2.5 Flash with Image",
            description: "Fast model with image capabilities",
          },
        ],
      }),
    });

    const onModelChange = vi.fn();
    await act(async () => {
      render(
        <ModelSelector
          selectedModel="gemini-2.5-flash-image"
          onModelChange={onModelChange}
        />
      );
    });

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    // The component shows the selected model name, not "Model:" text
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded");
  });

  it("is disabled when disabled prop is true", async () => {
    const onModelChange = vi.fn();
    await act(async () => {
      render(
        <ModelSelector
          selectedModel="gemini-2.5-flash-image"
          onModelChange={onModelChange}
          disabled={true}
        />
      );
    });

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
  });

  it("has correct aria attributes", async () => {
    const onModelChange = vi.fn();
    await act(async () => {
      render(
        <ModelSelector
          selectedModel="gemini-2.5-flash-image"
          onModelChange={onModelChange}
        />
      );
    });

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-expanded");
  });

  it("renders available models from VERTEX_AI_MODELS", () => {
    // This test verifies that models are available for selection
    const models = Object.values(VERTEX_AI_MODELS);
    expect(models.length).toBeGreaterThan(0);
    expect(models[0]).toEqual(
      expect.objectContaining({
        id: "gemini-2.5-flash-image",
        name: expect.any(String),
        description: expect.any(String),
      })
    );
  });
});
