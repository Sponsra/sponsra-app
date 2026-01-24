-- Add sponsor_name column to bookings table (safety check - already added in migration 9)
-- This migration serves as a safety check in case migration 9 didn't run or was rolled back
alter table bookings 
add column if not exists sponsor_name text;
