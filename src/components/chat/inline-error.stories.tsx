import type { Meta, StoryObj } from "@storybook/react";
import { InlineError } from "./inline-error";

const meta = {
  title: "Chat/InlineError",
  component: InlineError,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InlineError>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default inline error with validation message
 */
export const Default: Story = {
  args: {
    message: "This field is required",
  },
};

/**
 * Longer error message
 */
export const LongMessage: Story = {
  args: {
    message:
      "The message you entered is too long. Please keep your input under 10,000 characters.",
  },
};

/**
 * Technical error message
 */
export const TechnicalError: Story = {
  args: {
    message: "Network request failed: ERR_CONNECTION_REFUSED",
  },
};

/**
 * Dark mode
 */
export const DarkMode: Story = {
  args: {
    message: "Invalid email format",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};
