-- 1. SECURE BOOKING FUNCTION (Restores the "Database Error" fix)
create or replace function create_booking(
  p_tier_id uuid,
  p_target_date date,
  p_newsletter_slug text
)
returns uuid
language plpgsql
security definer -- Runs as Admin
as $$
declare
  v_newsletter_id uuid;
  v_new_id uuid;
begin
  select id into v_newsletter_id
  from newsletters
  where slug = p_newsletter_slug;

  if v_newsletter_id is null then
    raise exception 'Newsletter not found';
  end if;

  insert into bookings (tier_id, target_date, newsletter_id, status)
  values (p_tier_id, p_target_date, v_newsletter_id, 'draft')
  returning id into v_new_id;

  return v_new_id;
end;
$$;

-- 2. DASHBOARD VISIBILITY POLICY (Restores the Empty Dashboard fix)
-- First, drop to avoid duplicates if it exists
drop policy if exists "Creators can manage their own bookings" on bookings;

create policy "Creators can manage their own bookings"
  on bookings
  for all
  using (
    exists (
      select 1 from newsletters
      where newsletters.id = bookings.newsletter_id
      and newsletters.owner_id = auth.uid()
    )
  );