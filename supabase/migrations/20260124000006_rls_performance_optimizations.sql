-- Migration 06: RLS Performance Optimizations
-- Fix auth.uid() calls to use subquery pattern for better performance
-- Date: 2026-01-24

-- ============================================
-- 1. PROFILES POLICIES - Fix auth.uid() calls
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING ((select auth.uid()) = id);

-- ============================================
-- 2. NEWSLETTERS POLICIES - Fix auth.uid() calls
-- ============================================

DROP POLICY IF EXISTS "Creators can insert their own newsletter" ON newsletters;
CREATE POLICY "Creators can insert their own newsletter"
  ON newsletters FOR INSERT
  WITH CHECK ((select auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Creators can update their own newsletter" ON newsletters;
CREATE POLICY "Creators can update their own newsletter"
  ON newsletters FOR UPDATE
  USING ((select auth.uid()) = owner_id);

-- ============================================
-- 3. INVENTORY TIERS POLICIES - Fix auth.uid() calls
-- ============================================

DROP POLICY IF EXISTS "Creators can manage their own tiers" ON inventory_tiers;
DROP POLICY IF EXISTS "Creators can update their own tiers" ON inventory_tiers;
DROP POLICY IF EXISTS "Creators can delete their own tiers" ON inventory_tiers;

CREATE POLICY "Creators can insert their own tiers"
  ON inventory_tiers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM newsletters 
      WHERE newsletters.id = inventory_tiers.newsletter_id 
      AND newsletters.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Creators can update their own tiers"
  ON inventory_tiers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM newsletters 
      WHERE newsletters.id = inventory_tiers.newsletter_id 
      AND newsletters.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Creators can delete their own tiers"
  ON inventory_tiers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM newsletters 
      WHERE newsletters.id = inventory_tiers.newsletter_id 
      AND newsletters.owner_id = (select auth.uid())
    )
  );

-- ============================================
-- 4. BOOKINGS POLICIES - Fix overlapping policies
-- ============================================

-- Drop the FOR ALL policy and create specific ones
DROP POLICY IF EXISTS "Creators can manage their own bookings" ON bookings;

CREATE POLICY "Creators can update their own bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = bookings.newsletter_id
      AND newsletters.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Creators can delete their own bookings"
  ON bookings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = bookings.newsletter_id
      AND newsletters.owner_id = (select auth.uid())
    )
  );

-- ============================================
-- 5. AVAILABILITY EXCEPTIONS - Fix auth.uid() calls
-- ============================================

DROP POLICY IF EXISTS "Creators can manage their exceptions" ON availability_exceptions;

CREATE POLICY "Creators can insert their exceptions"
  ON availability_exceptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = availability_exceptions.newsletter_id
      AND newsletters.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Creators can update their exceptions"
  ON availability_exceptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = availability_exceptions.newsletter_id
      AND newsletters.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Creators can delete their exceptions"
  ON availability_exceptions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM newsletters
      WHERE newsletters.id = availability_exceptions.newsletter_id
      AND newsletters.owner_id = (select auth.uid())
    )
  );
