import { Button } from "@/components/ui/button";
import { useAuth, trialDaysLeft } from "@/hooks/useAuth";
import { useBilling } from "@/hooks/useBilling";

const STATUS_COPY: Record<string, string> = {
  active: "Active",
  trialing: "Active (Stripe trial)",
  past_due: "Payment failed — please update your card",
  unpaid: "Unpaid — access is paused",
  canceled: "Canceled",
  incomplete: "Awaiting payment confirmation",
  incomplete_expired: "Checkout expired",
  paused: "Paused",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Reads entitlement state written by verified Stripe webhooks only. */
export function SubscriptionPanel({ billingFlag }: { billingFlag?: string }) {
  const { profile } = useAuth();
  const { checkout, openPortal, pending, error } = useBilling();

  const subscribed = profile?.plan === "active" && Boolean(profile.subscription_status);
  const hasCustomer = Boolean(profile?.stripe_customer_id);

  return (
    <section aria-labelledby="subscription-heading" className="rounded-xl border border-hairline bg-surface p-7">
      <h2 id="subscription-heading" className="font-display text-lg font-semibold">
        Subscription
      </h2>

      {billingFlag === "success" ? (
        <p role="status" className="mt-4 rounded-lg border border-signal/50 bg-surface-raised p-4 text-sm">
          Payment received. Your subscription activates as soon as Stripe confirms it — this is
          usually instant. Reload this page if the status below still says Trial.
        </p>
      ) : null}
      {billingFlag === "canceled" ? (
        <p role="status" className="mt-4 rounded-lg border border-hairline bg-surface-raised p-4 text-sm text-muted-foreground">
          Checkout was canceled. Nothing was charged.
        </p>
      ) : null}

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            {subscribed
              ? (STATUS_COPY[profile?.subscription_status ?? ""] ?? "Active")
              : profile?.plan === "past_due"
                ? STATUS_COPY["past_due"]
                : `Trial — ${trialDaysLeft(profile)} day(s) left`}
          </dd>
        </div>
        {profile?.current_period_end ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              {profile.cancel_at_period_end ? "Access ends" : "Renews"}
            </dt>
            <dd>{formatDate(profile.current_period_end)}</dd>
          </div>
        ) : null}
      </dl>

      {profile?.cancel_at_period_end ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Your subscription is set to cancel at the end of the current period. You keep full access
          until then.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {hasCustomer ? (
          <Button onClick={() => void openPortal()} disabled={pending !== null}>
            {pending === "portal" ? "Opening Stripe…" : "Manage subscription"}
          </Button>
        ) : null}
        {!subscribed ? (
          <>
            <Button
              variant={hasCustomer ? "outline" : "default"}
              onClick={() => void checkout("monthly")}
              disabled={pending !== null}
            >
              {pending === "monthly" ? "Opening Stripe…" : "Subscribe — $15/month"}
            </Button>
            <Button variant="outline" onClick={() => void checkout("yearly")} disabled={pending !== null}>
              {pending === "yearly" ? "Opening Stripe…" : "Subscribe — $120/year"}
            </Button>
          </>
        ) : null}
      </div>

      <p aria-live="polite" className="mt-4 text-sm text-destructive empty:mt-0">
        {error ?? ""}
      </p>
      <p className="mt-4 text-xs text-muted-foreground">
        Billing is handled entirely by Stripe. Stripe receives your email and payment details only —
        never your resume, reports, roadmap, or encryption keys.
      </p>
    </section>
  );
}
