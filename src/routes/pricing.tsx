import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "CareerGem public beta — free private assessment" },
      {
        name: "description",
        content:
          "Join the CareerGem public beta for one private career assessment every 30 days. No card required.",
      },
      { property: "og:title", content: "CareerGem public beta" },
      {
        property: "og:description",
        content: "One private career assessment every 30 days. No card required.",
      },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">Pricing</p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight">
            Start with a private, free beta assessment
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            CareerGem is opening carefully. Public beta is free while we improve the assessment
            experience with early users. No card and no surprise renewal.
          </p>
        </div>

        <article className="mt-14 max-w-xl rounded-xl border border-signal/60 bg-surface-raised p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Open now</p>
          <h2 className="mt-4 font-display text-2xl font-semibold">CareerGem public beta</h2>
          <p className="mt-5 font-mono text-4xl font-semibold">Free</p>
          <p className="mt-1 text-sm text-muted-foreground">No card required</p>
          <ul className="mt-7 space-y-3 text-sm text-muted-foreground">
            {[
              "One private career assessment every 30 days",
              "Career score, ranked gaps, and your next move",
              "A focused 90-day action roadmap",
              "Encrypted browser-side career records",
              "Export or delete your data at any time",
            ].map((feature) => (
              <li key={feature} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-signal"
                />
                {feature}
              </li>
            ))}
          </ul>
          <Button asChild className="mt-8">
            <Link to="/auth" search={{ mode: "signup" }}>
              Join the beta
            </Link>
          </Button>
        </article>

        <p className="mt-10 max-w-2xl text-sm text-muted-foreground">
          Paid plans are not available during public beta. If and when they open, pricing and the
          subscription terms will be shown before any payment is requested.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
