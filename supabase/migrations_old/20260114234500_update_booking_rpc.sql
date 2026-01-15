-- supabase/migrations/20260114234500_update_booking_rpc.sql

-- Redefine the function with the new 'new_image_path' argument
create or replace function update_booking_content(
  booking_id uuid,
  new_headline text,
  new_body text,
  new_link text,
  new_sponsor_name text,
  new_image_path text default null -- <--- Added this argument
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
    sponsor_name = new_sponsor_name,
    ad_image_path = new_image_path, -- <--- Update the column
    status = 'pending_payment'      -- Move status forward
  where id = booking_id
  and status = 'draft';             -- Security: Only allow if still in draft
end;
$$;