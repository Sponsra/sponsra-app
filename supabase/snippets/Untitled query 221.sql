create or replace function get_checkout_data(p_booking_id uuid)
returns json
language plpgsql
security definer -- <--- SUPER IMPORTANT: Runs as Admin
as $$
declare
  v_result json;
begin
  select json_build_object(
    'price', t.price,
    'tier_name', t.name,
    'stripe_account_id', p.stripe_account_id
  ) into v_result
  from bookings b
  join inventory_tiers t on b.tier_id = t.id
  join newsletters n on b.newsletter_id = n.id
  join profiles p on n.owner_id = p.id
  where b.id = p_booking_id;
  
  return v_result;
end;
$$;