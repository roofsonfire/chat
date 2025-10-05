"use client";

import { useChat } from "@/lib/hooks/use-chat";
import { ChatHistory } from "./chat-history";
import { MessageInput } from "./message-input";

export function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setImage,
  } = useChat();

  return (
    <main className="flex-1 overflow-y-auto">
      <ChatHistory messages={messages} />
      <MessageInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        setImage={setImage}
      />
    </main>
  );
}
