
CREATE POLICY "Anon can check CPF existence"
  ON public.candidates FOR SELECT
  TO anon
  USING (true);
