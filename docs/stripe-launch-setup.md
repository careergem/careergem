# Stripe Verification and Billing Setup

This is the owner-run setup for CareerGem subscriptions. Complete it in Stripe
directly; never send passwords, API keys, webhook secrets, tax IDs, identity
documents, or bank details to Codex, GitHub, Lovable, or chat.

## Part A — verify the business account

1. Create or sign in to the Stripe account that will receive CareerGem funds.
   Select the real business type and country. If you are currently selling as a
   sole proprietor, choose that only if it reflects your actual legal status;
   do not invent a company entity.
2. Verify the account email and enable an authenticator app or passkey for
   two-factor authentication.
3. Complete **Business details** with your legal name, address, support email,
   and a plain description such as: “Career guidance and assessment tools for
   STEM students and early-career candidates.” Use the current Lovable URL as
   the website until a custom domain exists.
4. Complete the account representative/owner identity prompts and add the
   payout bank account. Stripe will show exactly what is required for your
   country and legal structure.
5. Set a recognizable statement descriptor and publish a support contact plus
   refund/cancellation terms on the site before accepting live payments.

**Your checkpoint:** reply only with `Stripe verification submitted` or
`Stripe verification approved`, plus any non-sensitive dashboard status text.

## Part B — build the test subscription configuration

Start in **Test mode**. Test and live products, prices, API keys, and webhook
secrets are separate.

1. Create one product: **CareerGem Pro**.
2. Add two recurring prices matching the current website:
   - Monthly: **$15.00 USD**, recurring monthly.
   - Annual: **$120.00 USD**, recurring yearly.
3. Enable the **Customer Portal** with these minimum permissions: update a
   payment method, view invoices, and cancel a subscription. Keep plan changes
   off initially unless you explicitly want them.
4. In Lovable's server/environment secret settings, add only the test-mode
   values using these exact names:

   | Secret name | What belongs there |
   | --- | --- |
   | `STRIPE_SECRET_KEY` | Test-mode server key, ideally a scoped/restricted key if your Stripe setup supports the endpoints CareerGem calls. |
   | `STRIPE_PRICE_MONTHLY` | Test monthly Price ID (`price_...`). |
   | `STRIPE_PRICE_YEARLY` | Test annual Price ID (`price_...`). |
   | `STRIPE_WEBHOOK_SECRET` | Test webhook signing secret (`whsec_...`) after the endpoint is created. |

   These are server secrets. Do not use a publishable key here, commit any key,
   or paste a value into a Lovable prompt/chat.
5. Publish a non-public preview that has the current Lovable URL. In Stripe
   **Developers → Webhooks**, add:

   ```text
   https://YOUR-LOVABLE-HOST/api/public/webhooks/stripe
   ```

   Subscribe to these events:

   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.paused`
   - `customer.subscription.resumed`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

6. Use Stripe's dashboard test payment methods to run one purchase, then use
   the Customer Portal to cancel. Verify CareerGem shows the active plan,
   cancellation-at-period-end, and the returned free state after the period
   ends/cancellation event.

## Part C — go live only after the test passes

1. Resolve any Stripe verification requirements and confirm policies, support
   email, and price text are visible on the Lovable site.
2. In **Live mode**, recreate the product and monthly/annual prices. Replace
   the four Lovable secrets with live-mode values and create a separate live
   webhook endpoint on the production `main` Lovable URL.
3. Perform a low-risk real purchase only when you are ready to accept charges,
   then confirm the webhook updates the entitlement. Keep Stripe's Dashboard
   as the billing source of truth; do not manually grant paid plans in the
   database.
4. Do not enable automated tax collection until the required tax registrations
   for your actual sales locations are in place. Consult a qualified Canadian
   tax/accounting professional for your launch scope.

## What Codex will do after each checkpoint

- After verification is approved: review the public pricing/support/policy
  pages for payment readiness.
- After test Price IDs and test webhook are configured: guide the test checkout
  and inspect application logs/errors without seeing the secrets.
- Before live mode: run the billing release checklist and wait for your explicit
  approval before any `dev` → `main` production merge.

Stripe's official [go-live checklist](https://docs.stripe.com/get-started/checklist/go-live),
[subscription Checkout guide](https://docs.stripe.com/payments/checkout/build-subscriptions),
and [webhook guidance](https://docs.stripe.com/billing/subscriptions/webhooks)
are the source of truth when Stripe's Dashboard differs from this guide.
