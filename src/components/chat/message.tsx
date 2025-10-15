"use client";

import { Message, UserMessage, AssistantMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "my-4 flex items-start space-x-4",
        isUser ? "justify-end" : ""
      )}
      role="article"
      aria-label={`${isUser ? "User" : "Assistant"} message`}
      data-testid={`message-${isUser ? "user" : "assistant"}`}
    >
      {!isUser && (
        <div className="bg-background flex h-8 w-8 shrink-0 items-center justify-center rounded-md border shadow-sm select-none">
          🤖
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] px-4 py-2 shadow-md",
          isUser
            ? "bg-primary text-primary-foreground rounded-t-xl rounded-bl-xl"
            : "bg-muted text-muted-foreground rounded-t-xl rounded-br-xl"
        )}
        data-testid="message-content"
      >
        {/* User uploaded image (input) */}
        {isUser && (message as UserMessage).image && (
          <div className="relative mb-2 h-50 w-50">
            <Image
              src={(message as UserMessage).image!}
              alt="User uploaded content"
              fill
              className="rounded-lg object-cover"
              data-testid="message-image"
            />
          </div>
        )}

        {/* Message text */}
        {message.content && (
          <p
            className="break-words whitespace-pre-wrap"
            data-testid="message-text"
          >
            {message.content}
          </p>
        )}

        {/* AI-generated images (output) */}
        {!isUser &&
          (message as AssistantMessage).generatedImages &&
          (message as AssistantMessage).generatedImages!.length > 0 && (
            <div className="mt-2 space-y-2" data-testid="generated-images">
              {(message as AssistantMessage).generatedImages!.map(
                (img, idx) => (
                  <div
                    key={idx}
                    className="group relative h-100 w-100 max-w-[400px]"
                  >
                    <Image
                      src={`data:${img.mimeType};base64,${img.data}`}
                      alt={`AI-generated image ${idx + 1}`}
                      fill
                      className="rounded-lg object-cover"
                      data-testid={`generated-image-${idx}`}
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = `data:${img.mimeType};base64,${img.data}`;
                        link.download = `generated-image-${Date.now()}.${img.mimeType.split("/")[1]}`;
                        link.click();
                      }}
                      data-testid={`download-image-${idx}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
}
