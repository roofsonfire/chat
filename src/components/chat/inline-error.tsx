import { AlertCircle } from "lucide-react";

/**
 * InlineError Component
 *
 * Compact error display for inline usage (e.g., form validation).
 * Less intrusive than ErrorState, suitable for small contextual errors.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @returns {JSX.Element} Inline error UI
 *
 * @example
 * ```tsx
 * {errorMessage && <InlineError message={errorMessage} />}
 * ```
 */
interface InlineErrorProps {
  message: string;
}

export function InlineError({ message }: InlineErrorProps) {
  return (
    <div className="bg-destructive/10 text-destructive flex items-center gap-[var(--spacing-2)] rounded-md p-[var(--spacing-3)] text-sm">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
}
