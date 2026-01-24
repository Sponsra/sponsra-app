-- Migration 02: RLS Policies
-- All Row Level Security policies in one place
-- Date: 2026-01-24

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. PROFILES POLICIES
-- ============================================

-- Public can view all profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Service role can insert profiles (for trigger function)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 3. NEWSLETTERS POLICIES
-- ============================================

-- Public can view all newsletters
CREATE POLICY "Newsletters are viewable by everyone"
  ON newsletters FOR SELECT
  USING (true);

-- Creators can insert their own newsletters
CREATE POLICY "Creators can insert their own newsletter"
  ON newsletters FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Creators can update their own newsletters
CREATE POLICY "Creators can update their own newsletter"
  ON newsletters FOR UPDATE
  USING (auth.uid() = owner_id);

-- ============================================
-- 4. INVENTORY TIERS POLICIES
-- ============================================

-- Public can view all tiers (for sponsor portal)
CREATE POLICY "Inventory tiers are viewable by everyone"
  ON inventory_tiers FOR SELECT
  USING (true);

-- Creators can insert/update/delete their own tiers
CREATE POLICY "Creators can manage their own tiers"
  ON inventory_tiers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM newsletters 
      WHERE newsletters.id = inventory_tiers.newsletter_id 
      AND newsletters.owner_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update their own tiers"
  ON inventory_tiers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM newsletters 
      WHERE newsletters.id = inventory_tiers.newsletter_id 
      AND newsletters.owner_id = auth.uid()
    )
  );

CREATE POLICY "Creators can delete their own tiers"
  ON inventory_tiers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM newsletters 
      WHERE newsletters.id = inventory_tiers.newsletter_id 
      AND newsletters.owner_id = auth.uid()
    )
  );

-- ============================================
-- 5. BOOKINGS POLICIES
-- ============================================

-- Public can view bookings (for availability check)
CREATE POLICY "Public can view bookings for availability"
  ON bookings FOR SELECT
  USING (true);

-- Public can create bookings (but only in draft status)
CREATE POLICY "Public can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (status = 'draft'::booking_status);

-- Creators can manage their own bookings
CREATE POLICY "Creators can manage their own bookings"
  ON bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = bookings.newsletter_id
      AND newsletters.owner_id = auth.uid()
    )
  );

-- ============================================
-- 6. AVAILABILITY EXCEPTIONS POLICIES
-- ============================================

-- Public can view exceptions (for availability calculation)
CREATE POLICY "Public can view availability exceptions"
  ON availability_exceptions FOR SELECT
  USING (true);

-- Creators can manage their own exceptions
CREATE POLICY "Creators can manage their exceptions"
  ON availability_exceptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = availability_exceptions.newsletter_id
      AND newsletters.owner_id = auth.uid()
    )
  );
