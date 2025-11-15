import { MessageSquare, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * EmptyState Component
 *
 * Displays a welcoming empty state when the user has no previous conversations.
 * Provides visual guidance and encourages user engagement.
 *
 * @component
 * @param {Object} props - Component props
 * @param {() => void} [props.onStartChat] - Optional callback when user wants to start chatting
 * @returns {JSX.Element} Empty state UI for chat
 *
 * @example
 * ```tsx
 * // Show when no messages exist
 * {messages.length === 0 && (
 *   <EmptyState onStartChat={() => inputRef.current?.focus()} />
 * )}
 * ```
 *
 * Design:
 * - Uses brand colors (primary purple)
 * - Centered layout for better visual hierarchy
 * - Subtle animations for engagement
 * - Clear call-to-action with suggested prompts
 */
interface EmptyStateProps {
  onStartChat?: () => void;
}

export function EmptyState({ onStartChat }: EmptyStateProps) {
  const suggestedPrompts = [
    "Explain quantum computing in simple terms",
    "Write a creative story about a robot",
    "Help me debug this TypeScript code",
    "Suggest ideas for a mobile app",
  ];

  return (
    <div className="flex h-full items-center justify-center p-[var(--spacing-4)]">
      <Card className="w-full max-w-2xl border-dashed">
        <CardContent className="flex flex-col items-center gap-[var(--spacing-6)] py-[var(--spacing-12)] text-center">
          {/* Icon */}
          <div className="relative">
            <div className="bg-primary/10 rounded-full p-[var(--spacing-6)]">
              <MessageSquare className="text-primary h-12 w-12" />
            </div>
            <Sparkles className="text-accent absolute -top-1 -right-1 h-6 w-6 animate-pulse" />
          </div>

          {/* Heading */}
          <div className="space-y-[var(--spacing-2)]">
            <h2 className="text-2xl font-bold tracking-tight">
              Start a Conversation
            </h2>
            <p className="text-muted-foreground max-w-md">
              Ask me anything! I can help with coding, writing, analysis, and
              creative tasks.
            </p>
          </div>

          {/* Suggested prompts */}
          <div className="w-full space-y-[var(--spacing-3)]">
            <p className="text-muted-foreground text-sm font-medium">
              Try asking:
            </p>
            <div className="grid gap-[var(--spacing-2)] sm:grid-cols-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto justify-start px-[var(--spacing-4)] py-[var(--spacing-3)] text-left whitespace-normal"
                  onClick={() => {
                    // Could emit this prompt to parent component
                    onStartChat?.();
                  }}
                >
                  <span className="text-sm">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Additional info */}
          <div className="bg-muted text-muted-foreground mt-[var(--spacing-4)] rounded-lg p-[var(--spacing-4)] text-sm">
            <p>
              💡 <strong>Tip:</strong> You can upload images along with your
              messages for visual analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
