ALTER TABLE public.profiles
  ADD COLUMN verifier_ciphertext TEXT,
  ADD COLUMN verifier_iv TEXT;