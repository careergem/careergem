import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund and Cancellation Policy — CareerGem" },
      {
        name: "description",
        content: "CareerGem's draft subscription cancellation and refund policy.",
      },
    ],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-5 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">Legal</p>
        <h1 className="mt-5 font-display text-4xl font-semibold leading-tight">
          Refund and Cancellation Policy
        </h1>
        <aside className="mt-8 rounded-xl border border-warning/40 bg-warning/10 p-5 text-sm text-muted-foreground">
          <strong className="font-semibold text-foreground">Development draft.</strong> This policy
          needs a Canadian legal review, legal business name, and functioning support email before
          any public paid launch.
        </aside>

        <div className="mt-12 space-y-10 leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">Cancel any time</h2>
            <p className="mt-4">
              You can cancel a CareerGem subscription through the Stripe Customer Portal available
              in CareerGem Settings. Cancellation stops the next renewal. Your paid access continues
              through the end of the billing period already paid for.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">Refunds</h2>
            <p className="mt-4">
              The recommended beta policy is that payments are generally non-refundable and we do
              not provide prorated refunds for an unused portion of a monthly or annual period. This
              does not affect any refund or cancellation right required by applicable law.
            </p>
            <p className="mt-4">
              We will review a request where there was a duplicate charge, a technical failure that
              prevented access, or a suspected unauthorized charge. The final policy should state a
              support email and response timeframe before live billing is enabled.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              How billing works
            </h2>
            <p className="mt-4">
              The amount and currency are shown before checkout. Stripe processes payments;
              CareerGem does not receive or store card numbers. Changes to a payment method,
              invoices, and cancellation are managed in the Customer Portal.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Questions or a billing issue
            </h2>
            <p className="mt-4">
              A support email will be added before public paid launch. Until then, this page is a
              preview-only draft. See the{" "}
              <Link to="/terms" className="underline underline-offset-4">
                Terms of Use
              </Link>{" "}
              for the rest of the service terms.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
