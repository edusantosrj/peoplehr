-- Grant SELECT to anon so the public candidate module can read vacancies
GRANT SELECT ON public.vacancies TO anon;

-- Policy: anonymous users can only read active vacancies
CREATE POLICY "anon_select_active" ON public.vacancies
  FOR SELECT
  TO anon
  USING (status = 'Ativa');