import { createFileRoute } from "@tanstack/react-router";

/**
 * Stripe webhook receiver — the authoritative source of subscription state.
 *
 * Lives under `/api/public/*` because Stripe calls it unauthenticated, so the
 * handler does its own authentication: every request must carry a valid
 * `Stripe-Signature` over the exact raw body. Unverified requests are rejected
 * before anything is read or written.
 */
export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();

        const { verifyStripeEvent } = await import("@/lib/stripe.server");
        const event = await verifyStripeEvent(rawBody, request.headers.get("stripe-signature"));
        if (!event) return new Response("Invalid signature", { status: 400 });

        const { claimStripeEvent, releaseStripeEvent, markPaymentFailed, syncSubscription } =
          await import("@/lib/billing.server");

        // Idempotency: a retried delivery is acknowledged without reapplying.
        const claimed = await claimStripeEvent(event.id, event.type);
        if (!claimed) return new Response("Already processed", { status: 200 });

        try {
          await handleEvent(event, { markPaymentFailed, syncSubscription });
          return new Response("ok", { status: 200 });
        } catch (error) {
          // Drop the claim so Stripe's retry is processed rather than skipped.
          await releaseStripeEvent(event.id);
          console.error("[stripe-webhook] handler failed", event.type, error);
          return new Response("Handler error", { status: 500 });
        }
      },
    },
  },
});

type Handlers = {
  markPaymentFailed: (customerId: string) => Promise<void>;
  syncSubscription: (
    subscription: import("@/lib/stripe.server").StripeSubscription,
    options?: { deleted?: boolean },
  ) => Promise<void>;
};

async function handleEvent(
  event: import("@/lib/stripe.server").StripeEvent,
  { markPaymentFailed, syncSubscription }: Handlers,
): Promise<void> {
  const object = event.data.object;
  const { stripeRequest } = await import("@/lib/stripe.server");

  switch (event.type) {
    // Purchase completed: re-fetch the subscription so state comes from
    // Stripe's API rather than the event payload.
    case "checkout.session.completed": {
      const subscriptionId = typeof object["subscription"] === "string" ? object["subscription"] : null;
      if (!subscriptionId) return;
      const subscription = await stripeRequest<import("@/lib/stripe.server").StripeSubscription>(
        "GET",
        `/subscriptions/${subscriptionId}`,
      );
      await syncSubscription(subscription);
      return;
    }

    // Creation, activation, renewal, plan change, scheduled cancellation.
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.paused":
    case "customer.subscription.resumed": {
      await syncSubscription(object as unknown as import("@/lib/stripe.server").StripeSubscription);
      return;
    }

    // Expiration / hard cancellation: access ends now.
    case "customer.subscription.deleted": {
      await syncSubscription(
        object as unknown as import("@/lib/stripe.server").StripeSubscription,
        { deleted: true },
      );
      return;
    }

    // Renewal succeeded — refresh the period end from the subscription.
    case "invoice.paid":
    case "invoice.payment_succeeded": {
      const subscriptionId = typeof object["subscription"] === "string" ? object["subscription"] : null;
      if (!subscriptionId) return;
      const subscription = await stripeRequest<import("@/lib/stripe.server").StripeSubscription>(
        "GET",
        `/subscriptions/${subscriptionId}`,
      );
      await syncSubscription(subscription);
      return;
    }

    case "invoice.payment_failed": {
      const customerId = typeof object["customer"] === "string" ? object["customer"] : null;
      if (customerId) await markPaymentFailed(customerId);
      return;
    }

    default:
      // Unhandled event types are acknowledged so Stripe stops retrying.
      return;
  }
}
