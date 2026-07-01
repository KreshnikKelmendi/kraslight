-- Run this in Supabase SQL Editor AFTER schema.sql
-- Creates public bucket + secure Storage policies (no public file listing)

-- ── 1. Table grants (API access) ─────────────────────────────────────────
alter table if exists products disable row level security;
alter table if exists collections disable row level security;
alter table if exists orders disable row level security;
alter table if exists sliders disable row level security;
alter table if exists subscribers disable row level security;

grant all on products to anon, authenticated, service_role;
grant all on collections to anon, authenticated, service_role;
grant all on orders to anon, authenticated, service_role;
grant all on sliders to anon, authenticated, service_role;
grant all on subscribers to anon, authenticated, service_role;

-- ── 2. Public storage bucket ───────────────────────────────────────────────
-- Public bucket = files open via direct URL. No broad SELECT policy needed
-- (that policy would let anyone LIST all files in the bucket).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kraslight',
  'kraslight',
  true,
  10485760,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Remove old permissive policies (including the one that triggers the security warning)
drop policy if exists "kraslight_public_read" on storage.objects;
drop policy if exists "kraslight_insert" on storage.objects;
drop policy if exists "kraslight_update" on storage.objects;
drop policy if exists "kraslight_delete" on storage.objects;

-- Uploads/deletes only from server API (service_role key) — not anonymous clients
drop policy if exists "kraslight_insert_service" on storage.objects;
create policy "kraslight_insert_service"
on storage.objects for insert
to service_role
with check (bucket_id = 'kraslight');

drop policy if exists "kraslight_update_service" on storage.objects;
create policy "kraslight_update_service"
on storage.objects for update
to service_role
using (bucket_id = 'kraslight');

drop policy if exists "kraslight_delete_service" on storage.objects;
create policy "kraslight_delete_service"
on storage.objects for delete
to service_role
using (bucket_id = 'kraslight');
