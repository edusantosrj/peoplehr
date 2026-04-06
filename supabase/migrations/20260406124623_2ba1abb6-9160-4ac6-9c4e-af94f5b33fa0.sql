
-- Tabela de candidatos
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cpf TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  marital_status TEXT NOT NULL,
  mother_name TEXT NOT NULL,
  father_name TEXT,
  whatsapp TEXT NOT NULL,
  instagram TEXT,
  facebook TEXT,
  address TEXT NOT NULL,
  address_number TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  education TEXT NOT NULL,
  course TEXT,
  period TEXT,
  has_technical_course BOOLEAN NOT NULL DEFAULT false,
  completed_courses TEXT[] DEFAULT '{}',
  other_courses TEXT,
  has_criminal_record BOOLEAN NOT NULL DEFAULT false,
  work_experiences JSONB DEFAULT '[]',
  salary_expectation TEXT NOT NULL,
  immediate_start BOOLEAN NOT NULL DEFAULT false,
  available_weekends BOOLEAN NOT NULL DEFAULT false,
  available_holidays BOOLEAN NOT NULL DEFAULT false,
  desired_position_1 TEXT NOT NULL,
  desired_position_2 TEXT,
  desired_position_3 TEXT,
  resume_url TEXT,
  other_files_urls TEXT[],
  lgpd_consent BOOLEAN NOT NULL DEFAULT false,
  lgpd_consent_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: tabela pública para inserção (formulário sem autenticação)
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (formulário público)
CREATE POLICY "Anyone can insert candidates"
  ON public.candidates FOR INSERT
  WITH CHECK (true);

-- Somente usuários autenticados podem visualizar
CREATE POLICY "Authenticated users can view candidates"
  ON public.candidates FOR SELECT
  TO authenticated
  USING (true);
