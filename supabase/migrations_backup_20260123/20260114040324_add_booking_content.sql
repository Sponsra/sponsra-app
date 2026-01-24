-- Add content columns to the bookings table
alter table bookings 
add column ad_headline text,
add column ad_body text,
add column ad_link text,
add column ad_image_path text; -- Path in Supabase Storage

-- Add specific constraints (The Database-Level "Bouncer")
alter table bookings
add constraint headline_length check (char_length(ad_headline) <= 100),
add constraint body_length check (char_length(ad_body) <= 500);