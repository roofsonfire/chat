import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChatMessage } from "./message";
import { Message } from "@/lib/types";

const meta = {
  title: "Chat/Message",
  component: ChatMessage,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

const userMessage: Message = {
  role: "user",
  content: "Hello, how can you help me today?",
  timestamp: new Date("2024-01-15T10:30:00Z"),
};

const assistantMessage: Message = {
  role: "assistant",
  content:
    "Hello! I'm an AI assistant powered by Google's Vertex AI. I can help you with a variety of tasks including answering questions, providing information, helping with creative writing, and more. What would you like assistance with?",
  timestamp: new Date("2024-01-15T10:30:05Z"),
};

const userMessageWithImage: Message = {
  role: "user",
  content: "What's in this image?",
  image:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%234A90E2'/%3E%3C/svg%3E",
  timestamp: new Date("2024-01-15T10:31:00Z"),
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
      timestamp: new Date("2024-01-15T10:32:00Z"),
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
      timestamp: new Date("2024-01-15T10:33:00Z"),
    },
  },
};

/**
 * Demonstrates the fade-in and slide-up animation
 * Reload this story to see the animation again
 */
export const AnimatedEntrance: Story = {
  args: {
    message: {
      role: "assistant",
      content:
        "✨ Watch me fade in and slide up with a smooth spring animation! This demonstrates the microinteraction added in Issue #110.",
      timestamp: new Date(),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "New messages animate in with a fade-in, slide-up, and subtle scale effect using Framer Motion. The animation uses a spring transition for a natural, bouncy feel.",
      },
    },
  },
};

/**
 * Shows multiple messages appearing in sequence
 * Demonstrates how animations work in a chat conversation
 */
export const ConversationFlow: Story = {
  args: {
    message: userMessage, // Required by type but not used in custom render
  },
  render: () => (
    <div className="space-y-2">
      <ChatMessage
        message={{
          role: "user",
          content: "Can you show me the animations?",
          timestamp: new Date(Date.now() - 10000),
        }}
      />
      <ChatMessage
        message={{
          role: "assistant",
          content: "Sure! Each message animates in with a smooth slide and fade effect. Notice how I gently spring into view!",
          timestamp: new Date(Date.now() - 5000),
        }}
      />
      <ChatMessage
        message={{
          role: "user",
          content: "That looks great!",
          timestamp: new Date(),
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A conversation showing how multiple messages animate in sequence, creating a polished chat experience.",
      },
    },
  },
};
