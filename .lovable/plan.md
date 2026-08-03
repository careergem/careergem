# CareerOS — MVP Build Plan

Scope: the Career Assessment Engine only. Input resume + target job → career score, gap analysis, 90-day roadmap. Installable PWA, free trial then subscription.

## One honest tradeoff up front

You want zero server-side access to user data. AI analysis of a resume requires the resume text to reach a model at least once — that's unavoidable for any AI career tool. What I can guarantee:

- Resume text and generated reports are **encrypted in the browser** with a key derived from the user's password. The database stores ciphertext only; neither Lovable Cloud nor I can read it.
- Resume text is sent to the AI **only in memory, per request** — never written to a server table or log. The result comes back, is encrypted in the browser, then stored.
- The server sees only: account email, display name (user's choice), subscription status, and opaque encrypted blobs.
- Users get a full export and one-click permanent delete.

Consequence to accept: if a user forgets their password, their history is **unrecoverable**. That's the cost of real ownership. I'll show this clearly at signup.

## Screens

```text
/                 Landing — thesis, pricing, privacy promise, CTA
/auth             Sign up / sign in (passphrase warning shown here)
/onboarding       Field, degree, target role, timeline, salary goal
/assessment/new   Paste or upload resume + target job description
/assessment/:id   Report: score, gaps, 90-day roadmap
/dashboard        Assessment history, score trend, active roadmap
/settings         Display name, export data, delete account, subscription
/privacy          Plain-language data handling page
```

## The report (what the AI returns)

1. **Career Score 0–100** with sub-scores: technical depth, evidence of impact, credibility signals (projects/OSS), market alignment, presentation.
2. **Gap analysis** — ranked list of what's missing vs. the target role, each tagged high/medium/low impact.
3. **90-day roadmap** — three 30-day blocks, each with 3–5 concrete actions, checkable so progress is tracked.

Structured output with a strict schema so scores stay comparable across re-assessments — that's what makes the score-increase metric real.

## Monetization

- 14-day trial: full access, 1 assessment.
- Subscription $15/month or $120/year unlocks unlimited re-assessments, roadmap tracking, and history.
- Payment provider chosen via eligibility check before implementing checkout; digital subscription, so likely Paddle or Stripe with managed tax handling.
- Entitlement is checked server-side on every AI call — never from browser state.

## Accessibility

Keyboard-navigable throughout, visible focus rings, semantic landmarks and one H1 per page, AA contrast, labelled form fields with inline error text, live-region announcements while the assessment runs, respects reduced-motion, works at 200% zoom.

## PWA

Manifest + icons + theme colors so users install from Safari's Share → Add to Home Screen. No service worker or offline mode — reports need the network anyway, and skipping it avoids stale-cache bugs. Capacitor wrapping for an actual App Store listing stays a later step.

## Technical details

- **Stack**: TanStack Start, React 19, Tailwind v4 semantic tokens.
- **Backend**: Lovable Cloud (auth + Postgres). Tables: `profiles` (id, display_name, plan, trial_ends_at), `assessments` (id, user_id, ciphertext, iv, score, created_at), `roadmap_items` (id, assessment_id, ciphertext, iv, done, block). RLS on every table scoped to `auth.uid()`, plus explicit GRANTs. Score is stored plaintext (a number, not identifying) so trends render without decryption.
- **Encryption**: WebCrypto AES-GCM; key from PBKDF2 over the user's passphrase + per-user salt, held in memory for the session only. Never transmitted.
- **AI**: Lovable AI, `google/gemini-3.6-flash`, called from a `createServerFn` with `.middleware([requireSupabaseAuth])`. Zod-validated structured output. Prompt and key stay server-side. Never called from a public loader.
- **Rate limiting**: per-user assessment counter to cap trial abuse and AI spend.
- **SEO**: unique title/description/og per route, JSON-LD SoftwareApplication on the landing page.

## Build order

1. Enable Lovable Cloud; schema, RLS, grants.
2. Landing page + privacy page.
3. Auth with passphrase-loss warning; encryption module.
4. Onboarding + assessment input.
5. AI assessment server function with structured schema.
6. Report screen + dashboard with score trend.
7. Roadmap tracking.
8. Settings: export, delete, display name.
9. Payments: eligibility check, products, trial gating, checkout, webhook.
10. PWA manifest, icons, accessibility pass.

Deliberately not in the MVP: LinkedIn/GitHub imports, resume rewriting, interview prep, mock interviews, enterprise features, coaching marketplace.
