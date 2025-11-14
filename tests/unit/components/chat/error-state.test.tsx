import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "@/components/chat/error-state";

describe("ErrorState", () => {
  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<ErrorState />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(
        screen.getByText("An unexpected error occurred. Please try again.")
      ).toBeInTheDocument();
    });

    it("should render custom title and message", () => {
      render(
        <ErrorState title="Custom Error Title" message="Custom error message" />
      );

      expect(screen.getByText("Custom Error Title")).toBeInTheDocument();
      expect(screen.getByText("Custom error message")).toBeInTheDocument();
    });

    it("should render error icon", () => {
      const { container } = render(<ErrorState />);

      // AlertCircle icon renders as SVG
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should render common solutions section", () => {
      render(<ErrorState />);

      expect(screen.getByText("Common solutions:")).toBeInTheDocument();
      expect(
        screen.getByText("Check your internet connection")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Refresh the page and try again")
      ).toBeInTheDocument();
      expect(screen.getByText("Clear your browser cache")).toBeInTheDocument();
    });
  });

  describe("Variant Behavior", () => {
    it("should render error variant by default", () => {
      render(<ErrorState />);

      expect(
        screen.getByText("Contact support if the problem persists")
      ).toBeInTheDocument();
    });

    it("should render error variant when explicitly set", () => {
      render(<ErrorState variant="error" />);

      expect(
        screen.getByText("Contact support if the problem persists")
      ).toBeInTheDocument();
    });

    it("should render warning variant", () => {
      render(<ErrorState variant="warning" />);

      // Warning variant should NOT show "Contact support" message
      expect(
        screen.queryByText("Contact support if the problem persists")
      ).not.toBeInTheDocument();
    });

    it("should apply destructive styling for error variant", () => {
      const { container } = render(<ErrorState variant="error" />);

      const alert = container.querySelector('[role="alert"]');
      expect(alert?.className).toContain("destructive");
    });

    it("should apply default styling for warning variant", () => {
      const { container } = render(<ErrorState variant="warning" />);

      const alert = container.querySelector('[role="alert"]');
      expect(alert?.className).not.toContain("destructive");
    });
  });

  describe("Action Buttons", () => {
    it("should render retry button when onRetry provided", () => {
      const onRetry = vi.fn();
      render(<ErrorState onRetry={onRetry} />);

      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    it("should render go home button when onGoHome provided", () => {
      const onGoHome = vi.fn();
      render(<ErrorState onGoHome={onGoHome} />);

      expect(screen.getByText("Go Home")).toBeInTheDocument();
    });

    it("should render both buttons when both callbacks provided", () => {
      const onRetry = vi.fn();
      const onGoHome = vi.fn();

      render(<ErrorState onRetry={onRetry} onGoHome={onGoHome} />);

      expect(screen.getByText("Try Again")).toBeInTheDocument();
      expect(screen.getByText("Go Home")).toBeInTheDocument();
    });

    it("should not render action buttons when no callbacks provided", () => {
      render(<ErrorState />);

      expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
      expect(screen.queryByText("Go Home")).not.toBeInTheDocument();
    });

    it("should render retry button with RefreshCw icon", () => {
      const onRetry = vi.fn();
      const { container } = render(<ErrorState onRetry={onRetry} />);

      const icon = container.querySelector('svg[class*="lucide-refresh-cw"]');
      expect(icon).toBeInTheDocument();
    });

    it("should render go home button with Home icon", () => {
      const { container } = render(<ErrorState onGoHome={vi.fn()} />);

      // SVG icon should be present
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe("User Interactions", () => {
    it("should call onRetry when retry button clicked", async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(<ErrorState onRetry={onRetry} />);

      const retryButton = screen.getByText("Try Again");
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("should call onGoHome when go home button clicked", async () => {
      const user = userEvent.setup();
      const onGoHome = vi.fn();

      render(<ErrorState onGoHome={onGoHome} />);

      const homeButton = screen.getByText("Go Home");
      await user.click(homeButton);

      expect(onGoHome).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple retry clicks", async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(<ErrorState onRetry={onRetry} />);

      const retryButton = screen.getByText("Try Again");

      await user.click(retryButton);
      await user.click(retryButton);
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(3);
    });

    it("should not interfere between retry and home button clicks", async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      const onGoHome = vi.fn();

      render(<ErrorState onRetry={onRetry} onGoHome={onGoHome} />);

      const retryButton = screen.getByText("Try Again");
      const homeButton = screen.getByText("Go Home");

      await user.click(retryButton);
      await user.click(homeButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onGoHome).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have proper alert role", () => {
      render(<ErrorState />);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("should have accessible button labels", () => {
      const onRetry = vi.fn();
      const onGoHome = vi.fn();

      render(<ErrorState onRetry={onRetry} onGoHome={onGoHome} />);

      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /go home/i })
      ).toBeInTheDocument();
    });

    it("should allow keyboard navigation on retry button", async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(<ErrorState onRetry={onRetry} />);

      const retryButton = screen.getByText("Try Again");

      retryButton.focus();
      expect(retryButton).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("should allow keyboard navigation on go home button", async () => {
      const user = userEvent.setup();
      const onGoHome = vi.fn();

      render(<ErrorState onGoHome={onGoHome} />);

      const homeButton = screen.getByText("Go Home");

      homeButton.focus();
      await user.keyboard(" ");

      expect(onGoHome).toHaveBeenCalledTimes(1);
    });

    it("should have semantic list structure for solutions", () => {
      render(<ErrorState />);

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();

      const listItems = screen.getAllByRole("listitem");
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long error messages", () => {
      const longMessage =
        "This is a very long error message that spans multiple lines and should be displayed correctly without breaking the layout or causing overflow issues in the component container";

      render(<ErrorState message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should handle empty string title", () => {
      render(<ErrorState title="" />);

      // Should still render, just with empty title
      expect(
        screen.getByText("An unexpected error occurred. Please try again.")
      ).toBeInTheDocument();
    });

    it("should handle empty string message", () => {
      render(<ErrorState message="" />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("should handle special characters in error messages", () => {
      const specialMessage =
        "Error: <script>alert('xss')</script> & \"quotes\" 'apostrophes'";

      render(<ErrorState message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });

  describe("Button Styling", () => {
    it("should apply correct variant to retry button in error mode", () => {
      render(<ErrorState variant="error" onRetry={vi.fn()} />);

      const retryButton = screen.getByRole("button", { name: /try again/i });
      // Default variant (primary/filled button, not outline)
      expect(retryButton.className).toContain("bg-primary");
    });

    it("should apply correct variant to retry button in warning mode", () => {
      const onRetry = vi.fn();
      render(<ErrorState variant="warning" onRetry={onRetry} />);

      const retryButton = screen.getByText("Try Again");
      // Outline variant for warning
      expect(retryButton.className).toContain("outline");
    });

    it("should always apply outline variant to go home button", () => {
      const onGoHome = vi.fn();
      render(<ErrorState variant="error" onGoHome={onGoHome} />);

      const homeButton = screen.getByText("Go Home");
      expect(homeButton.className).toContain("outline");
    });

    it("should apply small size to both buttons", () => {
      const onRetry = vi.fn();
      const onGoHome = vi.fn();

      const { container } = render(
        <ErrorState onRetry={onRetry} onGoHome={onGoHome} />
      );

      const buttons = container.querySelectorAll("button");
      buttons.forEach((button) => {
        expect(button.className).toContain("sm");
      });
    });
  });

  describe("Design Token Usage", () => {
    it("should use CSS variable spacing", () => {
      const { container } = render(<ErrorState />);

      const elementsWithSpacing =
        container.querySelectorAll('[class*="spacing"]');
      expect(elementsWithSpacing.length).toBeGreaterThan(0);
    });
  });
});
