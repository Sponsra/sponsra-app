-- Allow the public to update bookings ONLY if they are still in 'draft' mode
create policy "Public can update draft bookings"
  on bookings
  for update
  using ( status = 'draft' );