-- 1. Create the Newsletters table
create table newsletters (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references public.profiles(id) not null,
  name text not null,
  slug text not null unique, -- This is for sponsra.link/slug
  description text,
  logo_url text,
  
  constraint slug_length check (char_length(slug) >= 3)
);

-- 2. Create the Inventory Tiers table
create type tier_type as enum ('ad', 'sponsor');

create table inventory_tiers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  newsletter_id uuid references newsletters(id) on delete cascade not null,
  name text not null, -- e.g. "Primary Sponsorship"
  type tier_type not null, -- 'ad' or 'sponsor'
  price integer not null, -- Stored in cents (e.g., 50000 = $500.00)
  description text,
  is_active boolean default true
);

-- 3. Enable Security (RLS)
alter table newsletters enable row level security;
alter table inventory_tiers enable row level security;

-- Policies for Newsletters
create policy "Newsletters are viewable by everyone." 
  on newsletters for select using ( true );

create policy "Creators can insert their own newsletter." 
  on newsletters for insert with check ( auth.uid() = owner_id );

create policy "Creators can update their own newsletter." 
  on newsletters for update using ( auth.uid() = owner_id );

-- Policies for Inventory Tiers
create policy "Tiers are viewable by everyone." 
  on inventory_tiers for select using ( true );

create policy "Creators can manage their own tiers." 
  on inventory_tiers for all 
  using ( 
    exists (
      select 1 from newsletters 
      where newsletters.id = inventory_tiers.newsletter_id 
      and newsletters.owner_id = auth.uid()
    ) 
  );