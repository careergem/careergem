-- 1. Subscription columns (service-role writable only, enforced below)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_customer_id_key
  ON public.profiles (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- 2. Prevent privilege escalation: only service_role may alter entitlement columns.
CREATE OR REPLACE FUNCTION public.protect_profile_entitlements()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claims', true) IS NULL
     OR coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  NEW.id                     := OLD.id;
  NEW.plan                   := OLD.plan;
  NEW.trial_ends_at          := OLD.trial_ends_at;
  NEW.stripe_customer_id     := OLD.stripe_customer_id;
  NEW.stripe_subscription_id := OLD.stripe_subscription_id;
  NEW.subscription_status    := OLD.subscription_status;
  NEW.current_period_end     := OLD.current_period_end;
  NEW.created_at             := OLD.created_at;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_profile_entitlements() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS profiles_protect_entitlements ON public.profiles;
CREATE TRIGGER profiles_protect_entitlements
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_entitlements();

-- 3. Data integrity constraints
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check,
  ADD CONSTRAINT profiles_plan_check
    CHECK (plan IN ('trial', 'active', 'past_due', 'canceled'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_text_len_check,
  ADD CONSTRAINT profiles_text_len_check CHECK (
    coalesce(length(display_name), 0) <= 120
    AND coalesce(length(target_role), 0) <= 160
    AND coalesce(length(field), 0) <= 120
    AND coalesce(length(timeline), 0) <= 120
    AND coalesce(length(kdf_salt), 0) <= 128
    AND coalesce(length(verifier_ciphertext), 0) <= 4096
    AND coalesce(length(verifier_iv), 0) <= 64
  );

ALTER TABLE public.assessments
  DROP CONSTRAINT IF EXISTS assessments_score_check,
  ADD CONSTRAINT assessments_score_check CHECK (score IS NULL OR (score >= 0 AND score <= 100));

ALTER TABLE public.assessments
  DROP CONSTRAINT IF EXISTS assessments_payload_check,
  ADD CONSTRAINT assessments_payload_check CHECK (
    length(ciphertext) BETWEEN 1 AND 200000 AND length(iv) BETWEEN 1 AND 64
  );

ALTER TABLE public.roadmap_items
  DROP CONSTRAINT IF EXISTS roadmap_items_payload_check,
  ADD CONSTRAINT roadmap_items_payload_check CHECK (
    length(ciphertext) BETWEEN 1 AND 20000 AND length(iv) BETWEEN 1 AND 64
  );

ALTER TABLE public.roadmap_items
  DROP CONSTRAINT IF EXISTS roadmap_items_block_check,
  ADD CONSTRAINT roadmap_items_block_check CHECK (block BETWEEN 1 AND 3);

ALTER TABLE public.roadmap_items
  DROP CONSTRAINT IF EXISTS roadmap_items_position_check,
  ADD CONSTRAINT roadmap_items_position_check CHECK (position BETWEEN 0 AND 50);

CREATE UNIQUE INDEX IF NOT EXISTS roadmap_items_slot_key
  ON public.roadmap_items (assessment_id, block, position);

-- 4. A roadmap item must belong to the same owner as its parent assessment.
CREATE OR REPLACE FUNCTION public.enforce_roadmap_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner uuid;
BEGIN
  SELECT user_id INTO owner FROM public.assessments WHERE id = NEW.assessment_id;
  IF owner IS NULL OR owner <> NEW.user_id THEN
    RAISE EXCEPTION 'roadmap item owner must match its assessment owner';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_roadmap_owner() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS roadmap_items_enforce_owner ON public.roadmap_items;
CREATE TRIGGER roadmap_items_enforce_owner
  BEFORE INSERT OR UPDATE ON public.roadmap_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_roadmap_owner();

-- 5. Indexes matching the app's real access paths
CREATE INDEX IF NOT EXISTS assessments_user_created_idx
  ON public.assessments (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS roadmap_items_assessment_order_idx
  ON public.roadmap_items (assessment_id, block, position);

CREATE INDEX IF NOT EXISTS roadmap_items_user_idx
  ON public.roadmap_items (user_id);