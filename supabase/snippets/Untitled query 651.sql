-- 1. Create the cleanup function
create or replace function cleanup_expired_drafts()
returns void
language plpgsql
security definer
as $$
begin
  delete from bookings
  where status = 'draft'
  and created_at < (now() - interval '15 minutes');
end;
$$;