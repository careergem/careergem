-- Optional personal details belong in the user's encrypted vault, not as
-- readable profile metadata. These columns can only contain an AES-GCM pair.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS personal_details_ciphertext text,
  ADD COLUMN IF NOT EXISTS personal_details_iv text;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_personal_details_pair_check,
  ADD CONSTRAINT profiles_personal_details_pair_check CHECK (
    (personal_details_ciphertext IS NULL AND personal_details_iv IS NULL)
    OR (
      char_length(personal_details_ciphertext) BETWEEN 16 AND 20000
      AND char_length(personal_details_iv) BETWEEN 8 AND 256
    )
  );

GRANT UPDATE (personal_details_ciphertext, personal_details_iv) ON public.profiles TO authenticated;
