import { Spinner } from "@/components/ui/spinner";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Loading component with optional message.
 * Can be used as a full-screen loader or inline.
 */
export function Loading({
  message = "Loading...",
  fullScreen = true,
}: LoadingProps) {
  if (fullScreen) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      <Spinner size="md" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
