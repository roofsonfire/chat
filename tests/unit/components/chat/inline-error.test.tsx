import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InlineError } from "@/components/chat/inline-error";

describe("InlineError", () => {
  describe("Rendering", () => {
    it("should render the error message", () => {
      render(<InlineError message="This is an error message" />);

      expect(screen.getByText("This is an error message")).toBeInTheDocument();
    });

    it("should render the error icon", () => {
      const { container } = render(<InlineError message="Error" />);

      // SVG icon is present
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should render as a paragraph element", () => {
      render(<InlineError message="Test error" />);

      const paragraph = screen.getByText("Test error");
      expect(paragraph.tagName).toBe("P");
    });
  });

  describe("Message Display", () => {
    it("should handle short error messages", () => {
      render(<InlineError message="Error" />);

      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("should handle long error messages", () => {
      const longMessage =
        "This is a very long error message that should wrap properly and maintain readability even when spanning multiple lines in the component";

      render(<InlineError message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should handle empty string message", () => {
      render(<InlineError message="" />);

      const paragraph = screen.queryByRole("paragraph");
      expect(paragraph).toBeInTheDocument();
    });

    it("should handle special characters in message", () => {
      const specialMessage =
        "Error: <script>alert('test')</script> & \"quotes\" 'apostrophes'";

      render(<InlineError message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it("should handle multiline messages", () => {
      const multilineMessage = "Line 1\nLine 2\nLine 3";
      const { container } = render(<InlineError message={multilineMessage} />);

      const paragraph = container.querySelector("p");
      expect(paragraph).toBeInTheDocument();
      expect(paragraph?.textContent).toBe(multilineMessage);
    });
  });

  describe("Styling", () => {
    it("should apply destructive background color", () => {
      const { container } = render(<InlineError message="Error" />);

      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv.className).toContain("bg-destructive/10");
    });

    it("should apply destructive text color", () => {
      const { container } = render(<InlineError message="Error" />);

      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv.className).toContain("text-destructive");
    });

    it("should apply proper padding", () => {
      const { container } = render(<InlineError message="Error" />);

      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv.className).toContain("p-[var(--spacing-3)]");
    });

    it("should apply rounded corners", () => {
      const { container } = render(<InlineError message="Error" />);

      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv.className).toContain("rounded-md");
    });

    it("should use flex layout for icon and text", () => {
      const { container } = render(<InlineError message="Error" />);

      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv.className).toContain("flex");
      expect(errorDiv.className).toContain("items-center");
    });

    it("should apply gap between icon and text", () => {
      const { container } = render(<InlineError message="Error" />);

      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv.className).toContain("gap-[var(--spacing-2)]");
    });

    it("should apply small text size", () => {
      const { container } = render(<InlineError message="Error" />);

      const errorDiv = container.firstChild as HTMLElement;
      expect(errorDiv.className).toContain("text-sm");
    });

    it("should make icon non-shrinkable", () => {
      const { container } = render(<InlineError message="Error" />);

      const icon = container.querySelector("svg") as SVGElement;
      expect(icon.className.baseVal).toContain("flex-shrink-0");
    });

    it("should set icon size", () => {
      const { container } = render(<InlineError message="Error" />);

      const icon = container.querySelector("svg") as SVGElement;
      expect(icon.className.baseVal).toContain("h-4");
      expect(icon.className.baseVal).toContain("w-4");
    });
  });

  describe("Accessibility", () => {
    it("should have text content accessible to screen readers", () => {
      render(<InlineError message="Validation error" />);

      const text = screen.getByText("Validation error");
      expect(text).toBeVisible();
    });

    it("should maintain proper reading order (icon then text)", () => {
      const { container } = render(<InlineError message="Error message" />);

      const errorDiv = container.firstChild as HTMLElement;
      const children = Array.from(errorDiv.children);

      // First child should be the icon (SVG)
      expect(children[0]?.tagName).toBe("svg");

      // Second child should be the paragraph
      expect(children[1]?.tagName).toBe("P");
    });
  });

  describe("Edge Cases", () => {
    it("should handle numeric message (converted to string)", () => {
      // TypeScript would prevent this, but testing runtime behavior
      render(<InlineError message={String(123)} />);

      expect(screen.getByText("123")).toBeInTheDocument();
    });

    it("should handle message with only whitespace", () => {
      const { container } = render(<InlineError message="   " />);

      const paragraph = container.querySelector("p");
      expect(paragraph).toBeInTheDocument();
      expect(paragraph?.textContent).toBe("   ");
    });

    it("should handle message with HTML entities", () => {
      const htmlMessage = "Error &lt;tag&gt; &amp; &quot;quotes&quot;";

      render(<InlineError message={htmlMessage} />);

      expect(screen.getByText(htmlMessage)).toBeInTheDocument();
    });

    it("should handle message with emoji", () => {
      const emojiMessage = "⚠️ Warning: Something went wrong 🔥";

      render(<InlineError message={emojiMessage} />);

      expect(screen.getByText(emojiMessage)).toBeInTheDocument();
    });
  });

  describe("Component Structure", () => {
    it("should render exactly one icon", () => {
      const { container } = render(<InlineError message="Error" />);

      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBe(1);
    });

    it("should render exactly one paragraph", () => {
      const { container } = render(<InlineError message="Error" />);

      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs.length).toBe(1);
    });

    it("should render a single root div", () => {
      const { container } = render(<InlineError message="Error" />);

      expect(container.firstChild).toBeTruthy();
      expect((container.firstChild as HTMLElement).tagName).toBe("DIV");
    });
  });

  describe("Design Token Usage", () => {
    it("should use CSS variable for spacing", () => {
      const { container } = render(<InlineError message="Error" />);

      const errorDiv = container.firstChild as HTMLElement;
      const hasSpacingVars =
        errorDiv.className.includes("spacing-2") ||
        errorDiv.className.includes("spacing-3");

      expect(hasSpacingVars).toBe(true);
    });
  });

  describe("Comparison with ErrorState", () => {
    it("should be more compact than ErrorState (no card wrapper)", () => {
      const { container } = render(<InlineError message="Error" />);

      // Should not have Card component structure
      const card = container.querySelector('[class*="card"]');
      expect(card).not.toBeInTheDocument();
    });

    it("should not have action buttons unlike ErrorState", () => {
      const { container } = render(<InlineError message="Error" />);

      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(0);
    });

    it("should not have common solutions section unlike ErrorState", () => {
      render(<InlineError message="Error" />);

      expect(screen.queryByText("Common solutions:")).not.toBeInTheDocument();
    });
  });
});
