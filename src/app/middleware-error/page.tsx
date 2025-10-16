"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MiddlewareErrorPage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="text-destructive mx-auto h-16 w-16" />
          <CardTitle className="text-2xl">Application Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground text-sm">
            We&apos;re sorry, but a critical error occurred that prevented the
            page from loading correctly. This may be a temporary issue.
          </p>
          <p className="text-muted-foreground text-sm">
            Please try again in a few moments. If the problem persists, please
            contact support.
          </p>
          <Button onClick={handleRetry} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
