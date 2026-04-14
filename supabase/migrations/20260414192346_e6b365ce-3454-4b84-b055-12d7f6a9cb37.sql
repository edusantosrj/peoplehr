
-- Add selfie_url column to candidates
ALTER TABLE public.candidates ADD COLUMN selfie_url text;

-- Create storage bucket for selfies
INSERT INTO storage.buckets (id, name, public) VALUES ('selfies', 'selfies', true);

-- Allow public uploads (candidate registration is public)
CREATE POLICY "Anyone can upload selfies"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'selfies');

-- Allow public read (selfies are displayed publicly)
CREATE POLICY "Anyone can view selfies"
ON storage.objects FOR SELECT
USING (bucket_id = 'selfies');
