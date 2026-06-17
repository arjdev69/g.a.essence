insert into storage.buckets (id, name, public)
values ('appointment-calendars', 'appointment-calendars', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "public read appointment calendars" on storage.objects;
create policy "public read appointment calendars"
on storage.objects for select
using (bucket_id = 'appointment-calendars');

drop policy if exists "authenticated upload appointment calendars" on storage.objects;
create policy "authenticated upload appointment calendars"
on storage.objects for insert
with check (
  bucket_id = 'appointment-calendars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "authenticated update appointment calendars" on storage.objects;
create policy "authenticated update appointment calendars"
on storage.objects for update
using (
  bucket_id = 'appointment-calendars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'appointment-calendars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "authenticated delete appointment calendars" on storage.objects;
create policy "authenticated delete appointment calendars"
on storage.objects for delete
using (
  bucket_id = 'appointment-calendars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
