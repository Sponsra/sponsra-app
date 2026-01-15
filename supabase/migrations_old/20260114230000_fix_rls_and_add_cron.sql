-- supabase/migrations/20260114230000_fix_rls_and_add_cron.sql

-- SECTION 1: Fix Portal Access (The "Missing" RLS Policy)
-- We explicitly drop it first to avoid conflicts if it already exists
drop policy if exists "Inventory tiers are viewable by everyone" on inventory_tiers;

create policy "Inventory tiers are viewable by everyone"
  on inventory_tiers for select
  using ( true );


-- SECTION 2: The Janitor (Cron Job for 15-min soft lock)

-- 1. Create the cleanup function
create or replace function cleanup_expired_drafts()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete bookings that are still in 'draft' and older than 15 mins
  delete from bookings
  where status = 'draft'
  and created_at < (now() - interval '15 minutes');
end;
$$;

-- 2. Enable the extension (required for scheduling)
create extension if not exists pg_cron with schema extensions;

-- 3. Schedule the job (unschedule first to prevent duplicates, if it exists)
do $$
begin
  -- Check if job exists and unschedule it
  if exists (
    select 1 from cron.job where jobname = 'cleanup-drafts'
  ) then
    perform cron.unschedule('cleanup-drafts');
  end if;
exception
  when others then
    -- If cron.job table doesn't exist yet or other error, continue anyway
    null;
end $$;

select cron.schedule(
  'cleanup-drafts',   -- unique job name
  '* * * * *',        -- run every minute
  $$select cleanup_expired_drafts()$$
);