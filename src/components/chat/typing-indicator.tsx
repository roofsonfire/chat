"use client";

import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "group animate-in fade-in slide-in-from-bottom-2 flex items-start justify-start space-x-3",
        className
      )}
      data-testid="typing-indicator"
    >
      {/* Avatar */}
      <div className="from-primary/20 to-primary/10 ring-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ring-1">
        <Bot className="text-primary h-4 w-4 animate-pulse" />
      </div>

      {/* Typing bubble */}
      <div className="relative max-w-[85%]">
        <div className="from-card via-card/95 to-card/90 ring-border/50 border-border/30 rounded-2xl rounded-bl-md border bg-gradient-to-br px-5 py-3.5 shadow-md ring-1 shadow-black/5 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground text-sm font-normal tracking-wide">
              Assistant is thinking
            </span>

            {/* Animated dots */}
            <div className="flex space-x-1">
              <div className="bg-primary/60 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
              <div className="bg-primary/60 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
              <div className="bg-primary/60 h-1.5 w-1.5 animate-bounce rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
