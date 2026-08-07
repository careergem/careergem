-- Least privilege at the column level: this does not depend on JWT claims or
-- RLS, so a signed-in client cannot write entitlement/billing columns at all.
REVOKE UPDATE ON public.profiles FROM authenticated;

GRANT UPDATE (
  display_name,
  target_role,
  field,
  timeline,
  onboarding_complete,
  kdf_salt,
  verifier_ciphertext,
  verifier_iv,
  updated_at
) ON public.profiles TO authenticated;

-- Inserts are only ever the user's own bootstrap row; the trigger owns creation.
REVOKE INSERT ON public.profiles FROM authenticated;
GRANT INSERT (id, display_name) ON public.profiles TO authenticated;

GRANT ALL ON public.profiles TO service_role;