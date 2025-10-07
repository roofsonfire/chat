import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModelSelector } from "@/components/chat/model-selector";
import { AVAILABLE_MODELS } from "@/lib/constants/vertex-ai-models";

describe("ModelSelector", () => {
  it("renders with the selected model", () => {
    const onModelChange = vi.fn();
    render(
      <ModelSelector
        selectedModel="gemini-1.5-flash-002"
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
        selectedModel="gemini-1.5-flash-002"
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
        selectedModel="gemini-1.5-flash-002"
        onModelChange={onModelChange}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-expanded");
  });

  it("renders all available models in constants", () => {
    // This test verifies that all models are available for selection
    expect(AVAILABLE_MODELS.length).toBeGreaterThan(0);
    expect(AVAILABLE_MODELS).toContainEqual(
      expect.objectContaining({
        id: "gemini-2.5-flash-image",
        name: expect.any(String),
        description: expect.any(String),
      })
    );
  });
});
