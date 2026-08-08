import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const intervalSchema = z.object({ interval: z.enum(["monthly", "yearly"]) });

/** Same-origin return URLs only; never a client-supplied redirect target. */
function appOrigin(): string {
  const request = getRequest();
  return new URL(request.url).origin;
}

/**
 * Creates a Stripe Checkout session for the caller's own account.
 *
 * The account is taken from the verified bearer token, never from request
 * data, so a user cannot start checkout against someone else's account. Only
 * the price interval is accepted from the client, and it is mapped to a
 * server-held price id.
 */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => intervalSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const { priceIdForInterval, stripeRequest } = await import("./stripe.server");
    const { ensureStripeCustomer } = await import("./billing.server");

    const email = typeof claims["email"] === "string" ? (claims["email"] as string) : undefined;
    const customerId = await ensureStripeCustomer(userId, email);
    const origin = appOrigin();

    const session = await stripeRequest<{ url: string | null }>("POST", "/checkout/sessions", {
      mode: "subscription",
      customer: customerId,
      client_reference_id: userId,
      line_items: [{ price: priceIdForInterval(data.interval), quantity: 1 }],
      success_url: `${origin}/settings?billing=success`,
      cancel_url: `${origin}/pricing?billing=canceled`,
      allow_promotion_codes: true,
      subscription_data: { metadata: { supabase_user_id: userId } },
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { url: session.url };
  });

/**
 * Creates a Stripe Customer Portal session so the caller can change plan,
 * update payment details, or cancel. Requires an existing customer record.
 */
export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { stripeRequest } = await import("./stripe.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      throw new Error("You do not have a subscription to manage yet.");
    }

    const session = await stripeRequest<{ url: string }>("POST", "/billing_portal/sessions", {
      customer: profile.stripe_customer_id,
      return_url: `${appOrigin()}/settings`,
    });

    return { url: session.url };
  });
