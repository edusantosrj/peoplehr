-- Add interview_time and interview_observation columns to hr_evaluations
ALTER TABLE public.hr_evaluations
ADD COLUMN IF NOT EXISTS interview_time text,
ADD COLUMN IF NOT EXISTS interview_observation text;
