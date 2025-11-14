import { MessageSquare, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEFAULT_PROMPTS } from "@/lib/constants/chat";

/**
 * EmptyState Component
 *
 * Displays a welcoming empty state when the user has no previous conversations.
 * Provides visual guidance and encourages user engagement.
 *
 * @component
 * @param {Object} props - Component props
 * @param {(prompt: string) => void} [props.onStartChat] - Optional callback with selected prompt
 * @param {readonly string[]} [props.suggestedPrompts] - Custom prompts to display (defaults to DEFAULT_PROMPTS)
 * @returns {JSX.Element} Empty state UI for chat
 *
 * @example
 * ```tsx
 * // Show when no messages exist
 * {messages.length === 0 && (
 *   <EmptyState onStartChat={(prompt) => handlePrompt(prompt)} />
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
  onStartChat?: (prompt: string) => void;
  suggestedPrompts?: readonly string[];
}

export function EmptyState({
  onStartChat,
  suggestedPrompts = DEFAULT_PROMPTS,
}: EmptyStateProps) {

  return (
    <div className="flex h-full items-center justify-center p-[var(--spacing-4)]">
      <Card className="w-full max-w-2xl border-dashed">
        <CardContent className="flex flex-col items-center gap-[var(--spacing-6)] py-[var(--spacing-12)] text-center">
          {/* Icon */}
          <div className="relative">
            <div className="rounded-full bg-primary/10 p-[var(--spacing-6)]">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
            <Sparkles className="absolute -right-1 -top-1 h-6 w-6 text-accent animate-pulse" />
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
            <p className="text-sm font-medium text-muted-foreground">
              Try asking:
            </p>
            <div className="grid gap-[var(--spacing-2)] sm:grid-cols-2">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left h-auto py-[var(--spacing-3)] px-[var(--spacing-4)] whitespace-normal"
                  onClick={() => onStartChat?.(prompt)}
                >
                  <span className="text-sm">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-[var(--spacing-4)] rounded-lg bg-muted p-[var(--spacing-4)] text-sm text-muted-foreground">
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
