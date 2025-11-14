import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * ErrorState Component
 *
 * Displays error messages with actionable recovery options.
 * Provides clear, user-friendly error feedback for API failures, validation errors,
 * and other exceptional conditions.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.title="Something went wrong"] - Error title
 * @param {string} [props.message="An unexpected error occurred. Please try again."] - Error message
 * @param {() => void} [props.onRetry] - Optional retry callback
 * @param {() => void} [props.onGoHome] - Optional go home callback
 * @param {"error" | "warning"} [props.variant="error"] - Error severity
 * @returns {JSX.Element} Error state UI
 *
 * @example
 * ```tsx
 * // API Error
 * {error && (
 *   <ErrorState
 *     title="Failed to send message"
 *     message="Could not connect to the AI service. Please check your connection."
 *     onRetry={handleRetry}
 *   />
 * )}
 *
 * // Validation Error
 * <ErrorState
 *   variant="warning"
 *   title="Invalid input"
 *   message="Message cannot be empty"
 * />
 * ```
 *
 * Design:
 * - Uses semantic colors (destructive for errors)
 * - Clear visual hierarchy with icons
 * - Actionable buttons for recovery
 * - Responsive layout
 */
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  variant?: "error" | "warning";
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  onGoHome,
  variant = "error",
}: ErrorStateProps) {
  const isError = variant === "error";

  return (
    <div className="flex h-full items-center justify-center p-[var(--spacing-4)]">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-[var(--spacing-6)]">
          <Alert variant={isError ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="mb-[var(--spacing-2)]">{title}</AlertTitle>
            <AlertDescription className="mb-[var(--spacing-4)]">
              {message}
            </AlertDescription>

            {/* Action buttons */}
            {(onRetry || onGoHome) && (
              <div className="flex gap-[var(--spacing-2)] mt-[var(--spacing-4)]">
                {onRetry && (
                  <Button
                    variant={isError ? "default" : "outline"}
                    size="sm"
                    onClick={onRetry}
                  >
                    <RefreshCw className="mr-[var(--spacing-2)] h-4 w-4" />
                    Try Again
                  </Button>
                )}
                {onGoHome && (
                  <Button variant="outline" size="sm" onClick={onGoHome}>
                    <Home className="mr-[var(--spacing-2)] h-4 w-4" />
                    Go Home
                  </Button>
                )}
              </div>
            )}
          </Alert>

          {/* Additional help text */}
          <div className="mt-[var(--spacing-6)] rounded-lg bg-muted p-[var(--spacing-4)] text-sm text-muted-foreground">
            <p className="font-medium mb-[var(--spacing-2)]">
              Common solutions:
            </p>
            <ul className="list-disc list-inside space-y-[var(--spacing-1)] text-sm">
              <li>Check your internet connection</li>
              <li>Refresh the page and try again</li>
              <li>Clear your browser cache</li>
              {isError && <li>Contact support if the problem persists</li>}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
