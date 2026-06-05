CREATE POLICY "Authenticated can delete selfies"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'selfies');

CREATE POLICY "Authenticated can delete documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents');