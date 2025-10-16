"use client";
import { env } from "@/lib/env";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type LoginFormProps = React.HTMLAttributes<HTMLDivElement>;

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [isCredentialsLoading, setIsCredentialsLoading] =
    React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const showTestCredentials = env.ENABLE_TEST_CREDENTIALS === "true";

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn("google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCredentialLogin = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    setIsCredentialsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsCredentialsLoading(false);

    if (result?.ok) {
      router.push("/");
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="w-full"
      >
        {isGoogleLoading ? <Spinner size="sm" className="mr-2" /> : null}
        Sign in with Google
      </Button>

      {showTestCredentials ? (
        <div className="grid gap-3">
          <p className="text-muted-foreground text-center text-sm">
            Test login is available below for automated checks.
          </p>
          <form onSubmit={handleCredentialLogin} className="grid gap-4">
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="Email address"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isCredentialsLoading}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="password">
                  Password
                </Label>
                <Input
                  id="password"
                  placeholder="Password"
                  type="password"
                  autoComplete="current-password"
                  disabled={isCredentialsLoading}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isCredentialsLoading}
              className="w-full"
            >
              {isCredentialsLoading ? (
                <Spinner size="sm" className="mr-2" />
              ) : null}
              Sign In
            </Button>
          </form>
        </div>
      ) : (
        <p className="text-muted-foreground text-center text-sm">
          You&apos;ll be redirected to Google to sign in with your invited
          account.
        </p>
      )}
    </div>
  );
}
