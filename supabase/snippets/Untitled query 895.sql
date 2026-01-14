-- 1. Remove the strict policy
DROP POLICY IF EXISTS "Public can update draft bookings" ON bookings;

-- 2. Add the flexible policy
CREATE POLICY "Public can update draft bookings"
  ON bookings
  FOR UPDATE
  USING ( status = 'draft' )      -- Condition to START the edit
  WITH CHECK ( true );            -- Condition to FINISH the edit (Allow any change)