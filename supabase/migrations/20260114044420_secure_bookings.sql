-- 1. REVOKE EVERYTHING (Lock the doors)
DROP POLICY IF EXISTS "Public can view busy slots" ON bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
DROP POLICY IF EXISTS "Public can update draft bookings" ON bookings;

alter table bookings enable row level security;

-- 2. ALLOW INSERT (We still need strangers to create bookings)
create policy "Public can create bookings" 
  on bookings for insert 
  with check ( true );

-- 3. SECURE FUNCTION: Get Availability
-- This returns ONLY dates. It does NOT return IDs.
-- Attacker cannot find IDs to hijack.
create or replace function get_blocked_dates(queried_tier_id uuid)
returns table (target_date date)
language plpgsql
security definer
as $$
begin
  return query
  select bookings.target_date
  from bookings
  where bookings.tier_id = queried_tier_id
  and bookings.status != 'rejected';
end;
$$;

-- 4. SECURE FUNCTION: Update Booking
-- This bypasses RLS, but requires the User to provide the UUID.
-- Since they can't query the UUIDs, they can only update their own.
create or replace function update_booking_content(
  booking_id uuid, 
  new_headline text, 
  new_body text, 
  new_link text
)
returns void
language plpgsql
security definer
as $$
begin
  update bookings
  set 
    ad_headline = new_headline,
    ad_body = new_body,
    ad_link = new_link,
    status = 'pending_payment'
  where id = booking_id
  and status = 'draft'; -- Still enforce the Draft rule!
end;
$$;