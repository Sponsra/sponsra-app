-- 1. Add the column
alter table bookings 
add column sponsor_name text;

-- 2. Update the secure function to accept this new column
create or replace function update_booking_content(
  booking_id uuid, 
  new_headline text, 
  new_body text, 
  new_link text,
  new_sponsor_name text -- <--- Added this
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
    sponsor_name = new_sponsor_name, -- <--- Saving it
    status = 'pending_payment'
  where id = booking_id
  and status = 'draft'; 
end;
$$;