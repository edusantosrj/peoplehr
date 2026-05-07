
insert into storage.buckets (id, name, public) values ('documents', 'documents', true) on conflict (id) do nothing;

create policy "Public read documents"
on storage.objects for select
using (bucket_id = 'documents');

create policy "Anyone can upload documents"
on storage.objects for insert
with check (bucket_id = 'documents');
