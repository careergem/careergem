/** Billing is intentionally unavailable until the paid-launch checklist is complete. */
export function SubscriptionPanel({
  billingFlag: _billingFlag,
}: {
  billingFlag?: string | undefined;
}) {
  return (
    <section
      aria-labelledby="subscription-heading"
      className="rounded-xl border border-hairline bg-surface p-7"
    >
      <h2 id="subscription-heading" className="font-display text-lg font-semibold">
        Public beta access
      </h2>
      <p className="mt-4 text-xs text-muted-foreground">
        Your beta account includes one private assessment every 30 days. No payment details are
        requested or stored while billing is closed.
      </p>
    </section>
  );
}
