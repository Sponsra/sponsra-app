-- Migration: Simplify Scheduling Schema
-- Date: 2026-01-22

-- 1. Create availability_exceptions table
create table availability_exceptions (
  id uuid default gen_random_uuid() primary key,
  newsletter_id uuid references newsletters(id) on delete cascade not null,
  date date not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_newsletter_date unique (newsletter_id, date)
);

-- 2. Add available_days to inventory_tiers
-- Validating that array contains only 0-6 is good practice but keeping it simple for now
alter table inventory_tiers
add column available_days integer[] default '{1, 2, 3, 4, 5}'; -- Default Mon-Fri

-- 3. Cleanup Legacy Tables
drop table if exists newsletter_publication_schedules;
drop table if exists tier_availability_schedules;
drop type if exists schedule_type;
drop type if exists pattern_type;

-- 4. RLS for availability_exceptions
alter table availability_exceptions enable row level security;

create policy "Public can view availability exceptions"
  on availability_exceptions for select
  using (true);

create policy "Creators can manage their exceptions"
  on availability_exceptions for all
  using (
    exists (
      select 1 from newsletters
      where newsletters.id = availability_exceptions.newsletter_id
      and newsletters.owner_id = auth.uid()
    )
  );

-- 5. Add index for performance
create index idx_availability_exceptions_newsletter_date 
  on availability_exceptions(newsletter_id, date);
