
ALTER TABLE public.hr_evaluations
  ADD COLUMN IF NOT EXISTS current_stage text NOT NULL DEFAULT 'validation_form';

ALTER TABLE public.hr_evaluations
  ALTER COLUMN ficha_validation SET DEFAULT 'Não Iniciada',
  ALTER COLUMN management_validation SET DEFAULT 'Não Iniciada',
  ALTER COLUMN director_validation SET DEFAULT 'Não Iniciada',
  ALTER COLUMN proposal_presented SET DEFAULT '-',
  ALTER COLUMN proposal_accepted SET DEFAULT '-',
  ALTER COLUMN documentation_delivered SET DEFAULT '-',
  ALTER COLUMN candidate_hired SET DEFAULT '-';
