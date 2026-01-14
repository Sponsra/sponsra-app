create or replace function create_booking(
  p_tier_id uuid,
  p_target_date date,
  p_newsletter_slug text
)
returns uuid
language plpgsql
security definer -- This runs as Admin to bypass RLS
as $$
declare
  v_newsletter_id uuid;
  v_new_id uuid;
begin
  -- 1. Find the newsletter ID
  select id into v_newsletter_id
  from newsletters
  where slug = p_newsletter_slug;

  if v_newsletter_id is null then
    raise exception 'Newsletter not found';
  end if;

  -- 2. Insert the booking securely
  insert into bookings (tier_id, target_date, newsletter_id, status)
  values (p_tier_id, p_target_date, v_newsletter_id, 'draft')
  returning id into v_new_id;

  -- 3. Return the new ID
  return v_new_id;
end;
$$;