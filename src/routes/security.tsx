import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

const TITLE = "Security at CareerGem — what we can and cannot see";
const DESCRIPTION =
  "Plain-language security model: your resume and reports are encrypted in your browser. Here is exactly what CareerGem stores, what it never stores, and the trade-offs.";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SecurityPage,
});

const visible = [
  ["Your display name and email", "Needed to sign you in and contact you about your account."],
  ["Your plan and billing status", "Set only by our payment processor, never editable by hand."],
  ["Assessment scores and dates", "Numbers and timestamps, so you can see progress over time."],
  ["Roadmap completion state", "Which items you checked off — not what they say."],
];

const invisible = [
  ["Your resume text", "Encrypted in your browser before upload. Stored as an unreadable blob."],
  ["Your assessment reports", "Same encryption. Gaps, actions, and notes are opaque to us."],
  ["Your job descriptions", "Sent once, in memory, for the assessment. Never written to a table."],
  ["Your encryption key", "Derived from your password on your device. It never leaves it."],
];

const controls = [
  {
    title: "Encryption",
    body: "AES-GCM, 256-bit, with keys derived via PBKDF2 from your password. Encryption and decryption happen in your browser using the platform WebCrypto API — not a library we rolled ourselves.",
  },
  {
    title: "Access control",
    body: "Every table enforces row-level security in the database, so a query can only ever return your own rows. Authorization is checked on the server for every request, not in the browser.",
  },
  {
    title: "Assessment processing",
    body: "Your resume reaches the assessment model exactly once per request, in memory, over an encrypted connection. It is not logged, cached, or used to train anything.",
  },
  {
    title: "Payments",
    body: "Card details go directly to our payment processor and never touch our servers. The processor also never receives any career data — only an account identifier and a price.",
  },
  {
    title: "Your controls",
    body: "Export everything you own at any time. Delete your account and every encrypted record permanently, from Settings, without contacting us.",
  },
];

function SecurityPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main id="main">
        <section className="relative overflow-hidden border-b border-hairline">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 starfield opacity-60" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 aurora opacity-70" />
          <div className="relative mx-auto max-w-3xl px-5 py-20">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">Security</p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight">
              What we can see, and what we cannot
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Most products ask you to trust a promise. CareerGem is built so the promise is not
              needed: the parts of your career that are sensitive are encrypted before they leave
              your device, with a key we never receive.
            </p>
          </div>
        </section>

        <section className="border-b border-hairline">
          <div className="mx-auto grid max-w-5xl gap-px overflow-hidden px-5 py-16 md:px-5">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-hairline bg-surface p-7">
                <h2 className="font-display text-xl font-semibold">What our servers can read</h2>
                <dl className="mt-6 space-y-5">
                  {visible.map(([term, body]) => (
                    <div key={term}>
                      <dt className="text-sm font-semibold">{term}</dt>
                      <dd className="mt-1 text-sm text-muted-foreground">{body}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-xl border border-signal/40 bg-surface p-7">
                <h2 className="font-display text-xl font-semibold text-signal">
                  What our servers can never read
                </h2>
                <dl className="mt-6 space-y-5">
                  {invisible.map(([term, body]) => (
                    <div key={term}>
                      <dt className="text-sm font-semibold">{term}</dt>
                      <dd className="mt-1 text-sm text-muted-foreground">{body}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-hairline bg-surface/40">
          <div className="mx-auto max-w-3xl px-5 py-16">
            <h2 className="font-display text-2xl font-semibold">How it is enforced</h2>
            <div className="mt-10 space-y-9">
              {controls.map((item) => (
                <article key={item.title} className="border-l-2 border-signal/50 pl-5">
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-hairline">
          <div className="mx-auto max-w-3xl px-5 py-16">
            <h2 className="font-display text-2xl font-semibold">The trade-off, stated plainly</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Because your key is derived from your password and never sent to us, we cannot reset
              it for you. If you forget your password, your encrypted history cannot be recovered
              by anyone — including us. That is the cost of a design where only you can read your
              own career data, and we would rather say it up front than bury it.
            </p>
          </div>
        </section>

        <section className="border-b border-hairline bg-surface/40">
          <div className="mx-auto max-w-3xl px-5 py-16">
            <h2 className="font-display text-2xl font-semibold">Reporting a security issue</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Found something that looks wrong? Tell us before telling anyone else, and we will work
              the fix with you. Reports about authentication, access control, or encryption get
              looked at first. We aim to acknowledge every report within two business days.
            </p>
            <div className="mt-8 rounded-xl border border-signal/40 bg-surface p-6">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">
                Security contact
              </p>
              <a
                href="mailto:cjgencompany@proton.me?subject=CareerGem%20security%20report"
                className="mt-3 inline-block font-display text-lg font-semibold underline underline-offset-4 hover:text-signal"
              >
                cjgencompany@proton.me
              </a>
              <p className="mt-3 text-sm text-muted-foreground">
                Use this address for vulnerability reports, privacy questions, and data deletion
                requests. Please do not include your resume, your password, or any decrypted report
                content in the message — we cannot read those by design, and we do not want copies.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start free
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/privacy">Read the privacy notice</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
