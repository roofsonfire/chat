"use client";

import { useChat } from "@/lib/hooks/use-chat";
import { ChatHistory } from "./chat-history";
import { MessageInput } from "./message-input";
import { ModelSelector } from "./model-selector";

export function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setImage,
    selectedModel,
    setSelectedModel,
  } = useChat();

  return (
    <div className="flex h-full w-full flex-col" data-testid="chat-container">
      <div className="border-b p-4">
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          disabled={isLoading}
        />
      </div>
      <div
        className="flex-1 overflow-y-auto"
        data-testid="chat-history-container"
      >
        <ChatHistory messages={messages} isLoading={isLoading} />
      </div>
      <MessageInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        setImage={setImage}
      />
    </div>
  );
}
