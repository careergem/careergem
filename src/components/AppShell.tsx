import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Logo } from "@/components/Logo";
import { VaultLock } from "@/components/VaultLock";
import { Button } from "@/components/ui/button";
import { hasAccess, trialDaysLeft, useAuth } from "@/hooks/useAuth";
import { PUBLIC_BETA } from "@/lib/launch";
import { useSignOut } from "@/hooks/useSignOut";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/assessment/new", label: "New assessment" },
  { to: "/assessments", label: "History" },
  { to: "/settings", label: "Settings" },
] as const;

/**
 * Wraps every signed-in screen: vault gate, nav, trial banner.
 *
 * Authentication itself is enforced by the `_authenticated` route gate, so no
 * component-level redirect is needed (or wanted — it would race the router).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { session, loading, vaultKey, profile } = useAuth();
  const signOut = useSignOut();

  if (loading || !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          Loading…
        </p>
      </div>
    );
  }

  if (!vaultKey) return <VaultLock />;

  const daysLeft = trialDaysLeft(profile);
  const paid = profile?.plan === "active";

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-signal focus:px-3 focus:py-2 focus:text-sm focus:text-signal-foreground"
      >
        Skip to content
      </a>

      <header className="border-b border-hairline bg-surface/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-8">
            <Logo to="/dashboard" />
            <nav aria-label="Application" className="hidden items-center gap-6 text-sm md:flex">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{ className: "text-foreground font-medium" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
              {paid ? "Subscribed" : PUBLIC_BETA ? "Public beta" : `Trial · ${daysLeft}d left`}
            </span>
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>
        <nav
          aria-label="Application, compact"
          className="flex gap-5 overflow-x-auto border-t border-hairline px-5 py-3 text-sm md:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="whitespace-nowrap text-muted-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {!PUBLIC_BETA && !hasAccess(profile) ? (
        <div className="border-b border-warning/30 bg-warning/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
            <p>Your free trial has ended. Subscribe to run new assessments.</p>
            <Button asChild size="sm">
              <Link to="/pricing">See plans</Link>
            </Button>
          </div>
        </div>
      ) : null}

      <main id="main" className="mx-auto max-w-6xl px-5 py-10">
        {children}
      </main>
    </div>
  );
}
