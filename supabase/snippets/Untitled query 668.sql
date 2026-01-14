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
  -- 1. Look up the newsletter ID internally
  select id into v_newsletter_id
  from newsletters
  where slug = p_newsletter_slug;

  if v_newsletter_id is null then
    raise exception 'Newsletter not found';
  end if;

  -- 2. Insert the booking and capture the ID
  insert into bookings (tier_id, target_date, newsletter_id, status)
  values (p_tier_id, p_target_date, v_newsletter_id, 'draft')
  returning id into v_new_id;

  -- 3. Return the ID to the client
  return v_new_id;
end;
$$;