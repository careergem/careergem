import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

const TITLE = "CareerGem FAQ — scores, pricing, refunds, and your data";
const DESCRIPTION =
  "Straight answers about how the career score works, what the free beta includes, how pricing and refunds will work, and exactly what CareerGem can and cannot see.";

const CONTACT_EMAIL = "cjgencompany@proton.me";

type Faq = { q: string; a: string };
type FaqGroup = { heading: string; items: Faq[] };

const groups: FaqGroup[] = [
  {
    heading: "The assessment",
    items: [
      {
        q: "What do I actually get from an assessment?",
        a: "A calibrated 0–100 career score for your target role, your gaps ranked by how much each one costs you in interviews, and concrete actions laid out across a 90-day plan. Not a rewrite of your resume, and not encouragement.",
      },
      {
        q: "How is the score calculated?",
        a: "Your resume is compared against the typical hiring bar for your target role across technical depth, evidence of impact, credibility signals, market alignment, and presentation. The scoring bands are fixed, so re-running the same resume gives you the same number — that is what makes progress measurable.",
      },
      {
        q: "Who is this for?",
        a: "Early-career STEM professionals — engineering, software, data, sciences — who are getting rejections without explanations and want to know which specific gap to close first.",
      },
      {
        q: "How accurate is it?",
        a: "It is a structured second opinion, not a hiring decision. The score reflects how your written evidence reads against a role's typical bar. It cannot see your interviews, your referrals, or a specific company's internal criteria, and it will not pretend to.",
      },
    ],
  },
  {
    heading: "Pricing and billing",
    items: [
      {
        q: "What does it cost right now?",
        a: "Nothing. CareerGem is in public beta and the beta is free, with no card required and no surprise renewal. You get one private assessment every 30 days, your score, your ranked gaps, and a 90-day roadmap.",
      },
      {
        q: "Will there be a paid plan later?",
        a: "Most likely, yes — but paid plans are not available during public beta, and nothing is charged today. If and when they open, the price and the subscription terms will be shown in full before any payment is requested. Existing beta accounts will not be silently converted into a paid subscription.",
      },
      {
        q: "Will you ever charge my card without asking?",
        a: "No. There is no card on file during beta because we never collect one. Any future paid plan requires you to actively start a checkout and confirm the amount first.",
      },
      {
        q: "How will payments be handled?",
        a: "Through Stripe. Card details go directly to Stripe and never touch CareerGem's servers — we never see or store a card number. Stripe also never receives any career data, only an account identifier and a price.",
      },
    ],
  },
  {
    heading: "Cancellation and refunds",
    items: [
      {
        q: "How do I cancel?",
        a: "During the free beta there is nothing to cancel — you can simply stop using the account, or delete it outright from Settings. Once paid plans exist, you will cancel yourself from Settings through the Stripe billing portal, and cancellation stops the next renewal without needing to contact anyone.",
      },
      {
        q: "Do I lose access the moment I cancel?",
        a: "No. Cancelling stops the next renewal, and your paid access continues through the end of the billing period you already paid for. After that the account drops back to the free tier rather than being deleted.",
      },
      {
        q: "What is the refund policy?",
        a: "The current draft policy for paid plans is that payments are generally non-refundable and prorated refunds are not issued for the unused portion of a period. That does not affect any refund or cancellation right you have under applicable law. We do review duplicate charges, a technical failure that prevented access, and suspected unauthorized charges — email us and we will sort it out.",
      },
      {
        q: "Who do I contact about a billing problem?",
        a: `Email ${CONTACT_EMAIL} with the date and amount of the charge. Please do not send card numbers — we do not need them and cannot use them. See the Refund and Cancellation Policy page for the full terms.`,
      },
    ],
  },
  {
    heading: "Your data",
    items: [
      {
        q: "Can CareerGem read my resume?",
        a: "No. Your resume and every report are encrypted in your browser with a key derived from your password, which never leaves your device. Our servers store an unreadable blob. The assessment itself happens in memory, once per request, and is never written down.",
      },
      {
        q: "So what can your servers actually see?",
        a: "Your display name and email, your plan status, your assessment scores and dates, and which roadmap items you checked off. Numbers and timestamps — not the contents. Everything sensitive is encrypted before it leaves your browser.",
      },
      {
        q: "Is my resume used to train models?",
        a: "No. Your resume reaches the assessment model exactly once per request, in memory, over an encrypted connection. It is not logged, cached, retained, or used as training data.",
      },
      {
        q: "Can I export or delete everything?",
        a: "Yes, both, at any time, from Settings — no email required and no retention hold. Deleting your account permanently removes your encrypted records. Because we cannot read them, there is no hidden readable copy to leave behind.",
      },
      {
        q: "What happens if I forget my password?",
        a: "Your encrypted history cannot be recovered — by us or by anyone. That is the direct consequence of holding the only key yourself. Treat your password like the key to a safe deposit box, and use a password manager.",
      },
      {
        q: "What if there were a breach of your database?",
        a: "An attacker with a full copy of the database would get account emails, scores, and dates, plus encrypted blobs they cannot decrypt without each user's password-derived key. That is the entire point of the design: the sensitive material is useless without a key we never hold.",
      },
      {
        q: "Do you sell data or share it with recruiters?",
        a: "No. We do not sell, rent, or share your data with recruiters, employers, advertisers, or data brokers. We could not hand over your career records in readable form even if we wanted to.",
      },
      {
        q: "How do I reach a human about privacy or security?",
        a: `Email ${CONTACT_EMAIL}. Use it for privacy questions, data deletion requests, and vulnerability reports. Please do not include your resume, your password, or decrypted report content — we cannot read those by design and we do not want copies.`,
      },
    ],
  },
];

const faqs: Faq[] = groups.flatMap((group) => group.items);

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-");



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
          Short answers, no hedging. If something here is unclear, that is a bug in our writing —
          tell us at{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="underline underline-offset-4 hover:text-signal"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <nav aria-label="FAQ sections" className="mt-10 flex flex-wrap gap-2">
          {groups.map((group) => (
            <a
              key={group.heading}
              href={`#${slugify(group.heading)}`}
              className="rounded-full border border-hairline px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-signal/60 hover:text-foreground"
            >
              {group.heading}
            </a>
          ))}
        </nav>

        {groups.map((group) => (
          <section key={group.heading} className="mt-14 scroll-mt-24" id={slugify(group.heading)}>
            <h2 className="font-display text-2xl font-semibold">{group.heading}</h2>
            <dl className="mt-6 divide-y divide-hairline border-y border-hairline">
              {group.items.map((item) => (
                <div key={item.q} className="py-7">
                  <dt className="font-display text-lg font-semibold">{item.q}</dt>
                  <dd className="mt-3 leading-relaxed text-muted-foreground">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <div className="mt-14 rounded-xl border border-hairline bg-surface p-7">
          <h2 className="font-display text-xl font-semibold">Still have a question?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline underline-offset-4 hover:text-signal"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            for anything about billing, privacy, or security. Or read the security model — it is the
            part most people want to check first.
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
            <Button asChild variant="outline">
              <Link to="/refunds">Refund policy</Link>
            </Button>
          </div>
        </div>

      </main>
      <SiteFooter />
    </div>
  );
}
