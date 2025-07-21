-- Grant explicit permissions to anon and authenticated roles
GRANT INSERT ON public.assessment_results TO anon;
GRANT INSERT ON public.assessment_results TO authenticated;
GRANT SELECT ON public.assessment_results TO anon;
GRANT SELECT ON public.assessment_results TO authenticated;

-- Also ensure usage on the schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;