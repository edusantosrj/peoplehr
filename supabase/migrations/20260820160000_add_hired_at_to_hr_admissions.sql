-- Etapa 4.1 — Pipeline Contratado
-- Adiciona hired_at em hr_admissions para registrar quando o candidato foi contratado.
-- Permite NULL para preservar dados legados (conversão será tratada em etapa posterior).

ALTER TABLE public.hr_admissions
  ADD COLUMN IF NOT EXISTS hired_at timestamptz;