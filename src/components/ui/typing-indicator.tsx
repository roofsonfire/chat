"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full delay-0"></span>
      <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full delay-75"></span>
      <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full delay-150"></span>
    </div>
  );
}
