-- Readable feedback is deliberately kept separate from the encrypted career
-- vault. It is optional, avoids resume content, and can be read only by the
-- service operator through the service role for beta triage.
CREATE TABLE IF NOT EXISTS public.beta_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('useful', 'issue', 'idea', 'other')),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  page text CHECK (page IS NULL OR page IN ('assessment_report', 'settings')),
  created_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.beta_feedback FROM anon;
GRANT INSERT ON public.beta_feedback TO authenticated;
GRANT ALL ON public.beta_feedback TO service_role;

ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS beta_feedback_insert_own ON public.beta_feedback;
CREATE POLICY beta_feedback_insert_own
  ON public.beta_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);