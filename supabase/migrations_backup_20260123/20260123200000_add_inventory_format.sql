-- Migration: Add inventory format system and brand_color
-- This migration introduces the 3-format template system (hero, native, link)
-- while preserving customizable specs

-- 1. Create format enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tier_format') THEN
    CREATE TYPE tier_format AS ENUM ('hero', 'native', 'link');
  END IF;
END$$;

-- 2. Add format column to inventory_tiers (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_tiers' AND column_name = 'format'
  ) THEN
    ALTER TABLE inventory_tiers ADD COLUMN format tier_format NOT NULL DEFAULT 'hero';
  END IF;
END$$;

-- 3. Add brand_color to newsletters (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'newsletters' AND column_name = 'brand_color'
  ) THEN
    ALTER TABLE newsletters ADD COLUMN brand_color TEXT DEFAULT '#0ea5e9';
  END IF;
END$$;

-- 4. Migrate existing theme_config primary_color to brand_color (if theme_config exists)
UPDATE newsletters
SET brand_color = (theme_config->>'primary_color')
WHERE theme_config IS NOT NULL 
  AND theme_config->>'primary_color' IS NOT NULL
  AND brand_color = '#0ea5e9';

-- 5. Delete existing bookings and tiers (per user request: reset and seed fresh)
-- Delete bookings first due to foreign key constraint
DELETE FROM bookings;
DELETE FROM inventory_tiers;

-- Note: Seeding of the 3 default tiers will be done via server action
-- after migration runs, as it requires the newsletter_id which is user-specific
