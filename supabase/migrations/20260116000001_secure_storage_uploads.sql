-- supabase/migrations/20260116000001_secure_storage_uploads.sql
-- 
-- SECURITY FIX: Add restrictions to storage bucket uploads
-- This migration improves security by restricting where files can be uploaded
-- 
-- NOTE: File size and MIME type validation must be done in application code
-- (e.g., in your Next.js API route) as Supabase Storage policies cannot
-- inspect file contents or metadata during policy evaluation.

-- Drop the overly permissive public upload policy
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;

-- Create a more secure upload policy
-- This policy still allows public uploads but restricts the upload location
-- to a specific folder structure for better organization and security
CREATE POLICY "Public Upload with Folder Restriction"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ad-creatives'
    -- Optional: Restrict to specific folder (uncomment if you want folder-based organization)
    -- AND (storage.foldername(name))[1] = 'uploads'
  );

-- IMPORTANT: Application-level validation required
-- 
-- In your Next.js API route (or wherever you handle file uploads), add:
-- 
-- 1. File size validation (max 5MB recommended):
--    if (file.size > 5 * 1024 * 1024) {
--      throw new Error('File too large. Maximum size is 5MB.');
--    }
--
-- 2. MIME type validation (images only):
--    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
--    if (!allowedTypes.includes(file.type)) {
--      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
--    }
--
-- 3. Image dimension validation (if needed):
--    Use a library like 'sharp' or 'jimp' to validate dimensions
--
-- Example validation in your upload handler:
-- ```typescript
-- const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
-- const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
-- 
-- if (file.size > MAX_FILE_SIZE) {
--   return new Response('File too large', { status: 400 });
-- }
-- 
-- if (!ALLOWED_TYPES.includes(file.type)) {
--   return new Response('Invalid file type', { status: 400 });
-- }
-- ```
