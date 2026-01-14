"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// SECURE: Call the RPC function (Returns dates only, no IDs)
export async function getBookedDates(tierId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_blocked_dates", {
    queried_tier_id: tierId,
  });

  if (error) {
    console.error("Error fetching dates:", error);
    return [];
  }

  // data is an array of objects: [{ target_date: '2026-01-01' }, ...]
  return data.map((row: any) => row.target_date);
}

// SECURE INSERT: Call the RPC function
export async function createBooking(
  tierId: string,
  date: Date,
  newsletterSlug: string
) {
  const supabase = await createClient();
  const sqlDate = date.toLocaleDateString("en-CA");

  // We call .rpc() instead of .from().insert()
  const { data: bookingId, error } = await supabase.rpc("create_booking", {
    p_tier_id: tierId,
    p_target_date: sqlDate,
    p_newsletter_slug: newsletterSlug,
  });

  if (error) {
    console.error(error);
    // Check for unique violation (code 23505) inside the RPC error
    if (error.code === "23505" || error.message?.includes("unique")) {
      return { success: false, message: "Date taken!" };
    }
    return { success: false, message: "Database error." };
  }

  revalidatePath("/");
  // The data returned from RPC is the UUID directly
  return { success: true, message: "Slot reserved!", bookingId: bookingId };
}

// SECURE UPDATE: Call the RPC function
export async function saveAdCreative(
  bookingId: string,
  content: { headline: string; body: string; link: string }
) {
  const supabase = await createClient();

  // We call the secure function instead of .update()
  const { error } = await supabase.rpc("update_booking_content", {
    booking_id: bookingId,
    new_headline: content.headline,
    new_body: content.body,
    new_link: content.link,
  });

  if (error) {
    console.error(error);
    return { success: false, message: "Failed to save content" };
  }

  return { success: true };
}
