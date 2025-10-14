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
      className={cn("flex items-start space-x-4", isUser ? "justify-end" : "")}
      role="article"
      aria-label={`${isUser ? "User" : "Assistant"} message`}
      data-testid={`message-${isUser ? "user" : "assistant"}`}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
        data-testid="message-content"
      >
        {/* User uploaded image (input) */}
        {isUser && (message as UserMessage).image && (
          <Image
            src={(message as UserMessage).image!}
            alt="User uploaded content"
            width={200}
            height={200}
            className="mb-2 rounded-lg"
            data-testid="message-image"
          />
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
                  <div key={idx} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:${img.mimeType};base64,${img.data}`}
                      alt={`Generated image ${idx + 1}`}
                      className="h-auto max-w-full rounded-lg"
                      style={{ maxWidth: "400px" }}
                      data-testid={`generated-image-${idx}`}
                    />
                    <Button
                      size="sm"
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
