ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_roles text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience_level text,
  ADD COLUMN IF NOT EXISTS known_gaps text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_target_roles_max_five
  CHECK (coalesce(array_length(target_roles, 1), 0) <= 5);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_known_gaps_max_ten
  CHECK (coalesce(array_length(known_gaps, 1), 0) <= 10);

GRANT UPDATE (target_roles, experience_level, known_gaps) ON public.profiles TO authenticated;

ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS role_count integer NOT NULL DEFAULT 1;

ALTER TABLE public.assessments
  ADD CONSTRAINT assessments_role_count_range CHECK (role_count BETWEEN 1 AND 5);

GRANT UPDATE (role_count) ON public.assessments TO authenticated;