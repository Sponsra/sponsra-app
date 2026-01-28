-- Migration: Products System Refactor
-- Replaces inventory_tiers with products + asset_requirements system
-- Date: 2026-01-25
-- Description: Introduces flexible product-based inventory with dynamic asset requirements

-- ============================================
-- 1. NEW TYPES / ENUMS
-- ============================================

-- Product frequency: how often the newsletter publishes
CREATE TYPE product_frequency AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- Product type: sponsorship tier classification
CREATE TYPE product_type AS ENUM ('primary', 'secondary', 'classified');

-- Asset kind: types of content sponsors can provide
CREATE TYPE asset_kind AS ENUM ('headline', 'body', 'image', 'link');

-- Slot status: lifecycle states for inventory slots
CREATE TYPE slot_status AS ENUM ('available', 'held', 'booked', 'locked');

-- Update booking status to include new states
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'cancelled';

-- ============================================
-- 2. PRODUCTS TABLE
-- ============================================

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Relationships
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Product details
  name TEXT NOT NULL,
  description TEXT,
  product_type product_type NOT NULL DEFAULT 'secondary',
  price INTEGER NOT NULL, -- Stored in cents
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  
  -- Schedule configuration
  frequency product_frequency NOT NULL DEFAULT 'weekly',
  active_days INTEGER[] NOT NULL DEFAULT '{1, 2, 3, 4, 5}', -- 0=Sunday, 6=Saturday
  start_date DATE NOT NULL,
  placements_per_issue INTEGER NOT NULL DEFAULT 1,
  
  -- Constraints
  CONSTRAINT name_length CHECK (char_length(name) >= 3),
  CONSTRAINT price_positive CHECK (price >= 0),
  CONSTRAINT placements_positive CHECK (placements_per_issue >= 1)
);

-- Indexes for performance
CREATE INDEX idx_products_newsletter_id ON products(newsletter_id);
CREATE INDEX idx_products_creator_id ON products(creator_id);
CREATE INDEX idx_products_active ON products(is_active, is_archived) WHERE is_active = true AND is_archived = false;

-- ============================================
-- 3. ASSET REQUIREMENTS TABLE
-- ============================================

CREATE TABLE asset_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Relationships
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  
  -- Asset configuration
  kind asset_kind NOT NULL,
  label TEXT NOT NULL,
  helper_text TEXT,
  is_required BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Constraints (stored as JSONB for flexibility)
  constraints JSONB DEFAULT '{}'::jsonb,
  -- Example constraints:
  -- { "maxChars": 60, "minChars": 10 } for headline/body
  -- { "aspectRatio": "16:9", "maxSizeMB": 2, "allowedFormats": ["jpg", "png"] } for image
  -- { "pattern": "https?://.*" } for link
  
  CONSTRAINT label_length CHECK (char_length(label) >= 1)
);

-- Indexes
CREATE INDEX idx_asset_requirements_product_id ON asset_requirements(product_id);
CREATE INDEX idx_asset_requirements_order ON asset_requirements(product_id, display_order);

-- ============================================
-- 4. INVENTORY SLOTS TABLE
-- ============================================

CREATE TABLE inventory_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Relationships
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  
  -- Slot details
  slot_date DATE NOT NULL,
  slot_index INTEGER NOT NULL, -- For multiple placements per issue (1, 2, 3, etc.)
  status slot_status DEFAULT 'available',
  
  -- Hold management (for checkout flow)
  held_at TIMESTAMP WITH TIME ZONE,
  held_by_session_id TEXT,
  
  -- Booking reference
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT slot_index_positive CHECK (slot_index >= 1),
  CONSTRAINT unique_product_date_index UNIQUE (product_id, slot_date, slot_index)
);

-- Indexes for performance and real-time queries
CREATE INDEX idx_inventory_slots_product_id ON inventory_slots(product_id);
CREATE INDEX idx_inventory_slots_date ON inventory_slots(slot_date);
CREATE INDEX idx_inventory_slots_status ON inventory_slots(status);
CREATE INDEX idx_inventory_slots_booking_id ON inventory_slots(booking_id);
CREATE INDEX idx_inventory_slots_held_session ON inventory_slots(held_by_session_id) WHERE status = 'held';

-- ============================================
-- 5. NEW BOOKINGS TABLE
-- ============================================

-- Rename old bookings table to preserve data during migration
ALTER TABLE IF EXISTS bookings RENAME TO bookings_legacy;

-- Drop indexes from legacy table to avoid conflicts
DROP INDEX IF EXISTS idx_bookings_newsletter_id;

-- Create new bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Relationships
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  slot_id UUID REFERENCES inventory_slots(id) NOT NULL,
  
  -- Sponsor information
  sponsor_email TEXT NOT NULL,
  sponsor_name TEXT,
  
  -- Booking details
  target_date DATE NOT NULL,
  status booking_status DEFAULT 'draft',
  
  -- Payment tracking
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER, -- In cents
  
  -- Constraints
  CONSTRAINT valid_email CHECK (sponsor_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for new bookings table
CREATE INDEX idx_bookings_newsletter_id ON bookings(newsletter_id);
CREATE INDEX idx_bookings_product_id ON bookings(product_id);
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(target_date);
CREATE INDEX idx_bookings_email ON bookings(sponsor_email);

-- ============================================
-- 6. BOOKING ASSETS TABLE
-- ============================================

CREATE TABLE booking_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Relationships
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  asset_requirement_id UUID REFERENCES asset_requirements(id) NOT NULL,
  
  -- Asset content
  value TEXT NOT NULL, -- URL for images, text for headlines/body/links
  
  -- Constraints
  CONSTRAINT value_not_empty CHECK (char_length(value) >= 1)
);

-- Indexes
CREATE INDEX idx_booking_assets_booking_id ON booking_assets(booking_id);
CREATE INDEX idx_booking_assets_requirement_id ON booking_assets(asset_requirement_id);

-- ============================================
-- 7. ENABLE REAL-TIME FOR INVENTORY SLOTS
-- ============================================

-- Enable real-time updates for instant calendar synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_slots;

-- ============================================
-- 8. STORAGE BUCKET FOR SPONSOR ASSETS
-- ============================================

-- Create public bucket for sponsor-submitted images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sponsorship-assets',
  'sponsorship-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. STORAGE RLS POLICIES
-- ============================================

-- Allow anyone to upload assets (during booking flow)
CREATE POLICY "Public can upload sponsorship assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sponsorship-assets');

-- Allow anyone to view assets (public bucket)
CREATE POLICY "Public can view sponsorship assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'sponsorship-assets');

-- Allow creators to delete their assets
CREATE POLICY "Creators can delete their sponsorship assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'sponsorship-assets' AND
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN products p ON p.id = b.product_id
    WHERE p.creator_id = auth.uid()
    AND (storage.foldername(name))[1] = b.id::text
  )
);

-- ============================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_assets ENABLE ROW LEVEL SECURITY;

-- PRODUCTS POLICIES
-- Creators can view their own products
CREATE POLICY "Creators can view their products"
ON products FOR SELECT
USING (creator_id = auth.uid());

-- Public can view active products for booking
CREATE POLICY "Public can view active products"
ON products FOR SELECT
USING (is_active = true AND is_archived = false);

-- Creators can insert their own products
CREATE POLICY "Creators can create products"
ON products FOR INSERT
WITH CHECK (creator_id = auth.uid());

-- Creators can update their own products
CREATE POLICY "Creators can update their products"
ON products FOR UPDATE
USING (creator_id = auth.uid());

-- Creators can delete (archive) their own products
CREATE POLICY "Creators can delete their products"
ON products FOR DELETE
USING (creator_id = auth.uid());

-- ASSET REQUIREMENTS POLICIES
-- Public can view asset requirements for active products
CREATE POLICY "Public can view asset requirements"
ON asset_requirements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = asset_requirements.product_id
    AND p.is_active = true
    AND p.is_archived = false
  )
);

-- Creators can manage asset requirements for their products
CREATE POLICY "Creators can manage asset requirements"
ON asset_requirements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = asset_requirements.product_id
    AND p.creator_id = auth.uid()
  )
);

-- INVENTORY SLOTS POLICIES
-- Public can view available slots
CREATE POLICY "Public can view inventory slots"
ON inventory_slots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = inventory_slots.product_id
    AND p.is_active = true
    AND p.is_archived = false
  )
);

-- Creators can view their product slots
CREATE POLICY "Creators can view their slots"
ON inventory_slots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = inventory_slots.product_id
    AND p.creator_id = auth.uid()
  )
);

-- System/Edge Function can manage slots (authenticated service role)
CREATE POLICY "Service can manage slots"
ON inventory_slots FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- BOOKINGS POLICIES
-- Creators can view bookings for their products
CREATE POLICY "Creators can view their bookings"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = bookings.product_id
    AND p.creator_id = auth.uid()
  )
);

-- Sponsors can view their own bookings (by email)
CREATE POLICY "Sponsors can view their bookings"
ON bookings FOR SELECT
USING (sponsor_email = auth.email());

-- Anyone can create bookings (during public booking flow)
CREATE POLICY "Public can create bookings"
ON bookings FOR INSERT
WITH CHECK (true);

-- Creators can update bookings for their products
CREATE POLICY "Creators can update their bookings"
ON bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = bookings.product_id
    AND p.creator_id = auth.uid()
  )
);

-- BOOKING ASSETS POLICIES
-- Creators can view assets for their product bookings
CREATE POLICY "Creators can view booking assets"
ON booking_assets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN products p ON p.id = b.product_id
    WHERE b.id = booking_assets.booking_id
    AND p.creator_id = auth.uid()
  )
);

-- Anyone can insert assets during booking creation
CREATE POLICY "Public can create booking assets"
ON booking_assets FOR INSERT
WITH CHECK (true);

-- ============================================
-- 11. UPDATED_AT TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to products table
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to bookings table
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE products IS 'Sponsorship products that creators offer (replaces inventory_tiers)';
COMMENT ON TABLE asset_requirements IS 'Defines what content sponsors must provide for each product';
COMMENT ON TABLE inventory_slots IS 'Pre-generated bookable slots based on product schedule';
COMMENT ON TABLE bookings IS 'Sponsor bookings for specific inventory slots';
COMMENT ON TABLE booking_assets IS 'Actual content submitted by sponsors for their bookings';

COMMENT ON COLUMN products.placements_per_issue IS 'Number of sponsor slots available per publication date';
COMMENT ON COLUMN inventory_slots.slot_index IS 'Index for multiple placements per issue (1-based)';
COMMENT ON COLUMN inventory_slots.held_by_session_id IS 'Session ID holding this slot during checkout (15-min TTL)';
COMMENT ON COLUMN asset_requirements.constraints IS 'JSON validation rules: {maxChars, aspectRatio, allowedFormats, etc}';
