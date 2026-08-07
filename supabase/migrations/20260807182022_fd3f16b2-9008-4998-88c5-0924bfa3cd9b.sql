REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.assessments FROM anon;
REVOKE ALL ON public.roadmap_items FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_items TO authenticated;
GRANT ALL ON public.assessments TO service_role;
GRANT ALL ON public.roadmap_items TO service_role;