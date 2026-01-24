-- Migration 01: Core Schema
-- Creates all tables, types, and core constraints
-- Date: 2026-01-24

-- ============================================
-- 1. TYPES / ENUMS
-- ============================================

-- Tier type: ad or sponsor
CREATE TYPE tier_type AS ENUM ('ad', 'sponsor');

-- Tier format: visual template type
CREATE TYPE tier_format AS ENUM ('hero', 'native', 'link');

-- Booking status workflow
CREATE TYPE booking_status AS ENUM ('draft', 'pending_payment', 'paid', 'approved', 'rejected');

-- ============================================
-- 2. PROFILES TABLE
-- ============================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  -- Stripe Connect fields
  stripe_account_id TEXT,
  stripe_charges_enabled BOOLEAN DEFAULT false,
  stripe_details_submitted BOOLEAN DEFAULT false,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- ============================================
-- 3. NEWSLETTERS TABLE
-- ============================================

CREATE TABLE newsletters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  theme_config JSONB,
  brand_color TEXT DEFAULT '#0ea5e9',
  
  CONSTRAINT slug_length CHECK (char_length(slug) >= 3)
);

-- Index on owner_id for FK performance
CREATE INDEX idx_newsletters_owner_id ON newsletters(owner_id);

-- ============================================
-- 4. INVENTORY TIERS TABLE
-- ============================================

CREATE TABLE inventory_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type tier_type NOT NULL,
  format tier_format NOT NULL DEFAULT 'hero',
  price INTEGER NOT NULL, -- Stored in cents
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  -- Specs for ad content validation
  specs_headline_limit INTEGER DEFAULT 60,
  specs_body_limit INTEGER DEFAULT 280,
  specs_image_ratio TEXT DEFAULT 'any',
  -- Availability: array of days (0=Sunday, 6=Saturday)
  available_days INTEGER[] DEFAULT '{1, 2, 3, 4, 5}'
);

-- Index on newsletter_id for FK performance
CREATE INDEX idx_inventory_tiers_newsletter_id ON inventory_tiers(newsletter_id);

-- ============================================
-- 5. BOOKINGS TABLE
-- ============================================

CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  newsletter_id UUID REFERENCES newsletters(id) NOT NULL,
  tier_id UUID REFERENCES inventory_tiers(id) NOT NULL,
  sponsor_email TEXT,
  sponsor_name TEXT,
  target_date DATE NOT NULL,
  status booking_status DEFAULT 'draft',
  -- Ad content fields
  ad_headline TEXT,
  ad_body TEXT,
  ad_link TEXT,
  ad_image_path TEXT,
  
  -- Constraints
  CONSTRAINT headline_length CHECK (char_length(ad_headline) <= 100),
  CONSTRAINT body_length CHECK (char_length(ad_body) <= 500),
  -- Prevent double booking: unique tier + date combination
  CONSTRAINT unique_slot_per_date UNIQUE (tier_id, target_date)
);

-- Index on newsletter_id for FK performance
CREATE INDEX idx_bookings_newsletter_id ON bookings(newsletter_id);

-- ============================================
-- 6. AVAILABILITY EXCEPTIONS TABLE
-- ============================================

CREATE TABLE availability_exceptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT unique_newsletter_date UNIQUE (newsletter_id, date)
);

-- Composite index for performance
CREATE INDEX idx_availability_exceptions_newsletter_date 
  ON availability_exceptions(newsletter_id, date);
