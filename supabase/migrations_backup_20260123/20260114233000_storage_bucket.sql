-- supabase/migrations/20260114233000_storage_bucket.sql

-- 1. Create the Storage Bucket for Ad Creatives
insert into storage.buckets (id, name, public)
values ('ad-creatives', 'ad-creatives', true)
on conflict (id) do nothing; -- Prevent error if it exists

-- 2. Security Policy: Allow ANYONE to View images (Public Read)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'ad-creatives' );

-- 3. Security Policy: Allow ANYONE to Upload images (Public Write)
-- Note: In a stricter app, we might check file size/type here in SQL, 
-- but we will rely on Client-side validation for this MVP.
create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'ad-creatives' );