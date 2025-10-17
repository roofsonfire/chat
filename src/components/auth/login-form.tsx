"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

type LoginFormProps = React.HTMLAttributes<HTMLDivElement> & {
  enableTestCredentials?: boolean;
};

export function LoginForm({
  className,
  enableTestCredentials = false,
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [isCredentialsLoading, setIsCredentialsLoading] =
    React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [rememberMe, setRememberMe] = React.useState<boolean>(false);
  const [acceptTerms, setAcceptTerms] = React.useState<boolean>(false);
  const showTestCredentials = enableTestCredentials;

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
            <div className="flex items-center space-x-2">
              <Switch
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                disabled={isCredentialsLoading}
              />
              <Label htmlFor="remember-me" className="text-sm">
                Remember me
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="accept-terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                disabled={isCredentialsLoading}
              />
              <Label htmlFor="accept-terms" className="text-sm">
                I accept the{" "}
                <a
                  href="#"
                  className="hover:text-primary underline underline-offset-4"
                >
                  Terms and Conditions
                </a>
              </Label>
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
