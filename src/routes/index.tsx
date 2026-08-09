import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerGem — Navigate Your Career Odyssey" },
      {
        name: "description",
        content:
          "CareerGem is your AI career navigator: score your resume against a target role, chart your real gaps, and launch a 90-day flight plan. Encrypted in-browser.",
      },
      { property: "og:title", content: "CareerGem — Navigate Your Career Odyssey" },
      {
        property: "og:description",
        content:
          "CareerGem is your AI career navigator: score your resume against a target role, chart your real gaps, and launch a 90-day flight plan. Encrypted in-browser.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "CareerGem",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web, iOS, Android",
          description:
            "AI career navigation for early-career STEM professionals: career score, gap analysis, and a 90-day roadmap.",
          offers: {
            "@type": "Offer",
            price: "15.00",
            priceCurrency: "USD",
          },
        }),
      },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    step: "01",
    title: "Give it your resume and a target role",
    body: "Paste your resume and the job description you are aiming at. Both are encrypted in your browser before anything is saved.",
  },
  {
    step: "02",
    title: "Get scored the way a hiring manager scores you",
    body: "One calibrated number, plus sub-scores for technical depth, evidence of impact, credibility signals, market alignment, and presentation.",
  },
  {
    step: "03",
    title: "Work the 90-day roadmap",
    body: "Three 30-day blocks of concrete actions, ranked by impact. Check them off, re-run the assessment, and watch the score move.",
  },
];

function Landing() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <main id="main">
        <section className="relative overflow-hidden border-b border-hairline">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-etch opacity-[0.35]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 starfield opacity-70" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 aurora" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-nebula/15 blur-3xl"
          />
          <div className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">
              Job hunting for STEM, made digestible
            </p>
            <h1 className="mt-6 max-w-3xl text-balance-tight font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
              Stop collecting career advice.{" "}
              <span className="text-orbit">Start knowing your next move.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Every rejection teaches you something six months too late. CareerGem reads your
              resume the way a hiring manager reads it, breaks the STEM job hunt into steps you
              can actually act on, and hands you a 90-day plan that turns guesswork into a
              confident candidacy.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start your 14-day trial
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/how-it-works">See how it works</Link>
              </Button>
            </div>
            <p className="mt-5 font-mono text-xs text-muted-foreground">
              No card required · Encrypted in your browser · Delete everything in one click
            </p>
          </div>
        </section>

        <section className="border-b border-hairline bg-surface/40">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="max-w-2xl font-display text-3xl font-semibold">
              The career market has hidden rules. Most people learn them by losing.
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-3">
              {steps.map((item) => (
                <article key={item.step} className="bg-surface p-7">
                  <p className="font-mono text-sm text-signal">{item.step}</p>
                  <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-hairline">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-semibold">
                Your career data is yours. Structurally, not as a promise.
              </h2>
              <p className="mt-5 text-muted-foreground">
                Your resume and every report are encrypted in your browser with a key derived
                from your password. The key never leaves your device. What lands in our
                database is an unreadable blob — we could not read your resume if we wanted to.
              </p>
              <Button asChild variant="outline" className="mt-7">
                <Link to="/security">See what we can and cannot read</Link>
              </Button>
            </div>
            <dl className="space-y-6">
              {[
                ["Encrypted before it leaves your device", "AES-GCM with a key derived from your password. Not stored, not transmitted."],
                ["Nothing kept from the analysis", "Your resume reaches the model once, in memory, per request. It is never written to a table or log."],
                ["Export or erase, any time", "One button gives you everything. One button destroys everything, permanently."],
              ].map(([term, description]) => (
                <div key={term} className="border-l-2 border-signal/50 pl-5">
                  <dt className="font-display text-base font-semibold">{term}</dt>
                  <dd className="mt-1.5 text-sm text-muted-foreground">{description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="relative overflow-hidden px-5 py-24 text-center">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 aurora opacity-80" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 starfield opacity-50" />
          <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            One assessment is enough to see what you have been missing.
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-muted-foreground">
            Fourteen days free. Then $15 a month — less than a single day of the salary you
            are leaving on the table.
          </p>
          <Button asChild size="lg" className="relative mt-9">
            <Link to="/auth" search={{ mode: "signup" }}>
              Get my career score
            </Link>
          </Button>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
