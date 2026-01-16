-- supabase/migrations/20260115000003_get_booking_for_validation.sql

-- Create a function to get booking and tier info for validation
-- This bypasses RLS so users can validate their own bookings
create or replace function get_booking_for_validation(p_booking_id uuid)
returns table (
  booking_id uuid,
  booking_status text,
  tier_id uuid,
  specs_headline_limit integer,
  specs_body_limit integer,
  specs_image_ratio text
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    b.id as booking_id,
    b.status::text as booking_status,
    b.tier_id,
    t.specs_headline_limit,
    t.specs_body_limit,
    t.specs_image_ratio
  from bookings b
  join inventory_tiers t on t.id = b.tier_id
  where b.id = p_booking_id
  and b.status = 'draft'; -- Only allow reading draft bookings
end;
$$;
