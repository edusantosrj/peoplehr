
ALTER TABLE public.candidates ADD COLUMN hr_data JSONB DEFAULT NULL;

CREATE POLICY "Authenticated users can update candidates"
  ON public.candidates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
