-- Migration: Security Fixes Part 2 (Additional Functions)
-- Date: 2026-01-23

-- 1. Secure functions
ALTER FUNCTION public.cleanup_expired_drafts() SET search_path = public;
ALTER FUNCTION public.get_booking_for_validation(uuid) SET search_path = public;
ALTER FUNCTION public.create_booking(uuid, date, text) SET search_path = public;

-- 2. Clean up obsolete function overload and secure the correct one
DROP FUNCTION IF EXISTS public.update_booking_content(uuid, text, text, text);
ALTER FUNCTION public.update_booking_content(uuid, text, text, text, text, text) SET search_path = public;
