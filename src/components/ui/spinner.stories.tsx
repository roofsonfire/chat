import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Spinner } from "./spinner";

const meta = {
  title: "UI/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    className: {
      control: "text",
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
  },
};

export const CustomColor: Story = {
  args: {
    size: "md",
    className: "text-blue-600",
  },
};

export const InButton: Story = {
  render: (args) => (
    <button className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-md px-4 py-2">
      <Spinner {...args} />
      <span>Loading...</span>
    </button>
  ),
  args: {
    size: "sm",
  },
};
