
-- HR Evaluations (1:1 per candidate)
CREATE TABLE public.hr_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE UNIQUE,
  ficha_validation text NOT NULL DEFAULT 'Em Análise',
  management_validation text NOT NULL DEFAULT 'Em Análise',
  director_validation text NOT NULL DEFAULT 'Em Análise',
  proposal_presented text NOT NULL DEFAULT 'Em Análise',
  proposal_accepted text NOT NULL DEFAULT 'Em Análise',
  documentation_delivered text NOT NULL DEFAULT 'Em Análise',
  candidate_hired text NOT NULL DEFAULT 'Em Análise',
  talent_bank boolean NOT NULL DEFAULT false,
  ns boolean NOT NULL DEFAULT false,
  interview_status text NOT NULL DEFAULT 'Não',
  interview_date text,
  interview_attended text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- HR Annotations (1:many per candidate)
CREATE TABLE public.hr_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- HR Admissions (1:1 per candidate)
CREATE TABLE public.hr_admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE UNIQUE,
  vacancy_id text,
  vacancy_display text,
  admission_status text,
  defined_salary text,
  store_unit text,
  work_hours text,
  expected_start_date text,
  observations text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- HR Terminations (1:1 per candidate)
CREATE TABLE public.hr_terminations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE UNIQUE,
  request_date text,
  voluntary_termination boolean,
  termination_reason text,
  will_serve_notice boolean,
  notice_days integer,
  last_work_day text,
  can_be_rehired boolean,
  confirmed boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- HR Documentation (1:1 per candidate, flat structure for 5 doc types)
CREATE TABLE public.hr_documentation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE UNIQUE,
  basic_doc_checked boolean NOT NULL DEFAULT false,
  basic_doc_expiration_date text,
  basic_doc_completed boolean DEFAULT false,
  experience_contract_checked boolean NOT NULL DEFAULT false,
  experience_contract_expiration_date text,
  experience_contract_completed boolean DEFAULT false,
  experience_extension_checked boolean NOT NULL DEFAULT false,
  experience_extension_expiration_date text,
  experience_extension_completed boolean DEFAULT false,
  prior_notice_checked boolean NOT NULL DEFAULT false,
  prior_notice_expiration_date text,
  prior_notice_completed boolean DEFAULT false,
  termination_contract_checked boolean NOT NULL DEFAULT false,
  termination_contract_expiration_date text,
  termination_contract_completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- HR Emergency Contacts (1:many per candidate)
CREATE TABLE public.hr_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.hr_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_terminations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- SELECT policies (authenticated only)
CREATE POLICY "auth_select" ON public.hr_evaluations FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.hr_annotations FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.hr_admissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.hr_terminations FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.hr_documentation FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select" ON public.hr_emergency_contacts FOR SELECT TO authenticated USING (true);

-- INSERT policies
CREATE POLICY "auth_insert" ON public.hr_evaluations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON public.hr_annotations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON public.hr_admissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON public.hr_terminations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON public.hr_documentation FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_insert" ON public.hr_emergency_contacts FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE policies
CREATE POLICY "auth_update" ON public.hr_evaluations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update" ON public.hr_annotations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update" ON public.hr_admissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update" ON public.hr_terminations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update" ON public.hr_documentation FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_update" ON public.hr_emergency_contacts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- DELETE policy (only for emergency contacts)
CREATE POLICY "auth_delete" ON public.hr_emergency_contacts FOR DELETE TO authenticated USING (true);
