"use client";

import { useChat } from "@/lib/hooks/use-chat";
import { ChatHistory } from "./chat-history";
import { MessageInput } from "./message-input";
import { ModelSelector } from "./model-selector";
import { Sparkles } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    <div
      className="flex h-full w-full flex-col p-4"
      data-testid="chat-container"
    >
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-primary h-5 w-5" />
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardHeader>
      </Card>
      <Separator className="my-4" />
      <div
        className="mx-auto max-w-3xl flex-1 pb-4"
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
