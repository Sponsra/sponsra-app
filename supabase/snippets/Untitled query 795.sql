-- 2. Enable the extension (if not already enabled)
create extension if not exists pg_cron;

-- 3. Schedule the job to run every minute
select cron.schedule(
  'cleanup-drafts', -- name of the job
  '* * * * *',      -- every minute (cron syntax)
  $$select cleanup_expired_drafts()$$
);