
-- Remove anon SELECT exposing all PII
DROP POLICY IF EXISTS "Anon can check CPF existence" ON public.candidates;

REVOKE SELECT ON public.candidates FROM anon;

-- Function: anonymous CPF-existence check (boolean only)
CREATE OR REPLACE FUNCTION public.candidate_cpf_exists(p_cpf text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.candidates WHERE cpf = regexp_replace(p_cpf, '\D', '', 'g')
  );
$$;

REVOKE ALL ON FUNCTION public.candidate_cpf_exists(text) FROM public;
GRANT EXECUTE ON FUNCTION public.candidate_cpf_exists(text) TO anon, authenticated;

-- Function: submit (insert or update by cpf) candidate application from anon form.
-- Preserves existing file URLs if not supplied. Returns nothing.
CREATE OR REPLACE FUNCTION public.submit_candidate_application(p_payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cpf text := regexp_replace(coalesce(p_payload->>'cpf',''), '\D', '', 'g');
  v_existing public.candidates%ROWTYPE;
BEGIN
  IF v_cpf = '' THEN
    RAISE EXCEPTION 'cpf required';
  END IF;

  SELECT * INTO v_existing FROM public.candidates WHERE cpf = v_cpf LIMIT 1;

  IF FOUND THEN
    UPDATE public.candidates SET
      full_name = coalesce(p_payload->>'full_name', full_name),
      nickname = p_payload->>'nickname',
      gender = p_payload->>'gender',
      birth_date = coalesce(p_payload->>'birth_date', birth_date),
      marital_status = coalesce(p_payload->>'marital_status', marital_status),
      mother_name = coalesce(p_payload->>'mother_name', mother_name),
      father_name = p_payload->>'father_name',
      whatsapp = coalesce(p_payload->>'whatsapp', whatsapp),
      instagram = p_payload->>'instagram',
      facebook = p_payload->>'facebook',
      address = coalesce(p_payload->>'address', address),
      address_number = coalesce(p_payload->>'address_number', address_number),
      neighborhood = coalesce(p_payload->>'neighborhood', neighborhood),
      city = coalesce(p_payload->>'city', city),
      state = coalesce(p_payload->>'state', state),
      education = coalesce(p_payload->>'education', education),
      course = p_payload->>'course',
      period = p_payload->>'period',
      has_technical_course = coalesce((p_payload->>'has_technical_course')::boolean, has_technical_course),
      completed_courses = coalesce(
        (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p_payload->'completed_courses')),
        completed_courses
      ),
      other_courses = p_payload->>'other_courses',
      has_criminal_record = coalesce((p_payload->>'has_criminal_record')::boolean, has_criminal_record),
      first_job = coalesce((p_payload->>'first_job')::boolean, first_job),
      work_experiences = coalesce(p_payload->'work_experiences', work_experiences),
      salary_expectation = coalesce(p_payload->>'salary_expectation', salary_expectation),
      immediate_start = coalesce((p_payload->>'immediate_start')::boolean, immediate_start),
      available_weekends = coalesce((p_payload->>'available_weekends')::boolean, available_weekends),
      available_holidays = coalesce((p_payload->>'available_holidays')::boolean, available_holidays),
      desired_position_1 = coalesce(p_payload->>'desired_position_1', desired_position_1),
      desired_position_2 = p_payload->>'desired_position_2',
      desired_position_3 = p_payload->>'desired_position_3',
      lgpd_consent = coalesce((p_payload->>'lgpd_consent')::boolean, lgpd_consent),
      lgpd_consent_date = CASE
        WHEN (p_payload->>'lgpd_consent')::boolean IS TRUE THEN now()
        ELSE lgpd_consent_date
      END,
      selfie_url = coalesce(p_payload->>'selfie_url', selfie_url),
      resume_url = coalesce(p_payload->>'resume_url', resume_url),
      other_files_urls = coalesce(
        (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p_payload->'other_files_urls')),
        other_files_urls
      )
    WHERE id = v_existing.id;
  ELSE
    INSERT INTO public.candidates (
      cpf, full_name, nickname, gender, birth_date, marital_status, mother_name, father_name,
      whatsapp, instagram, facebook, address, address_number, neighborhood, city, state,
      education, course, period, has_technical_course, completed_courses, other_courses,
      has_criminal_record, first_job, work_experiences, salary_expectation, immediate_start,
      available_weekends, available_holidays, desired_position_1, desired_position_2, desired_position_3,
      lgpd_consent, lgpd_consent_date, selfie_url, resume_url, other_files_urls
    ) VALUES (
      v_cpf,
      p_payload->>'full_name',
      p_payload->>'nickname',
      p_payload->>'gender',
      p_payload->>'birth_date',
      p_payload->>'marital_status',
      p_payload->>'mother_name',
      p_payload->>'father_name',
      p_payload->>'whatsapp',
      p_payload->>'instagram',
      p_payload->>'facebook',
      p_payload->>'address',
      p_payload->>'address_number',
      p_payload->>'neighborhood',
      p_payload->>'city',
      p_payload->>'state',
      p_payload->>'education',
      p_payload->>'course',
      p_payload->>'period',
      coalesce((p_payload->>'has_technical_course')::boolean, false),
      coalesce((SELECT array_agg(value::text) FROM jsonb_array_elements_text(p_payload->'completed_courses')), '{}'::text[]),
      p_payload->>'other_courses',
      coalesce((p_payload->>'has_criminal_record')::boolean, false),
      coalesce((p_payload->>'first_job')::boolean, false),
      coalesce(p_payload->'work_experiences', '[]'::jsonb),
      p_payload->>'salary_expectation',
      coalesce((p_payload->>'immediate_start')::boolean, false),
      coalesce((p_payload->>'available_weekends')::boolean, false),
      coalesce((p_payload->>'available_holidays')::boolean, false),
      p_payload->>'desired_position_1',
      p_payload->>'desired_position_2',
      p_payload->>'desired_position_3',
      coalesce((p_payload->>'lgpd_consent')::boolean, false),
      CASE WHEN (p_payload->>'lgpd_consent')::boolean IS TRUE THEN now() ELSE NULL END,
      p_payload->>'selfie_url',
      p_payload->>'resume_url',
      (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p_payload->'other_files_urls'))
    );
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_candidate_application(jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.submit_candidate_application(jsonb) TO anon, authenticated;
