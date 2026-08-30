# CareerGem Operating Guide

## Owner workflow

| Tool            | Your job                                                                                                           | What it is for                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Lovable         | Build visually, review previews, manage environment settings, publish the approved version, and attach the domain. | Product editor, preview, hosting, and deployment.                                 |
| GitHub          | Keep the repository private, review commits, protect the production branch, and preserve history.                  | Source control and rollback history.                                              |
| Supabase        | Review database health, Auth settings, backups, and approved migrations.                                           | Authentication, database, row-level access control, and encrypted-record storage. |
| Stripe          | Complete business verification, create products/prices, test checkout, and monitor subscriptions/refunds.          | Subscription billing.                                                             |
| ChatGPT / Codex | Give product priorities and feedback; review concise progress notes and approve external changes.                  | Code implementation, testing, release documentation, and Git commits.             |

Codex can inspect the project, make focused changes, test builds, and push approved commits. It should request your approval before spending money, changing a production database, publishing publicly, changing external account settings, or making legal/business filings. OpenAI describes Codex as a tool for understanding codebases, building features, testing, reviewing, and shipping changes. [Official OpenAI documentation](https://learn.chatgpt.com/)

## Working rhythm

1. You choose the current business outcome: for example, "improve first assessment completion".
2. Codex turns it into small, tested commits on `dev` and pushes them to GitHub.
3. You review the preview in Lovable and give product feedback.
4. Before release, apply any committed database migrations, run the release checklist, and publish the approved branch/version.
5. Review weekly metrics and customer feedback; choose only one or two high-impact improvements for the next cycle.

**Important:** confirm the branch that Lovable treats as its synchronized/published source before launch. This workspace currently uses `dev`; Lovable's GitHub documentation says sync follows the connected default branch unless you intentionally use its branch workflow.

## What happens for a candidate

```text
Social video or search result
  → CareerGem landing page
  → Sign up / sign in with Supabase Auth
  → Browser derives an encryption key from the user password
  → Optional profile details are encrypted locally and saved as ciphertext
  → Candidate supplies résumé, target role, and optional job description
  → Server sends the assessment request to the AI provider in memory
  → Browser encrypts the returned report and roadmap before saving to Supabase
  → Dashboard decrypts reports locally; only score and completion state remain readable for trends
  → Stripe Checkout manages an optional subscription
```

School, graduation timing, and interests are optional encrypted profile details. They are not supplied to the assessment model. Field, target role, experience level, timeline, and suspected gaps are assessment context selected by the candidate.

## Privacy-first launch metrics

Start without a third-party behavioral tracker. Use social-platform analytics for views and link clicks, and Supabase/Stripe for product conversion:

| Funnel stage              | Initial measurement source                            |
| ------------------------- | ----------------------------------------------------- |
| Video reach / link clicks | YouTube, Instagram, and TikTok creator analytics      |
| Sign-ups                  | Supabase Auth user count                              |
| First assessments         | `assessments` count                                   |
| Paid conversions          | Stripe active subscriptions                           |
| Retention                 | Candidates who run a second assessment within 30 days |

Review these weekly in a small spreadsheet. Add a dedicated analytics provider only when the manual view prevents a clear decision; document its data collection and update the privacy policy before enabling it.

## Release sequence

1. Confirm the production database backup and apply committed migrations.
2. Verify environment secrets in Lovable/Supabase/Stripe; never put private keys in Git.
3. Test sign-up, vault unlock, assessment, report, export, deletion, checkout, and cancellation on mobile and desktop.
4. Publish a private preview first, then publish publicly after final review.
5. Attach the custom domain and update authentication redirect URLs if any OAuth provider is enabled.
6. Run Lovable's security and SEO reviews against the live domain.

## Incident basics

- **Application bug:** pause promotion, record the reproduction steps, and open a Codex task with screenshots/errors.
- **Database or migration issue:** stop further schema changes, check Supabase migration history and backups, then restore or repair deliberately.
- **Billing issue:** handle the customer in Stripe first; do not manually change a user's paid entitlement in the database.
- **Privacy/security report:** stop sharing relevant logs or screenshots, preserve evidence, and investigate access/encryption before routine feature work.
