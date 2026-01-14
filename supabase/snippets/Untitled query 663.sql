-- Allow Creators to manage bookings for their own newsletters
create policy "Creators can manage their own bookings"
  on bookings
  for all -- View, Edit, Delete
  using (
    exists (
      select 1 from newsletters
      where newsletters.id = bookings.newsletter_id
      and newsletters.owner_id = auth.uid()
    )
  );