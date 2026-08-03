import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerOS — Know exactly what to do next" },
      {
        name: "description",
        content:
          "CareerOS scores your resume against a target role, ranks your real gaps, and gives you a 90-day plan. Encrypted in your browser — only you can read it.",
      },
      { property: "og:title", content: "CareerOS — Know exactly what to do next" },
      {
        property: "og:description",
        content:
          "A calibrated career score, a ranked gap analysis, and a 90-day roadmap for early-career engineers.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "CareerOS",
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
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden border-b border-hairline">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-etch opacity-[0.35]" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-signal/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">
              The operating system for your career
            </p>
            <h1 className="mt-6 max-w-3xl text-balance-tight font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
              Stop collecting career advice. Start knowing your next move.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Every rejection teaches you something six months too late. CareerOS reads your
              resume the way a hiring manager reads it, tells you the exact gaps standing
              between you and the role you want, and hands you a 90-day plan to close them.
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
                <Link to="/privacy">Read exactly how it works</Link>
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

        <section className="mx-auto max-w-6xl px-5 py-24 text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            One assessment is enough to see what you have been missing.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Fourteen days free. Then $15 a month — less than a single day of the salary you
            are leaving on the table.
          </p>
          <Button asChild size="lg" className="mt-9">
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
