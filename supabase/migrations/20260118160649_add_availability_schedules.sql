-- Migration: Add Availability Scheduling System
-- Creates tables for newsletter publication schedules and tier availability schedules
-- All date fields use DATE type (not TIMESTAMPTZ) to prevent timezone shifts

-- 1. Create enum for schedule types
create type schedule_type as enum ('recurring', 'one_off', 'all_dates');

-- 2. Create enum for pattern types
-- Note: 'monthly_date' = specific day of month (e.g., 15th)
--       'monthly_day' = nth occurrence of day-of-week (e.g., 2nd Tuesday)
create type pattern_type as enum ('weekly', 'biweekly', 'monthly_date', 'monthly_day', 'custom');

-- 2.5. Create function to validate days_of_week array
-- This function is immutable and can be used in CHECK constraints
create or replace function validate_days_of_week(days integer[])
returns boolean
language sql
immutable
as $$
  select case
    when days is null then true
    when array_length(days, 1) is null then true
    when array_length(days, 1) < 1 or array_length(days, 1) > 7 then false
    else (select bool_and(d >= 0 and d <= 6) from unnest(days) as d)
  end;
$$;

-- 3. Create newsletter_publication_schedules table
create table newsletter_publication_schedules (
  id uuid default gen_random_uuid() primary key,
  newsletter_id uuid references newsletters(id) on delete cascade not null,
  schedule_type schedule_type not null,
  pattern_type pattern_type, -- nullable for one_off schedules
  days_of_week integer[], -- Array of day numbers (0=Sunday, 6=Saturday)
  day_of_month integer, -- For monthly_date patterns (1-31)
  monthly_week_number integer, -- For monthly_day patterns (1-5, e.g., 2 = 2nd Tuesday)
  start_date date not null, -- Start of recurring pattern (DATE type, not TIMESTAMPTZ)
  end_date date, -- End of recurring pattern (null = indefinite)
  specific_dates date[], -- For one-off dates (DATE type)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraints
  constraint pattern_type_check check (
    (schedule_type = 'recurring' and pattern_type is not null) or
    (schedule_type = 'one_off' and pattern_type is null)
  ),
  constraint days_of_week_check check (
    validate_days_of_week(days_of_week)
  ),
  constraint day_of_month_check check (
    day_of_month is null or (day_of_month >= 1 and day_of_month <= 31)
  ),
  constraint monthly_week_number_check check (
    monthly_week_number is null or (monthly_week_number >= 1 and monthly_week_number <= 5)
  ),
  constraint start_end_date_check check (
    end_date is null or end_date >= start_date
  )
);

-- 4. Create tier_availability_schedules table
create table tier_availability_schedules (
  id uuid default gen_random_uuid() primary key,
  tier_id uuid references inventory_tiers(id) on delete cascade not null,
  schedule_type schedule_type not null,
  pattern_type pattern_type, -- nullable for one_off and all_dates schedules
  days_of_week integer[],
  day_of_month integer,
  monthly_week_number integer,
  start_date date, -- nullable for all_dates
  end_date date,
  specific_dates date[],
  is_available boolean default true, -- Can mark dates as explicitly unavailable
  capacity integer default 1, -- Allows multiple bookings per date (future-proofing)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraints
  constraint tier_pattern_type_check check (
    (schedule_type = 'all_dates' and pattern_type is null) or
    (schedule_type = 'recurring' and pattern_type is not null) or
    (schedule_type = 'one_off' and pattern_type is null)
  ),
  constraint tier_days_of_week_check check (
    validate_days_of_week(days_of_week)
  ),
  constraint tier_day_of_month_check check (
    day_of_month is null or (day_of_month >= 1 and day_of_month <= 31)
  ),
  constraint tier_monthly_week_number_check check (
    monthly_week_number is null or (monthly_week_number >= 1 and monthly_week_number <= 5)
  ),
  constraint tier_start_end_date_check check (
    end_date is null or start_date is null or end_date >= start_date
  ),
  constraint tier_capacity_check check (capacity >= 1)
);

-- 5. Add unique constraint to bookings table (if not already exists)
-- Note: The constraint unique_slot_per_date already exists in create_bookings_table.sql
-- This is here for reference and to ensure it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_tier_date'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT unique_tier_date
    UNIQUE (tier_id, target_date);
  END IF;
END $$;

-- 6. Enable RLS on new tables
alter table newsletter_publication_schedules enable row level security;
alter table tier_availability_schedules enable row level security;

-- 7. RLS Policies for newsletter_publication_schedules
-- Public can view schedules (needed for availability calculation)
create policy "Public can view publication schedules"
  on newsletter_publication_schedules for select
  using (true);

-- Creators can manage their own newsletter schedules
create policy "Creators can manage their publication schedules"
  on newsletter_publication_schedules for all
  using (
    exists (
      select 1 from newsletters
      where newsletters.id = newsletter_publication_schedules.newsletter_id
      and newsletters.owner_id = auth.uid()
    )
  );

-- 8. RLS Policies for tier_availability_schedules
-- Public can view tier schedules (needed for availability calculation)
create policy "Public can view tier availability schedules"
  on tier_availability_schedules for select
  using (true);

-- Creators can manage their own tier schedules
create policy "Creators can manage their tier availability schedules"
  on tier_availability_schedules for all
  using (
    exists (
      select 1 from inventory_tiers
      join newsletters on newsletters.id = inventory_tiers.newsletter_id
      where inventory_tiers.id = tier_availability_schedules.tier_id
      and newsletters.owner_id = auth.uid()
    )
  );

-- 9. Create indexes for performance
create index idx_newsletter_schedules_newsletter_id on newsletter_publication_schedules(newsletter_id);
create index idx_tier_schedules_tier_id on tier_availability_schedules(tier_id);
