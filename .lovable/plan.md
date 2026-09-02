# Fix "Invalid login credentials" on test sign-in

## What's actually happening

The fixture account exists in the database, is email-confirmed, and signed in successfully before (last sign-in 2026-09-01 03:30 UTC). The two failed sign-in attempts sent:

```text
email:    test-user@careergem.test
password: test-user@careergem.test
```

The fixture password is not the email address, so the backend correctly rejected it. Those requests came from the manual email/password form (typed credentials), not from the "Sign in as test user" button — the button always sends the fixed passphrase.

So this is a credential-entry problem, not a broken auth flow. Fix: make the test path impossible to get wrong.

## Changes

1. **Auth page test panel** (`src/routes/auth.tsx`)
   - Show the fixture email and passphrase in the dev-only test panel so they can be typed or copied when needed.
   - When "Sign in as test user" runs, prefill the email/password fields with the fixture values, so the visible form state always matches what was actually submitted.
   - On failure, surface a clearer message ("Test account sign-in failed — provisioning may not have completed") instead of the raw backend text.

2. **Self-healing sign-in** (`src/routes/auth.tsx` only)
   - If the fixture sign-in returns invalid credentials, call the existing provisioning server function once more (it resets the fixture password) and retry the sign-in a single time before showing an error.

No changes to the encryption/vault flow, no changes to the real sign-in or sign-up paths, and the test path stays dev/preview-only and disabled in production.

## Notes

To sign in manually right now, use:
- email `test-user@careergem.test`
- password `careergem-test-passphrase`
