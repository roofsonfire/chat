import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EmptyState } from "./empty-state";

const meta: Meta<typeof EmptyState> = {
  title: "Chat/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

/**
 * Default empty state when no conversations exist
 */
export const Default: Story = {
  render: () => (
    <div className="h-[600px] bg-background">
      <EmptyState />
    </div>
  ),
};

/**
 * Empty state with callback function
 */
export const WithCallback: Story = {
  render: () => (
    <div className="h-[600px] bg-background">
      <EmptyState onStartChat={() => alert("Start chatting!")} />
    </div>
  ),
};

/**
 * Empty state in dark mode
 */
export const DarkMode: Story = {
  render: () => (
    <div className="dark h-[600px] bg-background">
      <EmptyState />
    </div>
  ),
  parameters: {
    backgrounds: { default: "dark" },
  },
};
