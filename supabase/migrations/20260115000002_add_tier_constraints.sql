-- supabase/migrations/20260115000002_add_tier_constraints.sql

alter table inventory_tiers
add column specs_headline_limit integer default 60,
add column specs_body_limit integer default 280,
add column specs_image_ratio text default 'any'; -- 'any', '1:1', '1.91:1', 'no_image'

-- Update existing rows to have defaults
update inventory_tiers
set 
  specs_headline_limit = 60,
  specs_body_limit = 280,
  specs_image_ratio = 'any'
where specs_headline_limit is null;