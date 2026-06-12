REVOKE SELECT ON public.vacancies FROM anon;

GRANT SELECT (
  id, name, unit, shift, sector, type, quantity,
  work_hours_start, work_hours_end, gross_salary,
  status, created_at, updated_at,
  mission, responsibilities, expectations, offerings
) ON public.vacancies TO anon;