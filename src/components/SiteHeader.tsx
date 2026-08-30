import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const { session } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-signal focus:px-3 focus:py-2 focus:text-sm focus:text-signal-foreground"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Logo />
        <nav
          aria-label="Main"
          className="hidden items-center gap-7 text-sm text-muted-foreground md:flex"
        >
          <Link to="/how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link to="/security" className="transition-colors hover:text-foreground">
            Security
          </Link>
          <Link to="/faq" className="transition-colors hover:text-foreground">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Open CareerGem</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth" search={{ mode: "signin" }}>
                  Sign in
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start free
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* The desktop nav is hidden below md, so keep the same destinations
          reachable on small screens rather than relying on the footer. */}
      <nav
        aria-label="Main, compact"
        className="flex gap-5 overflow-x-auto border-t border-hairline px-5 py-2.5 text-sm text-muted-foreground md:hidden"
      >
        <Link to="/how-it-works" className="whitespace-nowrap">
          How it works
        </Link>
        <Link to="/pricing" className="whitespace-nowrap">
          Pricing
        </Link>
        <Link to="/security" className="whitespace-nowrap">
          Security
        </Link>
        <Link to="/faq" className="whitespace-nowrap">
          FAQ
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-surface/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} CareerGem. Your data stays yours.</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-5">
          <Link to="/how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link to="/faq" className="transition-colors hover:text-foreground">
            FAQ
          </Link>
          <Link to="/security" className="transition-colors hover:text-foreground">
            Security
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link to="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link to="/refunds" className="transition-colors hover:text-foreground">
            Refunds
          </Link>
        </nav>
      </div>
    </footer>
  );
}
