ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false;

-- Freeze the new billing column against user writes, same as the others.
CREATE OR REPLACE FUNCTION public.protect_profile_entitlements()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  NEW.cancel_at_period_end   := OLD.cancel_at_period_end;
  NEW.created_at             := OLD.created_at;
  RETURN NEW;
END;
$function$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_customer_id_key
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.processed_stripe_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- Billing-internal table: no anon or authenticated access at all.
REVOKE ALL ON public.processed_stripe_events FROM anon, authenticated;
GRANT ALL ON public.processed_stripe_events TO service_role;

ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;
-- No policies: RLS denies every non-service_role request by default.