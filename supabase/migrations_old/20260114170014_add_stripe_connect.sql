-- Add a column to store the Creator's connected Stripe Account ID (starts with 'acct_...')
alter table profiles 
add column stripe_account_id text;

-- Add a check to ensure users can't fake this (only editable via service role ideally, but for now we trust the flow)
-- Realistically, this field should only be updated by your server after a successful Stripe callback.