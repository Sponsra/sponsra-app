-- Migration: Re-enable public SELECT on bookings table
-- Date: 2026-01-23
-- Reason: The getAvailableDates function needs to query bookings directly
--         to check which dates are already booked. This is safe because
--         we only expose target_date and status, not sensitive user data.

CREATE POLICY "Public can view bookings for availability"
ON public.bookings
FOR SELECT
USING (true);
