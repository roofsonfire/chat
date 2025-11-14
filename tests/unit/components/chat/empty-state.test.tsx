import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "@/components/chat/empty-state";
import { DEFAULT_PROMPTS } from "@/lib/constants/chat";

describe("EmptyState", () => {
  describe("Rendering", () => {
    it("should render the component with default content", () => {
      render(<EmptyState />);

      expect(screen.getByText("Start a Conversation")).toBeInTheDocument();
      expect(
        screen.getByText(/Ask me anything! I can help with coding/i)
      ).toBeInTheDocument();
      expect(screen.getByText("Try asking:")).toBeInTheDocument();
    });

    it("should render the message icon", () => {
      const { container } = render(<EmptyState />);

      // MessageSquare icon should be present
      const icon = container.querySelector(
        'svg[class*="lucide-message-square"]'
      );
      expect(icon).toBeInTheDocument();
    });

    it("should render the sparkles animation icon", () => {
      const { container } = render(<EmptyState />);

      // Sparkles icon should be present
      const sparkles = container.querySelector('svg[class*="lucide-sparkles"]');
      expect(sparkles).toBeInTheDocument();
    });

    it("should render the tip section", () => {
      render(<EmptyState />);

      // Use regex to find text split across elements
      expect(screen.getByText(/tip:/i)).toBeInTheDocument();
      expect(screen.getByText(/upload images/i)).toBeInTheDocument();
    });
  });

  describe("Suggested Prompts", () => {
    it("should render default prompts when no custom prompts provided", () => {
      render(<EmptyState />);

      DEFAULT_PROMPTS.forEach((prompt) => {
        expect(screen.getByText(prompt)).toBeInTheDocument();
      });
    });

    it("should render custom prompts when provided", () => {
      const customPrompts = [
        "Custom prompt 1",
        "Custom prompt 2",
        "Custom prompt 3",
      ];

      render(<EmptyState suggestedPrompts={customPrompts} />);

      customPrompts.forEach((prompt) => {
        expect(screen.getByText(prompt)).toBeInTheDocument();
      });
    });

    it("should not render default prompts when custom prompts provided", () => {
      const customPrompts = ["Custom prompt"];

      render(<EmptyState suggestedPrompts={customPrompts} />);

      // Default prompts should NOT appear
      DEFAULT_PROMPTS.forEach((prompt) => {
        expect(screen.queryByText(prompt)).not.toBeInTheDocument();
      });
    });

    it("should render prompts as buttons", () => {
      render(<EmptyState />);

      const promptButtons = screen.getAllByRole("button");
      expect(promptButtons.length).toBe(DEFAULT_PROMPTS.length);
    });
  });

  describe("User Interactions", () => {
    it("should call onStartChat with the correct prompt when a button is clicked", async () => {
      const user = userEvent.setup();
      const onStartChat = vi.fn();

      render(<EmptyState onStartChat={onStartChat} />);

      const firstPrompt = DEFAULT_PROMPTS[0];
      const button = screen.getByText(firstPrompt);

      await user.click(button);

      expect(onStartChat).toHaveBeenCalledTimes(1);
      expect(onStartChat).toHaveBeenCalledWith(firstPrompt);
    });

    it("should call onStartChat with custom prompt when custom prompts provided", async () => {
      const user = userEvent.setup();
      const onStartChat = vi.fn();
      const customPrompt = "Tell me a joke";

      render(
        <EmptyState
          onStartChat={onStartChat}
          suggestedPrompts={[customPrompt]}
        />
      );

      const button = screen.getByText(customPrompt);
      await user.click(button);

      expect(onStartChat).toHaveBeenCalledWith(customPrompt);
    });

    it("should not crash when onStartChat is not provided", async () => {
      const user = userEvent.setup();

      render(<EmptyState />);

      const button = screen.getByText(DEFAULT_PROMPTS[0]);

      // Should not throw error
      await expect(user.click(button)).resolves.not.toThrow();
    });

    it("should call onStartChat for each prompt button click", async () => {
      const user = userEvent.setup();
      const onStartChat = vi.fn();

      render(<EmptyState onStartChat={onStartChat} />);

      // Click all prompt buttons
      for (const prompt of DEFAULT_PROMPTS) {
        const button = screen.getByText(prompt);
        await user.click(button);
      }

      expect(onStartChat).toHaveBeenCalledTimes(DEFAULT_PROMPTS.length);
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      render(<EmptyState />);

      const heading = screen.getByRole("heading", {
        name: /start a conversation/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it("should have accessible buttons", () => {
      render(<EmptyState />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });

    it("should have descriptive text for screen readers", () => {
      render(<EmptyState />);

      const description = screen.getByText(/ask me anything/i);
      expect(description).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty custom prompts array", () => {
      render(<EmptyState suggestedPrompts={[]} />);

      expect(screen.getByText("Try asking:")).toBeInTheDocument();

      // No prompt buttons should be rendered
      const buttons = screen.queryAllByRole("button");
      expect(buttons.length).toBe(0);
    });

    it("should handle very long prompt text", () => {
      const longPrompt =
        "This is a very long prompt that should wrap to multiple lines and still be readable";

      render(<EmptyState suggestedPrompts={[longPrompt]} />);

      expect(screen.getByText(longPrompt)).toBeInTheDocument();
    });

    it("should handle special characters in prompts", () => {
      const specialPrompt =
        "What's 2+2? Tell me about <script>alert('test')</script>";

      render(<EmptyState suggestedPrompts={[specialPrompt]} />);

      expect(screen.getByText(specialPrompt)).toBeInTheDocument();
    });

    it("should handle multiple rapid clicks", async () => {
      const user = userEvent.setup();
      const onStartChat = vi.fn();

      render(<EmptyState onStartChat={onStartChat} />);

      const button = screen.getByText(DEFAULT_PROMPTS[0]);

      // Click rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(onStartChat).toHaveBeenCalledTimes(3);
    });
  });

  describe("CSS Classes and Styling", () => {
    it("should apply responsive grid classes to prompt container", () => {
      const { container } = render(<EmptyState />);

      const promptGrid = container.querySelector(".sm\\:grid-cols-2");
      expect(promptGrid).toBeInTheDocument();
    });

    it("should apply design token spacing variables", () => {
      const { container } = render(<EmptyState />);

      // Check for CSS variable usage
      const elementsWithSpacing =
        container.querySelectorAll('[class*="spacing"]');
      expect(elementsWithSpacing.length).toBeGreaterThan(0);
    });

    it("should apply proper button variant styling", () => {
      render(<EmptyState />);

      const buttons = screen.getAllByRole("button");

      // Buttons should have outline variant class
      buttons.forEach((button) => {
        expect(button.className).toContain("outline");
      });
    });
  });
});
