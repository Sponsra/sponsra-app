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

-- 3. ENSURE STRIPE COLUMNS EXIST (Safety check)
-- In case the previous migration didn't catch this
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'stripe_account_id') then
        alter table profiles add column stripe_account_id text;
    end if; 
end $$;

-- 4. RE-APPLY OTHER SECURE FUNCTIONS (Just in case)
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
  and status = 'draft'; 
end;
$$;