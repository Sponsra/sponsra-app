-- Migration: Security Fixes from Review
-- Date: 2026-01-23

-- 1. Fix mutable search_path in functions
-- These functions were identified as having a mutable search_path, which is a security risk.

ALTER FUNCTION public.validate_days_of_week(integer[]) SET search_path = public;
ALTER FUNCTION public.get_blocked_dates(uuid) SET search_path = public;
ALTER FUNCTION public.update_booking_content(uuid, text, text, text, text, text) SET search_path = public;
ALTER FUNCTION public.get_checkout_data(uuid) SET search_path = public;

-- 2. Fix permissive RLS policy on bookings
-- The "Public can create bookings" policy is too permissive (allowing any insert).
-- We restrict it to only allow creating bookings with status 'draft'.

DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;

CREATE POLICY "Public can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  status = 'draft'::booking_status
);
