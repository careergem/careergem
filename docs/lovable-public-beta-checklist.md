# Lovable Public-Beta Checklist

Use this while Codex completes the public-beta code changes. Do not publish the
current preview until the next `dev` commit has been reviewed.

## 1. Confirm the release lanes

1. In the Lovable project's GitHub connection, verify that the working preview
   reflects `dev`.
2. In GitHub, keep `main` protected. `main` is production only; do not merge
   this beta release until you have reviewed the `dev` preview and explicitly
   approved it.
3. Do not use force-push, rebase, or amend on either branch.

## 2. Check the public-beta preview

After Codex pushes the beta commit, open the Lovable preview in an incognito
desktop window and on a phone. Verify:

- The homepage says **Public beta** and says it is free/no card required.
- The pricing page has no paid checkout buttons.
- Signup requires the 18+ Terms/Privacy acknowledgement.
- A new account can complete onboarding and run one assessment.
- The report's **Share safely** action opens the phone share sheet or copies a
  text-only summary.
- No personal details appear in the shared text.

## 3. Configure authentication in Supabase through Lovable

In the connected Supabase project, review rather than guess at the following:

1. Enable email confirmation for public beta accounts.
2. Set the Site URL to the final Lovable public-beta address.
3. Add that exact address to the allowed redirect URLs so confirmation emails
   return to CareerGem. Keep localhost only for local development.
4. Send yourself a test signup from an incognito browser and verify the email
   confirmation link returns to the app.

Never paste Supabase keys into a Lovable prompt, GitHub issue, or chat. Use the
integration/secret settings only.

## 4. Verify the assessment environment

1. In Lovable, confirm the project remains connected to the approved Supabase
   project and its server-side AI configuration.
2. Run one synthetic-resume test. Confirm it creates an encrypted report and
   does not expose text in browser errors or visible logs.
3. Keep live Stripe secrets absent or inactive during free beta. The code now
   rejects checkout attempts server-side as an additional safeguard.

## 5. Merge and publish only after review

1. Review the `dev` preview and tell Codex any required changes.
2. When approved, open a GitHub pull request from `dev` to `main`; use the
   normal protected-branch review/merge process.
3. In Lovable, publish the `main` version to the existing `lovable.app` URL.
4. Open the published URL in an incognito browser and repeat the essential
   signup and assessment test.

## 6. Still required before promoting publicly at scale

- A public support/privacy email and operating legal name on the legal pages.
- The free-tier Supabase safety export, then the committed private-profile
  migration.
- Final review of the legal-policy drafts.

These do not block a quiet preview review. They must be complete before large
public promotion because CareerGem processes personal career information.
