import { env } from "@/lib/env";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const isPlaceholder = (value: string) => {
    const normalized = value.trim().toLowerCase();
    return (
      normalized.startsWith("your-") ||
      normalized === "changeme" ||
      normalized.length === 0
    );
  };

  const googleClientId = env.GOOGLE_CLIENT_ID;
  const googleClientSecret = env.GOOGLE_CLIENT_SECRET;
  const googleSignInEnabled =
    !isPlaceholder(googleClientId) && !isPlaceholder(googleClientSecret);

  const enableTestCredentials =
    env.ENABLE_TEST_CREDENTIALS === "true" || !googleSignInEnabled;

  const cardDescription = googleSignInEnabled
    ? enableTestCredentials
      ? "Use the Google button or the test account below to continue."
      : "Continue with Google using your invite-only workspace account."
    : "Google sign-in is disabled in this environment. Update OAuth credentials or use the test account below.";

  const googleDisabledMessage = googleSignInEnabled
    ? undefined
    : "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env.local to enable Google sign-in.";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            enableTestCredentials={enableTestCredentials}
            googleSignInEnabled={googleSignInEnabled}
            googleDisabledMessage={googleDisabledMessage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
