
CREATE TABLE public.vacancies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  shift TEXT NOT NULL,
  sector TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  work_hours_start TEXT NOT NULL,
  work_hours_end TEXT NOT NULL,
  gross_salary NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Ativa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select" ON public.vacancies FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert" ON public.vacancies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update" ON public.vacancies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
