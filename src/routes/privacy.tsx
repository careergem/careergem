import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy at CareerGem — encrypted in your browser" },
      {
        name: "description",
        content:
          "How CareerGem handles your data: browser-side AES-GCM encryption, a key derived from your password that never leaves your device, and one-click deletion.",
      },
      { property: "og:title", content: "Privacy at CareerGem" },
      {
        property: "og:description",
        content:
          "Browser-side encryption, a key that never leaves your device, and one-click deletion.",
      },
    ],
  }),
  component: Privacy,
});

const rows: Array<[string, string]> = [
  [
    "Email address",
    "Stored in plaintext — it is how you sign in and how we reach you about your account.",
  ],
  ["Display name", "Stored in plaintext so the app can greet you."],
  [
    "Optional school, graduation timing, and interests",
    "Encrypted in your browser. Never used in an assessment.",
  ],
  ["Resume text", "Encrypted in your browser before it is sent. Stored only as ciphertext."],
  ["Target role / job description", "Encrypted in your browser. Stored only as ciphertext."],
  ["Assessment reports", "Encrypted in your browser. Stored only as ciphertext."],
  [
    "Career score",
    "Stored as a plain number so the app can chart your trend. It carries no personal detail on its own.",
  ],
  [
    "Roadmap completion state",
    "Stored as a plain true/false per item, with the item text encrypted.",
  ],
];

function Privacy() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-5 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">Privacy</p>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-tight">
          We built CareerGem so that we cannot read your resume
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          This page is maintained by the CareerGem team to describe how the app handles your data.
          It is a description of the product's behaviour, not an independent audit or certification.
        </p>

        <aside className="mt-8 rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm text-muted-foreground">
          <strong className="font-semibold text-foreground">Development-policy draft.</strong> This
          text is prepared for an Ontario, Canada-first launch. Before CareerGem opens paid
          subscriptions to the public, it needs a qualified Canadian legal review plus the operating
          legal name and a working privacy contact email.
        </aside>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Who this policy covers</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            This policy describes how CareerGem processes personal information when you use the
            website and service. CareerGem is intended for people aged 18 and over. Do not create an
            account or submit personal information if you are under 18.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">The mechanism</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            When you set your password, your browser derives an encryption key from it using PBKDF2
            with a per-account random salt. That key stays in memory in your browser tab. It is
            never sent to our servers, never written to disk, and never included in a network
            request. Every sensitive field is encrypted with AES-GCM using that key before it leaves
            your device, so what our database stores is ciphertext.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Because the key lives only in memory, you will be asked for your password again after a
            reload or in a new tab. That is the mechanism working, not a bug.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">What is stored, field by field</h2>
          <div className="mt-6 overflow-hidden rounded-xl border border-hairline">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                CareerGem data fields and how each one is stored
              </caption>
              <thead className="bg-surface-raised">
                <tr>
                  <th scope="col" className="px-4 py-3 font-display font-semibold">
                    Data
                  </th>
                  <th scope="col" className="px-4 py-3 font-display font-semibold">
                    How it is stored
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([field, treatment]) => (
                  <tr key={field} className="border-t border-hairline bg-surface align-top">
                    <th scope="row" className="px-4 py-3 font-medium text-foreground">
                      {field}
                    </th>
                    <td className="px-4 py-3 text-muted-foreground">{treatment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">The AI analysis</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Running an assessment is the one moment your resume text exists in readable form outside
            your browser. It is decrypted in your tab, sent over TLS to our server function, passed
            to the AI model, and discarded when the request ends. It is never written to a table, a
            file, or a log, and it is not used to train any model.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Why we use this information</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We use account details to authenticate you, provide support, protect the service, and
            communicate essential account or billing information. We use the career material you
            choose to submit only to generate the requested assessment and related roadmap. Optional
            school, graduation timing, and interests are stored for your own reference and are not
            included in the assessment request.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Optional beta feedback is different: it is stored in readable form so the CareerGem team
            can prioritize product improvements. The feedback form tells you not to include resume
            text, assessment content, or personal details; please follow that instruction.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We do not sell career data or use it for advertising. We start without third-party
            behavioural advertising analytics. If that changes, we will update this policy before
            enabling it.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Service providers</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            CareerGem relies on service providers to host the application, authenticate accounts and
            store encrypted records, process payments, and perform the requested AI assessment. They
            receive only the information needed for their part of the service. Payment processing is
            handled by Stripe; card numbers do not pass through CareerGem. Providers may process
            information outside your province or Canada, subject to their own security and legal
            obligations.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Retention and deletion</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Your encrypted assessments and profile data remain in your account until you delete them
            or delete the account. You can export your readable data before deletion from Settings.
            We may keep limited billing and security records where needed to resolve a dispute,
            prevent fraud, or meet a legal obligation. Stripe retains payment records under its own
            policies.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">The trade-off, stated plainly</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Real encryption has a real cost: if you forget your password, your encrypted history is
            unrecoverable. Not by support, not by us, not by anyone. You can always reset your
            password and start a new vault, but past assessments stay locked. This is the direct
            consequence of us not holding your key.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Your controls</h2>
          <ul className="mt-5 space-y-3">
            {[
              "Export everything you have stored, decrypted, as a JSON file.",
              "Delete any single assessment permanently.",
              "Delete your entire account and all associated rows in one action.",
              "Access is enforced per-row in the database, so no account can read another's data.",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-signal"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Questions, access, and concerns</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Before public paid launch, this section will list CareerGem's legal operator, privacy
            contact email, and a straightforward process for an access, correction, deletion, or
            privacy concern. You may also have a right to complain to the Office of the Privacy
            Commissioner of Canada or another applicable privacy regulator. This draft does not
            limit those rights.
          </p>
        </section>

        <div className="mt-16 rounded-xl border border-hairline bg-surface p-7">
          <h2 className="font-display text-xl font-semibold">Questions about your data?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every claim on this page is something you can verify in the app itself — the settings
            screen shows exactly what is stored for your account.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/auth" search={{ mode: "signup" }}>
              Create an account
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
