-- Add columns to cache Stripe account status
alter table profiles
add column stripe_charges_enabled boolean default false,
add column stripe_details_submitted boolean default false;
