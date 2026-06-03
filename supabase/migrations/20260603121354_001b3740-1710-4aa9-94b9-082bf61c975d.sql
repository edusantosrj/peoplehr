ALTER TABLE public.vacancies
  ADD COLUMN IF NOT EXISTS observation text,
  ADD COLUMN IF NOT EXISTS mission text,
  ADD COLUMN IF NOT EXISTS responsibilities text,
  ADD COLUMN IF NOT EXISTS expectations text,
  ADD COLUMN IF NOT EXISTS offerings text;