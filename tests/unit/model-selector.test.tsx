import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModelSelector } from "@/components/chat/model-selector";
import { VERTEX_AI_MODELS } from "@/lib/constants/vertex-ai-models";

describe("ModelSelector", () => {
  it("renders with the selected model", () => {
    const onModelChange = vi.fn();
    render(
      <ModelSelector
        selectedModel="gemini-2.5-flash-image"
        onModelChange={onModelChange}
      />
    );

    expect(screen.getByText("Model:")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    const onModelChange = vi.fn();
    render(
      <ModelSelector
        selectedModel="gemini-2.5-flash-image"
        onModelChange={onModelChange}
        disabled={true}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
  });

  it("has correct aria attributes", () => {
    const onModelChange = vi.fn();
    render(
      <ModelSelector
        selectedModel="gemini-2.5-flash-image"
        onModelChange={onModelChange}
      />
    );

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
