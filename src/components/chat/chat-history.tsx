"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/types";
import { ChatMessage } from "./message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Props for the ChatHistory component
 */
interface ChatHistoryProps {
  /** Array of chat messages to display */
  messages: Message[];
  /** Loading state to show skeleton loader */
  isLoading?: boolean;
}

/**
 * ChatHistory Component
 *
 * Displays the conversation history with auto-scrolling, empty state,
 * and loading indicators. Automatically scrolls to the latest message
 * when new messages are added.
 *
 * @component
 * @param {ChatHistoryProps} props - Component props
 * @param {Message[]} props.messages - Array of messages to display
 * @param {boolean} [props.isLoading=false] - Whether a new message is being generated
 *
 * @returns {JSX.Element} Scrollable message history or empty state
 *
 * @example
 * ```tsx
 * <ChatHistory
 *   messages={[
 *     { role: "user", content: "Hello!", timestamp: new Date() },
 *     { role: "assistant", content: "Hi! How can I help?", timestamp: new Date() }
 *   ]}
 *   isLoading={false}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Empty state
 * <ChatHistory messages={[]} />
 * ```
 *
 * @example
 * ```tsx
 * // With loading indicator
 * <ChatHistory
 *   messages={existingMessages}
 *   isLoading={true}
 * />
 * ```
 *
 * Features:
 * - Auto-scroll to latest message on updates
 * - Empty state with helpful prompt
 * - Skeleton loader for streaming responses
 * - Responsive scrollable container
 * - Smooth scrolling behavior
 * - Accessibility test IDs
 */
export function ChatHistory({ messages, isLoading = false }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div
        className="flex h-full items-center justify-center p-4"
        data-testid="empty-chat"
      >
        <p className="text-muted-foreground text-center">
          Start a conversation by typing a message below.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4" data-testid="chat-messages">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {isLoading && (
          <div
            className="flex items-start space-x-4"
            data-testid="loading-indicator"
          >
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
