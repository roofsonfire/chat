import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChatMessage } from "./message";
import { Message } from "@/lib/types";

const meta = {
  title: "Chat/Message",
  component: ChatMessage,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

const userMessage: Message = {
  role: "user",
  content: "Hello, how can you help me today?",
};

const assistantMessage: Message = {
  role: "assistant",
  content:
    "Hello! I'm an AI assistant powered by Google's Vertex AI. I can help you with a variety of tasks including answering questions, providing information, helping with creative writing, and more. What would you like assistance with?",
};

const userMessageWithImage: Message = {
  role: "user",
  content: "What's in this image?",
  image:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%234A90E2'/%3E%3C/svg%3E",
};

export const UserMessage: Story = {
  args: {
    message: userMessage,
  },
};

export const AssistantMessage: Story = {
  args: {
    message: assistantMessage,
  },
};

export const LongMessage: Story = {
  args: {
    message: {
      role: "assistant",
      content:
        "This is a much longer message that demonstrates how the component handles extensive text content. It should wrap properly and maintain readability even with multiple paragraphs.\n\nHere's another paragraph to show the formatting. The message component should handle this gracefully with proper spacing and layout.\n\nAnd a third paragraph for good measure, ensuring that the component scales well with varying amounts of content.",
    },
  },
};

export const UserMessageWithImage: Story = {
  args: {
    message: userMessageWithImage,
  },
};

export const CodeBlock: Story = {
  args: {
    message: {
      role: "assistant",
      content:
        "Here's a code example:\n```typescript\nconst greeting = 'Hello, World!';\nconsole.log(greeting);\n```\nThis demonstrates code formatting in messages.",
    },
  },
};
