import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

const TITLE = "CareerGem FAQ — scores, privacy, pricing, and limits";
const DESCRIPTION =
  "Straight answers about how the career score works, what CareerGem can and cannot see, what the free trial includes, and how to cancel.";

const faqs = [
  {
    q: "What do I actually get from an assessment?",
    a: "A calibrated 0–100 career score for your target role, your gaps ranked by how much each one costs you in interviews, and 3–5 concrete actions per role laid out across a 90-day plan. Not a rewrite of your resume, and not encouragement.",
  },
  {
    q: "How is the score calculated?",
    a: "Your resume is compared against the typical hiring bar for each target role across technical depth, evidence of impact, credibility signals, market alignment, and presentation. The scoring bands are fixed, so re-running the same resume gives you the same number — that is what makes progress measurable.",
  },
  {
    q: "Can CareerGem read my resume?",
    a: "No. Your resume and every report are encrypted in your browser with a key derived from your password, which never leaves your device. Our servers store an unreadable blob. The assessment itself happens in memory, once per request, and is never written down.",
  },
  {
    q: "What happens if I forget my password?",
    a: "Your encrypted history cannot be recovered — by us or by anyone. That is the direct consequence of holding the only key yourself. Treat your password like the key to a safe deposit box, and use a password manager.",
  },
  {
    q: "What does the free trial include?",
    a: "Fourteen days, no card required, one full assessment against one target role with your top actions. It is enough to see whether the analysis is accurate about you before you pay anything.",
  },
  {
    q: "What does Pro add?",
    a: "Unlimited assessments, up to five target roles at once, every action with its resources and time estimates, and progress tracking across re-assessments so you can watch the score move.",
  },
  {
    q: "How much is it and can I cancel?",
    a: "$15 a month or $120 a year. You can cancel any time from Settings through the billing portal; access continues to the end of the period you already paid for.",
  },
  {
    q: "Who is this for?",
    a: "Early-career STEM professionals — engineering, software, data, sciences — who are getting rejections without explanations and want to know which specific gap to close first.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-5 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">FAQ</p>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-tight">
          Questions worth asking before you upload a resume
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Short answers, no hedging. If something here is unclear, that is a bug in our writing.
        </p>

        <dl className="mt-14 divide-y divide-hairline border-y border-hairline">
          {faqs.map((item) => (
            <div key={item.q} className="py-7">
              <dt className="font-display text-lg font-semibold">{item.q}</dt>
              <dd className="mt-3 leading-relaxed text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 rounded-xl border border-hairline bg-surface p-7">
          <h2 className="font-display text-xl font-semibold">Still deciding?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Read the security model first — it is the part most people want to check.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Start free
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/security">See the security model</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
