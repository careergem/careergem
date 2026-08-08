/**
 * Server-only entitlement writes.
 *
 * The database is the sole authority for premium access; this module is the
 * only place that writes to those columns, and it does so with the service
 * role because a `BEFORE UPDATE` trigger freezes them for every other role.
 * Nothing here reads or forwards career data — Stripe only ever sees an
 * account identifier and an email.
 */
import { planForStatus, type StripeSubscription } from "./stripe.server";

/** Records the event id first; a duplicate delivery is a no-op. */
export async function claimStripeEvent(eventId: string, eventType: string): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("processed_stripe_events")
    .insert({ event_id: eventId, event_type: eventType });

  if (!error) return true;
  // 23505 = unique violation: Stripe retried an event we already applied.
  if (error.code === "23505") return false;
  throw new Error(`Could not record Stripe event: ${error.message}`);
}

/** Releases the idempotency claim so Stripe's retry can be processed again. */
export async function releaseStripeEvent(eventId: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("processed_stripe_events").delete().eq("event_id", eventId);
}

/**
 * Resolves the owning account for a subscription. Prefers the customer id
 * already stored on the profile, and falls back to the user id Stripe carries
 * in subscription metadata (set when the Checkout session is created).
 */
async function resolveUserId(subscription: StripeSubscription): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", subscription.customer)
    .maybeSingle();
  if (data?.id) return data.id;

  const metadataUserId = subscription.metadata?.["supabase_user_id"];
  if (!metadataUserId) return null;

  const { data: byId } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", metadataUserId)
    .maybeSingle();
  return byId?.id ?? null;
}

/** Applies a Stripe subscription's state to the owning profile. */
export async function syncSubscription(
  subscription: StripeSubscription,
  options: { deleted?: boolean } = {},
): Promise<void> {
  const userId = await resolveUserId(subscription);
  if (!userId) {
    console.error("[billing] no profile matches Stripe customer", subscription.customer);
    return;
  }

  const status = options.deleted ? "canceled" : subscription.status;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      plan: planForStatus(status),
      subscription_status: status,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      cancel_at_period_end: options.deleted ? false : Boolean(subscription.cancel_at_period_end),
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    })
    .eq("id", userId);

  if (error) throw new Error(`Could not apply subscription state: ${error.message}`);
}

/** Marks an account as behind on payment without touching subscription ids. */
export async function markPaymentFailed(customerId: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("profiles")
    .update({ plan: "past_due", subscription_status: "past_due" })
    .eq("stripe_customer_id", customerId);
}

/** Links a Stripe customer to an account, creating one on first checkout. */
export async function ensureStripeCustomer(userId: string, email: string | undefined): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { stripeRequest } = await import("./stripe.server");

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error("Could not read your billing profile.");
  if (profile?.stripe_customer_id) return profile.stripe_customer_id;

  const customer = await stripeRequest<{ id: string }>(
    "POST",
    "/customers",
    {
      ...(email ? { email } : {}),
      // Only an account identifier — never career data.
      metadata: { supabase_user_id: userId },
    },
    { idempotencyKey: `customer:${userId}` },
  );

  const { error: writeError } = await supabaseAdmin
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);
  if (writeError) throw new Error("Could not save your billing profile.");

  return customer.id;
}
