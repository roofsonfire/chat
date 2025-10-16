import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

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
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
            <Spinner size="lg" />
            <p className="text-muted-foreground text-center text-sm">
              {message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-fit">
      <CardContent className="flex items-center justify-center gap-2 p-4">
        <Spinner size="md" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </CardContent>
    </Card>
  );
}
