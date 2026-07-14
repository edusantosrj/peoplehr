DROP POLICY IF EXISTS "Anyone can view selfies" ON storage.objects;
DROP POLICY IF EXISTS "Public read documents" ON storage.objects;

CREATE POLICY "Authenticated can read selfies"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'selfies');

CREATE POLICY "Authenticated can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');