create type booking_status as enum ('draft', 'pending_payment', 'paid', 'approved', 'rejected');

create table bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  newsletter_id uuid references newsletters(id) not null,
  tier_id uuid references inventory_tiers(id) not null,
  sponsor_email text, -- Can be null initially if just checking availability
  target_date date not null, -- The date the ad runs
  status booking_status default 'draft',
  
  -- Constraints
  -- 1. Prevent double booking: Unique combination of Tier + Date (if status is not rejected)
  -- This is a "Soft Lock". We might refine this later for "Multiple Ads per Issue".
  constraint unique_slot_per_date unique (tier_id, target_date)
);

-- RLS
alter table bookings enable row level security;

-- Public can READ bookings (to see what dates are taken)
create policy "Public can view busy slots" 
  on bookings for select 
  using ( true );

-- Public can INSERT bookings (to buy a slot)
create policy "Public can create bookings" 
  on bookings for insert 
  with check ( true );