# Owner Deliverables for Launch

Complete these in order. Share confirmation or screenshots of completion with Codex; never paste passwords, private keys, database connection strings, or Stripe secret keys into chat.

## 1. Make a free-tier data safety export before migration

**Why:** the next release contains an encrypted-profile schema migration. The
Supabase free plan does not provide dashboard backups, but this migration is
additive (it only adds nullable private-detail columns). A private export gives
us a practical rollback reference without upgrading the plan.

1. In Supabase **Table Editor**, privately export the current rows for
   `profiles`, `assessments`, `roadmap_items`, and `processed_stripe_events`
   (if it exists) as CSV.
2. Record each table's row count. Keep the files outside this repository and
   do not upload them to Git, Lovable, or chat: profile data can contain
   personal information even where assessment content is encrypted.
3. In **Authentication → Users**, record the current user count. Export the
   user list only if the Dashboard makes that appropriate for your account.
4. Reply: `Free-tier export complete — apply migration`.

After that confirmation, Codex can apply the committed migration in version-controlled order. Do not manually paste the migration into the SQL editor if this project is managed through migration files; use the migration workflow so remote history stays aligned with Git. See [Supabase migration guidance](https://supabase.com/docs/guides/deployment/database-migrations) and [backup guidance](https://supabase.com/docs/guides/platform/backups).

For a later, repeatable full database export, Supabase's CLI supports a logical
dump. We can set that up after launch work is stable; it needs your own Supabase
authentication and database access, neither of which belongs in this repository.

## 2. Keep the Lovable URL until launch readiness

No domain purchase is needed now. Continue using the existing `lovable.app` URL
for preview, closed beta, and early validation. Buy and connect the final domain
only when we have an approved public-release date, ideally one to two weeks
before it.

When the time comes, use **Lovable → Project Settings → Domains** or its
**Publish** flow. Lovable's current custom-domain guide is [here](https://docs.lovable.dev/features/custom-domain).

## 3. Follow the confirmed GitHub/Lovable branch policy

| Branch | Purpose | Rule |
| --- | --- | --- |
| `dev` | Development and Lovable preview | Codex changes land here in small tested commits. |
| `main` | Production | Keep protected; merge from `dev` only after your review and explicit approval. |

In Lovable, confirm that preview work is reading `dev` and that production is
published only from `main`. Do not force-push, rebase, or rewrite either branch's
pushed history.

## 4. Set up Stripe before opening subscriptions

1. Create the company/sole-proprietor Stripe account in the legal name you will use for sales.
2. Complete identity and banking verification.
3. Create the monthly and annual CareerGem subscription products/prices matching the public pricing page.
4. Configure the customer portal and a webhook endpoint for subscription changes.
5. Run one test checkout and cancellation in Stripe test mode.

Your deliverable: tell Codex when Stripe is verified and whether test-mode checkout is ready. Keep all secret keys in Stripe/Lovable secret settings—not in Git or chat.

## 5. Provide launch decisions when the beta is ready

- Final public product name and one-sentence promise.
- Domain name (only when you decide to acquire it).
- Canadian-only launch or international availability.
- Support email address.
- Refund/cancellation policy approved for the pricing page.
- Date for a closed beta, then public launch.

## 6. Publish only after release review

1. Ask Codex for the current release checklist and known blockers.
2. Verify the private Lovable preview on a phone and desktop browser.
3. Merge the approved `dev` release into protected `main`, then publish the
   production version to the temporary `lovable.app` URL or your custom domain.
4. Run Lovable's security/SEO review and connect Google Search Console after the domain is live.

Lovable's publishing guide is [here](https://docs.lovable.dev/features/publish).
