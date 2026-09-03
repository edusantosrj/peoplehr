-- Etapa 4.3 — Centralización segura del flujo de contratación
-- Crea la RPC public.transition_to_hired como autoridad transaccional única.
-- La RPC es idempotente y atómica: valida, actualiza hr_admissions,
-- actualiza hr_evaluations, registra hr_pipeline_events y debita la vaga
-- en una sola transacción PostgreSQL.

CREATE OR REPLACE FUNCTION public.transition_to_hired(
  p_candidate_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_admission public.hr_admissions%ROWTYPE;
  v_evaluation public.hr_evaluations%ROWTYPE;
  v_vacancy public.vacancies%ROWTYPE;
  v_hired_at timestamptz := now();
  v_from_stage text;
  v_new_quantity integer;
  v_new_status text;
  v_event_id uuid;
BEGIN
  -- 1. Validar que el candidato existe
  IF NOT EXISTS (SELECT 1 FROM public.candidates WHERE id = p_candidate_id) THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'error', 'Candidato no encontrado.'
    );
  END IF;

  -- 2. Serializar llamadas concurrentes por candidato y bloquear su admisión.
  --    a) La fila public.candidates SIEMPRE existe (validada en el paso 1).
  --       Bloquearla con FOR UPDATE la convierte en un mutex: dos llamadas
  --       simultáneas para el mismo candidato contienden por este lock. La
  --       primera completa toda la transacción y hace COMMIT; a continuación la
  --       segunda adquiere el lock y, bajo READ COMMITTED, re-ejecuta el SELECT
  --       de hr_admissions que ya ve la fila confirmada (hired_at != null),
  --       por lo que retorna 'already_hired'.
  --    b) Sin este lock, un candidato que AÚN NO tiene fila en hr_admissions
  --       provoca que el SELECT ... FOR UPDATE no bloquee nada (no encuentra
  --       ninguna fila): dos INSERT concurrentes colisionan en el UNIQUE de
  --       hr_admissions.candidate_id y la segunda lanza error 23505 en lugar de
  --       'already_hired'.
  PERFORM 1
    FROM public.candidates
    WHERE id = p_candidate_id
    FOR UPDATE;

  SELECT * INTO v_admission
  FROM public.hr_admissions
  WHERE candidate_id = p_candidate_id
  FOR UPDATE;

  -- 3. Verificar si ya está contratado (idempotencia)
  --    Fuentes consideradas:
  --    - hr_admissions.hired_at preenchido
  --    - hr_admissions.admission_status = 'Contratado'
  --    - hr_evaluations.candidate_hired = 'Sim'
  --    - hr_evaluations.current_stage = 'hired'
  IF v_admission.id IS NOT NULL THEN
    IF v_admission.hired_at IS NOT NULL OR v_admission.admission_status = 'Contratado' THEN
      RETURN jsonb_build_object(
        'status', 'already_hired',
        'hiredAt', v_admission.hired_at
      );
    END IF;
  END IF;

  SELECT * INTO v_evaluation
  FROM public.hr_evaluations
  WHERE candidate_id = p_candidate_id
  FOR UPDATE;

  IF v_evaluation.id IS NOT NULL THEN
    IF v_evaluation.candidate_hired = 'Sim' OR v_evaluation.current_stage = 'hired' THEN
      RETURN jsonb_build_object(
        'status', 'already_hired',
        'hiredAt', v_admission.hired_at
      );
    END IF;
  END IF;

  -- 4. Determinar el stage anterior conocido
  v_from_stage := COALESCE(v_evaluation.current_stage, 'validation_form');

  -- 5. Actualizar o crear hr_admissions
  IF v_admission.id IS NULL THEN
    INSERT INTO public.hr_admissions (
      candidate_id,
      admission_status,
      hired_at,
      updated_at
    ) VALUES (
      p_candidate_id,
      'Contratado',
      v_hired_at,
      now()
    );
  ELSE
    UPDATE public.hr_admissions
    SET admission_status = 'Contratado',
        hired_at = v_hired_at,
        updated_at = now()
    WHERE candidate_id = p_candidate_id;
  END IF;

  -- 6. Actualizar o crear hr_evaluations
  IF v_evaluation.id IS NULL THEN
    INSERT INTO public.hr_evaluations (
      candidate_id,
      candidate_hired,
      current_stage,
      updated_at
    ) VALUES (
      p_candidate_id,
      'Sim',
      'hired',
      now()
    );
  ELSE
    UPDATE public.hr_evaluations
    SET candidate_hired = 'Sim',
        current_stage = 'hired',
        updated_at = now()
    WHERE candidate_id = p_candidate_id;
  END IF;

  -- 7. Registrar evento de auditoría (exactamente uno)
  INSERT INTO public.hr_pipeline_events (
    candidate_id,
    from_stage,
    to_stage,
    event_type,
    created_by
  ) VALUES (
    p_candidate_id,
    v_from_stage,
    'hired',
    'hired',
    v_user_id
  )
  RETURNING id INTO v_event_id;

  -- 8. Debitar la vaga si existe vacancy_id
  IF v_admission.vacancy_id IS NOT NULL THEN
    SELECT * INTO v_vacancy
    FROM public.vacancies
    WHERE id = v_admission.vacancy_id::uuid
    FOR UPDATE;

    IF v_vacancy.id IS NOT NULL AND v_vacancy.quantity > 0 THEN
      v_new_quantity := v_vacancy.quantity - 1;
      v_new_status := CASE WHEN v_new_quantity = 0 THEN 'Inativa' ELSE v_vacancy.status END;

      UPDATE public.vacancies
      SET quantity = v_new_quantity,
          status = v_new_status,
          updated_at = now()
      WHERE id = v_vacancy.id;
    END IF;
  END IF;

  -- 9. Retornar resultado exitoso
  RETURN jsonb_build_object(
    'status', 'hired',
    'hiredAt', v_hired_at,
    'eventId', v_event_id,
    'vacancyDebited', (v_admission.vacancy_id IS NOT NULL AND v_vacancy.id IS NOT NULL AND v_vacancy.quantity > 0)
  );
END;
$$;

-- Revocar ejecución pública y otorgar solo a authenticated
REVOKE EXECUTE ON FUNCTION public.transition_to_hired(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.transition_to_hired(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.transition_to_hired(uuid) TO authenticated;