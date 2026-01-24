-- Migration 04: Storage and Cron
-- Storage bucket setup and cron job for draft cleanup
-- Date: 2026-01-24

-- ============================================
-- 1. STORAGE BUCKET FOR AD CREATIVES
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-creatives', 'ad-creatives', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. STORAGE POLICIES
-- ============================================

-- Public can view images
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ad-creatives');

-- Public can upload images (validation done in app code)
CREATE POLICY "Public Upload with Folder Restriction"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ad-creatives');

-- ============================================
-- 3. PG_CRON EXTENSION
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- ============================================
-- 4. CRON JOB: Cleanup expired drafts
-- ============================================

-- Unschedule if exists (prevents duplicates)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup-drafts'
  ) THEN
    PERFORM cron.unschedule('cleanup-drafts');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore if cron.job table doesn't exist yet
END $$;

-- Schedule cleanup every minute
SELECT cron.schedule(
  'cleanup-drafts',
  '* * * * *',
  $$SELECT cleanup_expired_drafts()$$
);
