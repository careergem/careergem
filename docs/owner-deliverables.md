# Owner Deliverables for Launch

Complete these in order. Share confirmation or screenshots of completion with Codex; never paste passwords, private keys, database connection strings, or Stripe secret keys into chat.

## 1. Confirm database backup before migration

**Why:** the next release contains an encrypted-profile schema migration.

1. Open the linked project in the Supabase Dashboard.
2. Go to **Database → Backups**.
3. Confirm a recent restore point/back-up is available, or create a logical backup if your plan/workflow requires it.
4. Reply: `Supabase backup confirmed — apply migration`.

After that confirmation, Codex can apply the committed migration in version-controlled order. Do not manually paste the migration into the SQL editor if this project is managed through migration files; use the migration workflow so remote history stays aligned with Git. See [Supabase migration guidance](https://supabase.com/docs/guides/deployment/database-migrations) and [backup guidance](https://supabase.com/docs/guides/platform/backups).

## 2. Acquire the domain now

**Recommendation:** buy the final brand domain now, even before public launch. Prefer a short, easy-to-spell `.com` if available; avoid hyphens and alternate spellings.

**Easiest path:** in Lovable, use **Project → Settings → Domains** or the **Publish** modal, choose **Buy a new domain**, then follow the purchase flow. This keeps domain connection simple. You need workspace owner/admin rights. If you buy from another registrar, Lovable will provide the DNS records to add later.

Your deliverable: reply with the domain you bought and whether it was purchased through Lovable or another registrar. Do not send account credentials. Lovable's current custom-domain guide is [here](https://docs.lovable.dev/features/custom-domain).

## 3. Confirm the GitHub/Lovable production branch

1. In Lovable, open the GitHub connection for CareerGem.
2. Identify the branch that Lovable uses for synchronization and publishing.
3. Tell Codex whether `dev` is intended to be the pre-production branch and which branch is production.

**Recommendation:** use `dev` for Codex changes and a protected `main` branch for production. Merge only tested `dev` commits into `main`; do not force-push, rebase, or rewrite published history.

## 4. Set up Stripe before opening subscriptions

1. Create the company/sole-proprietor Stripe account in the legal name you will use for sales.
2. Complete identity and banking verification.
3. Create the monthly and annual CareerGem subscription products/prices matching the public pricing page.
4. Configure the customer portal and a webhook endpoint for subscription changes.
5. Run one test checkout and cancellation in Stripe test mode.

Your deliverable: tell Codex when Stripe is verified and whether test-mode checkout is ready. Keep all secret keys in Stripe/Lovable secret settings—not in Git or chat.

## 5. Provide launch decisions

- Final public product name and one-sentence promise.
- Domain name.
- Canadian-only launch or international availability.
- Support email address.
- Refund/cancellation policy approved for the pricing page.
- Date for a closed beta, then public launch.

## 6. Publish only after release review

1. Ask Codex for the current release checklist and known blockers.
2. Verify the private Lovable preview on a phone and desktop browser.
3. Publish to the temporary `lovable.app` URL or your custom domain.
4. Run Lovable's security/SEO review and connect Google Search Console after the domain is live.

Lovable's publishing guide is [here](https://docs.lovable.dev/features/publish).
