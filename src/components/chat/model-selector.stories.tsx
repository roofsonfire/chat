import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ModelSelector } from "./model-selector";

const meta = {
  title: "Chat/ModelSelector",
  component: ModelSelector,
  parameters: {
    layout: "centered",
  },

  argTypes: {
    selectedModel: {
      control: "select",
      options: [
        "gemini-1.5-flash-002",
        "gemini-1.5-pro-002",
        "gemini-1.0-pro",
        "gemini-1.0-pro-vision",
      ],
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    onModelChange: fn(),
  },
} satisfies Meta<typeof ModelSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedModel: "gemini-1.5-flash-002",
    disabled: false,
  },
};

export const ProModelSelected: Story = {
  args: {
    selectedModel: "gemini-1.5-pro-002",
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    selectedModel: "gemini-1.5-flash-002",
    disabled: true,
  },
};

export const VisionModelSelected: Story = {
  args: {
    selectedModel: "gemini-1.0-pro-vision",
    disabled: false,
  },
};
