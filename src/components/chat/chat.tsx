"use client";

import { useChat } from "@/lib/hooks/use-chat";
import { ChatHistory } from "./chat-history";
import { MessageInput } from "./message-input";
import { ModelSelector } from "./model-selector";
import { Sparkles } from "lucide-react";

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
      <div className="bg-background/80 flex items-center justify-between border-b px-4 py-2 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-primary h-5 w-5" />
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isLoading}
          />
        </div>
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
