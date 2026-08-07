import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "CareerOS pricing — 14 days free, then $15/month" },
      {
        name: "description",
        content:
          "Start with a 14-day free trial including one full assessment. Then $15/month or $120/year for unlimited re-assessments and roadmap tracking.",
      },
      { property: "og:title", content: "CareerOS pricing" },
      {
        property: "og:description",
        content: "14 days free, then $15/month or $120/year for unlimited assessments.",
      },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Trial",
    price: "Free",
    cadence: "for 14 days",
    features: [
      "One full career assessment",
      "Career score and sub-scores",
      "Ranked gap analysis",
      "Your 90-day roadmap",
      "No card required",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Monthly",
    price: "$15",
    cadence: "per month",
    features: [
      "Unlimited re-assessments",
      "Score history and trend",
      "Roadmap progress tracking",
      "Full data export",
      "Cancel any time",
    ],
    cta: "Choose monthly",
    highlight: true,
  },
  {
    name: "Yearly",
    price: "$120",
    cadence: "per year",
    features: [
      "Everything in Monthly",
      "Two months free",
      "Best for a full job search cycle",
    ],
    cta: "Choose yearly",
    highlight: false,
  },
];

function Pricing() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">Pricing</p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight">
            Cheaper than one week of the salary you are leaving behind
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Start free. Subscribe when the first assessment shows you something you did not know.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col rounded-xl border p-7 ${
                plan.highlight
                  ? "border-signal/60 bg-surface-raised"
                  : "border-hairline bg-surface"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-semibold">{plan.name}</h2>
                {plan.highlight ? (
                  <span className="rounded-full border border-signal/50 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-signal">
                    Popular
                  </span>
                ) : null}
              </div>
              <p className="mt-6 font-mono text-4xl font-semibold">{plan.price}</p>
              <p className="mt-1 text-sm text-muted-foreground">{plan.cadence}</p>
              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-muted-foreground">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-8"
                variant={plan.highlight ? "default" : "outline"}
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  {plan.cta}
                </Link>
              </Button>
            </article>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          Checkout is not connected yet — subscriptions are the next step to wire up. Trials
          work today and every account starts with 14 days of full access.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}