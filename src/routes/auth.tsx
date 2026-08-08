import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

type Mode = "signin" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode: Mode } => ({
    mode: search["mode"] === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Sign in to CareerGem" },
      {
        name: "description",
        content:
          "Sign in or create your CareerGem account. Your career data is encrypted in your browser with a key only you hold.",
      },
      { property: "og:title", content: "Sign in to CareerGem" },
      {
        property: "og:description",
        content: "Create your encrypted CareerGem account and get your career score.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { signIn, signUp, session, profile, vaultKey } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session && vaultKey) {
      void navigate({ to: profile?.onboarding_complete ? "/dashboard" : "/onboarding" });
    }
  }, [session, vaultKey, profile, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        await signUp(email, password, displayName.trim());
        setNotice(
          "Account created. If we ask you to confirm your email, do that and then sign in.",
        );
      } else {
        await signIn(email, password);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-xl border border-hairline bg-surface p-7">
          <h1 className="font-display text-2xl font-semibold">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignup
              ? "Fourteen days free. No card required."
              : "Enter your details to unlock your encrypted vault."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {isSignup ? (
              <div className="space-y-2">
                <Label htmlFor="display-name">Name</Label>
                <Input
                  id="display-name"
                  autoComplete="name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={10}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                aria-describedby="password-hint"
              />
              <p id="password-hint" className="text-xs text-muted-foreground">
                {isSignup
                  ? "At least 10 characters. This password also encrypts your data."
                  : "The same password that encrypts your data."}
              </p>
            </div>

            {isSignup ? (
              <div className="rounded-md border border-warning/40 bg-warning/10 p-4">
                <p className="text-sm">
                  <strong className="font-semibold">Read this before continuing.</strong> Your
                  password is also your encryption key. We never see it, so if you lose it we
                  cannot recover your assessments — nobody can. Store it in a password manager.
                </p>
                <label className="mt-3 flex items-start gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                    className="mt-0.5 size-4 rounded border-input accent-[oklch(0.72_0.15_215)]"
                    required
                  />
                  <span>I understand my data is unrecoverable if I forget my password.</span>
                </label>
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p role="status" className="text-sm text-success">
                {notice}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={busy || (isSignup && !acknowledged)}
            >
              {busy ? "Working…" : isSignup ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            {isSignup ? "Already have an account? " : "New to CareerOS? "}
            <Link
              to="/auth"
              search={{ mode: isSignup ? "signin" : "signup" }}
              className="text-foreground underline underline-offset-4"
            >
              {isSignup ? "Sign in" : "Create one"}
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="underline underline-offset-4">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}