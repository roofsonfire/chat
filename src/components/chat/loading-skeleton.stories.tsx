import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoadingSkeleton } from "./loading-skeleton";

const meta: Meta<typeof LoadingSkeleton> = {
  title: "Chat/LoadingSkeleton",
  component: LoadingSkeleton,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LoadingSkeleton>;

/**
 * Default loading skeleton with message placeholders
 */
export const Default: Story = {
  render: () => (
    <div className="bg-background h-[600px]">
      <LoadingSkeleton />
    </div>
  ),
};

/**
 * Loading skeleton in dark mode
 */
export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-background h-[600px]">
      <LoadingSkeleton />
    </div>
  ),
  parameters: {
    backgrounds: { default: "dark" },
  },
};
