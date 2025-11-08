"use client";

import { Message, UserMessage, AssistantMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Copy, ThumbsUp, ThumbsDown, Flag, Bot, Sparkles } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-4 my-4 flex items-start space-x-4 duration-500",
        isUser ? "justify-end" : ""
      )}
      role="article"
      aria-label={`${isUser ? "User" : "Assistant"} message`}
      data-testid={`message-${isUser ? "user" : "assistant"}`}
    >
      {!isUser && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Avatar className="h-8 w-8 cursor-help">
              <AvatarFallback>🤖</AvatarFallback>
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent className="w-64">
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">AI Assistant</h4>
                <p className="text-muted-foreground text-sm">
                  Powered by Google Gemini 2.5 Flash
                </p>
                <div className="text-muted-foreground flex items-center space-x-1 text-xs">
                  <Sparkles className="h-3 w-3" />
                  <span>Multimodal AI with image generation</span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Card
            className={cn(
              "max-w-[80%] cursor-context-menu transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
            data-testid="message-content"
          >
            <CardContent className="p-4">
              {/* User uploaded image (input) */}
              {isUser && (message as UserMessage).image && (
                <AspectRatio ratio={16 / 9} className="mb-2">
                  <Image
                    src={(message as UserMessage).image!}
                    alt="User uploaded content"
                    fill
                    className="rounded-lg object-cover"
                    data-testid="message-image"
                  />
                </AspectRatio>
              )}

              {/* Message text */}
              {message.content && (
                <p
                  className={cn(
                    "leading-relaxed wrap-break-word whitespace-pre-wrap",
                    isUser ? "font-medium" : "font-normal"
                  )}
                  data-testid="message-text"
                >
                  {message.content}
                </p>
              )}

              <div className="text-muted-foreground mt-1 text-xs">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* AI-generated images (output) */}
              {!isUser &&
                (message as AssistantMessage).generatedImages &&
                (message as AssistantMessage).generatedImages!.length > 0 && (
                  <div
                    className="mt-2 space-y-2"
                    data-testid="generated-images"
                  >
                    {(message as AssistantMessage).generatedImages!.map(
                      (img, idx) => (
                        <AspectRatio
                          key={idx}
                          ratio={1}
                          className="group relative max-w-[400px]"
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
                        </AspectRatio>
                      )
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            onClick={() => navigator.clipboard.writeText(message.content || "")}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Message
          </ContextMenuItem>
          {!isUser && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem>
                <ThumbsUp className="mr-2 h-4 w-4" />
                Good Response
              </ContextMenuItem>
              <ContextMenuItem>
                <ThumbsDown className="mr-2 h-4 w-4" />
                Poor Response
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>
                <Flag className="mr-2 h-4 w-4" />
                Report Issue
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
