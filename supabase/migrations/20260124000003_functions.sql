-- Migration 03: Functions
-- All RPC functions with proper security (search_path set)
-- Date: 2026-01-24

-- ============================================
-- 1. HELPER FUNCTION: Validate days_of_week array
-- ============================================

CREATE OR REPLACE FUNCTION validate_days_of_week(days integer[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN days IS NULL THEN true
    WHEN array_length(days, 1) IS NULL THEN true
    WHEN array_length(days, 1) < 1 OR array_length(days, 1) > 7 THEN false
    ELSE (SELECT bool_and(d >= 0 AND d <= 6) FROM unnest(days) AS d)
  END;
$$;

-- ============================================
-- 2. TRIGGER FUNCTION: Handle new user signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated, service_role, anon;

-- ============================================
-- 3. FUNCTION: Create booking securely
-- ============================================

CREATE OR REPLACE FUNCTION create_booking(
  p_tier_id uuid,
  p_target_date date,
  p_newsletter_slug text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_newsletter_id uuid;
  v_new_id uuid;
BEGIN
  SELECT id INTO v_newsletter_id
  FROM newsletters
  WHERE slug = p_newsletter_slug;

  IF v_newsletter_id IS NULL THEN
    RAISE EXCEPTION 'Newsletter not found';
  END IF;

  INSERT INTO bookings (tier_id, target_date, newsletter_id, status)
  VALUES (p_tier_id, p_target_date, v_newsletter_id, 'draft')
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- ============================================
-- 4. FUNCTION: Update booking content
-- ============================================

CREATE OR REPLACE FUNCTION update_booking_content(
  booking_id uuid,
  new_headline text,
  new_body text,
  new_link text,
  new_sponsor_name text,
  new_image_path text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE bookings
  SET 
    ad_headline = new_headline,
    ad_body = new_body,
    ad_link = new_link,
    sponsor_name = new_sponsor_name,
    ad_image_path = new_image_path,
    status = 'pending_payment'
  WHERE id = booking_id
  AND status = 'draft'; -- Security: Only allow if still in draft
END;
$$;

-- ============================================
-- 5. FUNCTION: Get blocked dates for a tier
-- ============================================

CREATE OR REPLACE FUNCTION get_blocked_dates(queried_tier_id uuid)
RETURNS TABLE (target_date date)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT bookings.target_date
  FROM bookings
  WHERE bookings.tier_id = queried_tier_id
  AND bookings.status != 'rejected';
END;
$$;

-- ============================================
-- 6. FUNCTION: Get checkout data for Stripe
-- ============================================

CREATE OR REPLACE FUNCTION get_checkout_data(p_booking_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'price', t.price,
    'tier_name', t.name,
    'stripe_account_id', p.stripe_account_id,
    'newsletter_slug', n.slug
  ) INTO v_result
  FROM bookings b
  JOIN inventory_tiers t ON b.tier_id = t.id
  JOIN newsletters n ON b.newsletter_id = n.id
  JOIN profiles p ON n.owner_id = p.id
  WHERE b.id = p_booking_id;
  
  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Booking not found or missing required data';
  END IF;
  
  RETURN v_result;
END;
$$;

-- ============================================
-- 7. FUNCTION: Get booking for validation
-- ============================================

CREATE OR REPLACE FUNCTION get_booking_for_validation(p_booking_id uuid)
RETURNS TABLE (
  booking_id uuid,
  booking_status text,
  tier_id uuid,
  specs_headline_limit integer,
  specs_body_limit integer,
  specs_image_ratio text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id AS booking_id,
    b.status::text AS booking_status,
    b.tier_id,
    t.specs_headline_limit,
    t.specs_body_limit,
    t.specs_image_ratio
  FROM bookings b
  JOIN inventory_tiers t ON t.id = b.tier_id
  WHERE b.id = p_booking_id
  AND b.status = 'draft'; -- Only allow reading draft bookings
END;
$$;

-- ============================================
-- 8. FUNCTION: Cleanup expired drafts
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_drafts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM bookings
  WHERE status = 'draft'
  AND created_at < (now() - interval '15 minutes');
END;
$$;
