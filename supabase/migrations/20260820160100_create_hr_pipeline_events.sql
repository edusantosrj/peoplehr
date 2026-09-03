-- Etapa 4.1 — Pipeline Contratado
-- Cria tabela de auditoria do pipeline (hr_pipeline_events).
-- Registra transições de estágio do pipeline de contratação.
-- Segue o padrão do projeto: UUID, timestamptz, RLS com políticas authenticated.

CREATE TABLE public.hr_pipeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  from_stage text,
  to_stage text NOT NULL,
  event_type text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para consultas por candidato (auditoria do pipeline)
CREATE INDEX IF NOT EXISTS idx_hr_pipeline_events_candidate_id
  ON public.hr_pipeline_events (candidate_id);

-- Índice para consultas por data (auditoria temporal)
CREATE INDEX IF NOT EXISTS idx_hr_pipeline_events_created_at
  ON public.hr_pipeline_events (created_at);

-- Enable RLS
ALTER TABLE public.hr_pipeline_events ENABLE ROW LEVEL SECURITY;

-- SELECT policies (authenticated only)
CREATE POLICY "auth_select" ON public.hr_pipeline_events
  FOR SELECT TO authenticated USING (true);

-- INSERT policies (authenticated only)
CREATE POLICY "auth_insert" ON public.hr_pipeline_events
  FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE policies (authenticated only)
CREATE POLICY "auth_update" ON public.hr_pipeline_events
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);