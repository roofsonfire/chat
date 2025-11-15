import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ErrorState } from "./error-state";

const meta: Meta<typeof ErrorState> = {
  title: "Chat/ErrorState",
  component: ErrorState,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

/**
 * Default error state with generic message
 */
export const Default: Story = {
  render: () => (
    <div className="bg-background h-[600px]">
      <ErrorState />
    </div>
  ),
};

/**
 * Error state with custom title and message
 */
export const CustomMessage: Story = {
  render: () => (
    <div className="bg-background h-[600px]">
      <ErrorState
        title="Failed to send message"
        message="Could not connect to the AI service. Please check your connection."
      />
    </div>
  ),
};

/**
 * Error state with retry button
 */
export const WithRetry: Story = {
  render: () => (
    <div className="bg-background h-[600px]">
      <ErrorState
        title="Connection timeout"
        message="The request timed out. Please try again."
        onRetry={() => alert("Retrying...")}
      />
    </div>
  ),
};

/**
 * Error state with both retry and go home buttons
 */
export const WithActions: Story = {
  render: () => (
    <div className="bg-background h-[600px]">
      <ErrorState
        title="Something went wrong"
        message="An unexpected error occurred. You can try again or go back home."
        onRetry={() => alert("Retrying...")}
        onGoHome={() => alert("Going home...")}
      />
    </div>
  ),
};

/**
 * Warning variant (less severe)
 */
export const WarningVariant: Story = {
  render: () => (
    <div className="bg-background h-[600px]">
      <ErrorState
        variant="warning"
        title="Invalid input"
        message="Message cannot be empty. Please type something to continue."
      />
    </div>
  ),
};

/**
 * Error state in dark mode
 */
export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-background h-[600px]">
      <ErrorState
        title="Connection failed"
        message="Could not establish connection to the server."
        onRetry={() => alert("Retrying...")}
      />
    </div>
  ),
  parameters: {
    backgrounds: { default: "dark" },
  },
};
