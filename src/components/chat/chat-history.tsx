"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/types";
import { ChatMessage } from "./message";
import { Spinner } from "@/components/ui/spinner";

interface ChatHistoryProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatHistory({ messages, isLoading = false }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground text-center">
          Start a conversation by typing a message below.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
      {isLoading && (
        <div className="flex items-start space-x-4">
          <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2">
            <Spinner size="sm" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
