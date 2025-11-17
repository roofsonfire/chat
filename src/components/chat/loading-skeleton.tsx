import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * LoadingSkeleton Component
 *
 * Displays animated skeleton placeholders while chat messages are loading.
 * Provides visual feedback during AI response streaming or initial load.
 *
 * @component
 * @returns {JSX.Element} Skeleton loading state for chat messages
 *
 * @example
 * ```tsx
 * // Show loading state while waiting for AI response
 * {isLoading && <LoadingSkeleton />}
 * ```
 *
 * Design:
 * - Uses design tokens for consistent spacing (8pt grid)
 * - Animated pulse effect for better UX
 * - Multiple skeleton lines to simulate message structure
 * - Responsive layout with proper padding
 */
export function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-[var(--spacing-4)] px-[var(--spacing-4)] py-[var(--spacing-6)]">
      {/* Single AI response thinking indicator */}
      <Card className="max-w-[80%]">
        <CardContent className="pt-[var(--spacing-6)]">
          <div className="flex items-start gap-[var(--spacing-3)]">
            {/* AI Avatar */}
            <Skeleton className="h-[var(--spacing-8)] w-[var(--spacing-8)] rounded-full" />

            {/* Thinking indicator - animated dots */}
            <div className="flex items-center gap-1 py-2">
              <div className="bg-muted-foreground/30 h-2 w-2 animate-pulse rounded-full" />
              <div className="bg-muted-foreground/30 h-2 w-2 animate-pulse rounded-full [animation-delay:0.2s]" />
              <div className="bg-muted-foreground/30 h-2 w-2 animate-pulse rounded-full [animation-delay:0.4s]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
