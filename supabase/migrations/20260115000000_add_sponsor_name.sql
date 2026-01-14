-- Add sponsor_name column to bookings table
alter table bookings 
add column if not exists sponsor_name text;

-- Update the secure function to accept and save sponsor_name
create or replace function update_booking_content(
  booking_id uuid, 
  new_headline text, 
  new_body text, 
  new_link text,
  new_sponsor_name text
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
    status = 'pending_payment'
  where id = booking_id
  and status = 'draft'; 
end;
$$;
