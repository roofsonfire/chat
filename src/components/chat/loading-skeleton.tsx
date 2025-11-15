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
      {/* Message skeleton 1 */}
      <Card className="max-w-[80%]">
        <CardContent className="pt-[var(--spacing-6)]">
          <div className="flex items-start gap-[var(--spacing-3)]">
            {/* Avatar skeleton */}
            <Skeleton className="h-[var(--spacing-8)] w-[var(--spacing-8)] rounded-full" />

            {/* Message content skeleton */}
            <div className="flex-1 space-y-[var(--spacing-2)]">
              <Skeleton className="h-[var(--spacing-4)] w-[180px]" />
              <Skeleton className="h-[var(--spacing-4)] w-[240px]" />
              <Skeleton className="h-[var(--spacing-4)] w-[200px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message skeleton 2 - response */}
      <Card className="max-w-[80%] self-end">
        <CardContent className="pt-[var(--spacing-6)]">
          <div className="flex items-start gap-[var(--spacing-3)]">
            {/* Avatar skeleton */}
            <Skeleton className="h-[var(--spacing-8)] w-[var(--spacing-8)] rounded-full" />

            {/* Message content skeleton */}
            <div className="flex-1 space-y-[var(--spacing-2)]">
              <Skeleton className="h-[var(--spacing-4)] w-[160px]" />
              <Skeleton className="h-[var(--spacing-4)] w-[220px]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typing indicator skeleton */}
      <Card className="max-w-[80%]">
        <CardContent className="pt-[var(--spacing-6)]">
          <div className="flex items-start gap-[var(--spacing-3)]">
            <Skeleton className="h-[var(--spacing-8)] w-[var(--spacing-8)] rounded-full" />
            <div className="flex gap-[var(--spacing-1)]">
              <Skeleton className="h-[var(--spacing-2)] w-[var(--spacing-2)] animate-pulse rounded-full" />
              <Skeleton className="h-[var(--spacing-2)] w-[var(--spacing-2)] animate-pulse rounded-full [animation-delay:0.2s]" />
              <Skeleton className="h-[var(--spacing-2)] w-[var(--spacing-2)] animate-pulse rounded-full [animation-delay:0.4s]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
