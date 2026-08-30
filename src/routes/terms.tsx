import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

const LAST_UPDATED = "August 30, 2026";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — CareerGem" },
      {
        name: "description",
        content: "The draft terms that govern use of CareerGem's career-assessment service.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-5 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">Legal</p>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-tight">Terms of Use</h1>
        <p className="mt-5 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <DraftNotice />

        <div className="mt-12 space-y-10 leading-relaxed text-muted-foreground">
          <PolicySection title="1. Agreement and eligibility">
            <p>
              These Terms govern your use of CareerGem. By creating an account or using the service,
              you agree to them. You must be at least 18 years old and able to form a binding
              agreement where you live. Do not use CareerGem if you do not meet those requirements.
            </p>
          </PolicySection>

          <PolicySection title="2. What CareerGem provides">
            <p>
              CareerGem provides software that analyzes career materials and generates general
              educational guidance for STEM students and early-career candidates. It is not an
              employer, recruiter, school, legal adviser, financial adviser, licensed career
              counsellor, or job-placement service. It does not guarantee an interview, offer,
              salary, admission, or career outcome. Use your own judgment before acting on any
              output.
            </p>
          </PolicySection>

          <PolicySection title="3. Your account and content">
            <p>
              Keep your login credentials secure and do not share your account. You are responsible
              for the materials you submit, including confirming that you have the right to share
              them with CareerGem and its service providers for the assessment. Do not upload
              another person's resume, confidential employer information, or unlawful material
              without the required permission.
            </p>
          </PolicySection>

          <PolicySection title="4. Subscriptions and cancellation">
            <p>
              Paid plans are optional. Prices, currency, included features, and renewal interval are
              shown at checkout. A subscription renews automatically until you cancel it through the
              Stripe Customer Portal in CareerGem Settings. Cancellation takes effect at the end of
              the paid billing period; you keep paid access until then. Payment processing is
              handled by Stripe and is also subject to Stripe's terms.
            </p>
            <p className="mt-4">
              Our current refund approach is described in the{" "}
              <Link to="/refunds" className="underline underline-offset-4">
                Refund and Cancellation Policy
              </Link>
              . Nothing in these Terms limits rights that cannot be waived under applicable
              consumer-protection law.
            </p>
          </PolicySection>

          <PolicySection title="5. Acceptable use">
            <p>
              You may not misuse the service, bypass limits or security measures, scrape or reverse
              engineer it, introduce malware, interfere with another user, use it to make an
              employment decision about someone else, or use it in a way that violates law or a
              third party's rights.
            </p>
          </PolicySection>

          <PolicySection title="6. Privacy and your data">
            <p>
              Our{" "}
              <Link to="/privacy" className="underline underline-offset-4">
                Privacy Policy
              </Link>{" "}
              explains what we process, how browser-side encryption works, and the choices you have
              to export or delete your account data. It is part of these Terms.
            </p>
          </PolicySection>

          <PolicySection title="7. Availability, changes, and ending access">
            <p>
              We may change, suspend, or discontinue parts of the service to maintain security,
              improve the product, comply with law, or address misuse. We may suspend or terminate
              access if you materially breach these Terms or create risk for CareerGem or others. If
              we make a material change to these Terms, we will post the updated version and revise
              the date above; continued use after the effective date means you accept the update.
            </p>
          </PolicySection>

          <PolicySection title="8. Disclaimers and liability">
            <p>
              CareerGem is provided on an “as is” and “as available” basis to the extent permitted
              by law. We do not warrant that outputs are complete, accurate, suitable for every
              purpose, or uninterrupted. To the extent permitted by law, CareerGem is not liable for
              indirect, special, consequential, or lost-profit damages arising from use of the
              service. Nothing here excludes liability that applicable law does not allow us to
              exclude.
            </p>
          </PolicySection>

          <PolicySection title="9. Governing law">
            <p>
              These Terms are intended to be governed by the laws of Ontario and the applicable laws
              of Canada, without limiting consumer rights that apply where you live. This clause
              will be confirmed when the operating business and launch jurisdiction are finalized.
            </p>
          </PolicySection>

          <PolicySection title="10. Contact">
            <p>
              The legal business name and support email will be inserted here before CareerGem opens
              paid subscriptions to the public. Until then, this is a development-preview policy
              draft and not a substitute for legal advice.
            </p>
          </PolicySection>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function DraftNotice() {
  return (
    <aside className="mt-8 rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm text-muted-foreground">
      <strong className="font-semibold text-foreground">Development draft.</strong> This text is
      prepared for an Ontario, Canada-first launch and must be reviewed by a qualified Canadian
      lawyer before public paid launch. It also needs the operating legal name and support email.
    </aside>
  );
}

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
