import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How CareerOS works — score, gaps, 90-day plan" },
      {
        name: "description",
        content:
          "Inside a CareerOS assessment: how the career score is calibrated, how gaps are ranked by impact, and how the 90-day roadmap is built.",
      },
      { property: "og:title", content: "How CareerOS works" },
      {
        property: "og:description",
        content:
          "How the career score is calibrated, how gaps are ranked, and how your 90-day roadmap is built.",
      },
    ],
  }),
  component: HowItWorks,
});

const sections = [
  {
    title: "The career score",
    body: "A single 0–100 number, calibrated against how hiring managers actually screen. Below 40 means you would not pass an initial screen. 60–74 means you are competitive somewhere but have named gaps. Above 75 means you get interviews at most companies. The bands are fixed, so the number means the same thing every time you re-run it.",
    detail: [
      "Technical depth — is the skill claim backed by evidence?",
      "Evidence of impact — did anything measurably change because of you?",
      "Credibility signals — projects, open source, publications, competitions.",
      "Market alignment — does your profile match what this role hires for?",
      "Presentation — can a recruiter extract the signal in ten seconds?",
    ],
  },
  {
    title: "The gap analysis",
    body: "Every gap is specific and ranked high, medium, or low impact — because 'get more experience' is not advice. You get the gap, why it costs you interviews for this specific role, and where it sits in the queue.",
    detail: [],
  },
  {
    title: "The 90-day roadmap",
    body: "Three 30-day blocks, each with a focus and a handful of concrete, verifiable actions. Check them off as you go. When the block is done, re-run the assessment against the same target role and compare scores.",
    detail: [],
  },
  {
    title: "The privacy model",
    body: "Your resume and your reports are encrypted in your browser before they are stored. The encryption key is derived from your password and never leaves your device. The trade-off is real and worth stating plainly: if you forget your password, your history cannot be recovered by anyone, including us.",
    detail: [],
  },
];

function HowItWorks() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-5 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">How it works</p>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-tight">
          What actually happens inside an assessment
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          CareerOS does not write your resume for you. It tells you what a hiring manager
          sees, what is missing, and what to do about it in the next 90 days.
        </p>

        <div className="mt-14 space-y-12">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl font-semibold">{section.title}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{section.body}</p>
              {section.detail.length > 0 ? (
                <ul className="mt-5 space-y-2.5">
                  {section.detail.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-xl border border-hairline bg-surface p-7">
          <h2 className="font-display text-xl font-semibold">Ready to see your number?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fourteen days free, one assessment included, no card required.
          </p>
          <Button asChild className="mt-6">
            <Link to="/auth" search={{ mode: "signup" }}>
              Start free
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}