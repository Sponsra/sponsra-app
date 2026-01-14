"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Get Blocked Dates (for the Calendar)
export async function getBookedDates(tierId: string) {
  const supabase = await createClient();

  // Use the secure function to bypass RLS for public users
  const { data, error } = await supabase.rpc("get_blocked_dates", {
    queried_tier_id: tierId,
  });

  if (error) {
    console.error("Error fetching dates:", error);
    return [];
  }

  return data || [];
}

// 2. Create a Draft Booking (Step 1)
export async function createBooking(tierId: string, date: Date, slug: string) {
  const supabase = await createClient();

  // Convert JS Date to SQL Date string (YYYY-MM-DD)
  // We use "en-CA" locale to get YYYY-MM-DD reliably
  const dateStr = date.toLocaleDateString("en-CA");

  const { data, error } = await supabase.rpc("create_booking", {
    p_tier_id: tierId,
    p_target_date: dateStr,
    p_newsletter_slug: slug,
  });

  if (error) {
    console.error("Booking Error:", error);
    // Handle the "Duplicate Key" error gracefully
    if (error.code === "23505") {
      return {
        success: false,
        message: "This date was just taken. Please choose another.",
      };
    }
    return { success: false, message: error.message };
  }

  return { success: true, bookingId: data };
}

// 3. Save Ad Content (Step 2)
export async function saveAdCreative(
  bookingId: string,
  content: { headline: string; body: string; link: string; sponsorName: string }
) {
  const supabase = await createClient();

  // Call the secure RPC function to update the content
  const { error } = await supabase.rpc("update_booking_content", {
    booking_id: bookingId,
    new_headline: content.headline,
    new_body: content.body,
    new_link: content.link,
    new_sponsor_name: content.sponsorName,
  });

  if (error) {
    console.error("Error saving creative:", error);
    return { success: false, message: error.message };
  }

  return { success: true };
}

// 4. Get Owner's Dashboard Data
export async function getOwnerBookings() {
  const supabase = await createClient();
  const user = (await supabase.auth.getUser()).data.user;

  if (!user) return [];

  // Get User's Newsletter IDs first
  const { data: newsletters } = await supabase
    .from("newsletters")
    .select("id")
    .eq("owner_id", user.id);

  if (!newsletters?.length) return [];
  const newsletterIds = newsletters.map((n) => n.id);

  // Fetch Bookings with EXPLICIT columns to ensure nothing is missed
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        created_at,
        target_date,
        status,
        ad_headline,
        ad_body,
        ad_link,
        sponsor_name,
        newsletter_id,
        inventory_tiers (
            name,
            price
        )
    `
    )
    .in("newsletter_id", newsletterIds)
    .order("target_date", { ascending: true });

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  return data || [];
}

// 5. Approve Booking
export async function approveBooking(bookingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "approved" })
    .eq("id", bookingId);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard"); // Refresh the dashboard UI
  return { success: true };
}

// 6. Reject Booking
export async function rejectBooking(bookingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "rejected" })
    .eq("id", bookingId);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard"); // Refresh the dashboard UI
  return { success: true };
}
