import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const { session } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Open CareerOS</Link>
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
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-surface/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} CareerOS. Your data stays yours.</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-5">
          <Link to="/how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </Link>
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            Privacy &amp; security
          </Link>
        </nav>
      </div>
    </footer>
  );
}