// app/actions/bookings.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath, unstable_noStore } from "next/cache";
import { createCheckoutSession } from "./stripe";
import {
  DateAvailabilityStatus,
  InventoryTier,
  AvailabilityException,
} from "@/app/types/inventory";
import { iterateDates } from "@/app/utils/date-patterns";

// 1. Get Available Dates with Full Status (Core function)
export async function getAvailableDates(
  tierId: string,
  startDate: string,
  endDate: string
): Promise<DateAvailabilityStatus[]> {
  unstable_noStore(); // Prevent caching
  const supabase = await createClient();

  // 1. Fetch Tier Info (for available_days + newsletter_id)
  const { data: tier, error: tierError } = await supabase
    .from("inventory_tiers")
    .select("id, newsletter_id, available_days")
    .eq("id", tierId)
    .eq("is_archived", false)
    .single();

  if (tierError || !tier) {
    console.error("Error fetching tier:", tierError);
    return [];
  }

  // 2. Fetch Availability Exceptions (Blackout Dates)
  const { data: exceptions, error: exceptionsError } = await supabase
    .from("availability_exceptions")
    .select("date, description")
    .eq("newsletter_id", tier.newsletter_id)
    .gte("date", startDate)
    .lte("date", endDate);

  if (exceptionsError) {
    console.error("Error fetching exceptions:", exceptionsError);
    return [];
  }

  const exceptionMap = new Set(exceptions?.map((e) => e.date) || []);

  // 3. Fetch Existing Bookings
  // Exclude rejected bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("target_date, status")
    .eq("tier_id", tierId)
    .neq("status", "rejected")
    .gte("target_date", startDate)
    .lte("target_date", endDate);

  if (bookingsError) {
    console.error("Error fetching bookings:", bookingsError);
    return [];
  }

  const bookedMap = new Set(bookings?.map((b) => b.target_date) || []);

  const availableDays = new Set(tier.available_days || [1, 2, 3, 4, 5]); // Default Mon-Fri

  // 4. Build Result
  const result: DateAvailabilityStatus[] = [];

  iterateDates(startDate, endDate, (date) => {
    // Convert to YYYY-MM-DD
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getUTCDay(); // 0=Sun, 6=Sat

    if (bookedMap.has(dateStr)) {
      result.push({ date: dateStr, status: "booked", reason: "Sold Out" });
    } else if (exceptionMap.has(dateStr)) {
      result.push({
        date: dateStr,
        status: "unavailable",
        reason: "Date Closed",
      });
    } else if (!availableDays.has(dayOfWeek)) {
      result.push({
        date: dateStr,
        status: "unavailable",
        reason: "Tier unavailable",
      });
    } else {
      result.push({ date: dateStr, status: "available" });
    }
  });

  return result;
}

// 2. Create a Draft Booking (Step 1)
export async function createBooking(tierId: string, date: Date, slug: string) {
  const supabase = await createClient();

  // Convert JS Date to SQL Date string (YYYY-MM-DD)
  // We use "en-CA" locale to get YYYY-MM-DD reliably
  const dateStr = date.toLocaleDateString("en-CA");
  const dayOfWeek = date.getDay();

  // --- VALIDATION START ---
  // 1. Fetch Tier Info
  const { data: tier } = await supabase
    .from("inventory_tiers")
    .select("id, newsletter_id, available_days")
    .eq("id", tierId)
    .eq("is_archived", false)
    .single();

  if (!tier) return { success: false, message: "Tier not found." };

  // 2. Check if Day of Week is allowed
  const availableDays = tier.available_days || [1, 2, 3, 4, 5];
  if (!availableDays.includes(dayOfWeek)) {
    return { success: false, message: "This ad slot is not available on this day of the week." };
  }

  // 3. Check if date is in Exceptions
  const { data: exception } = await supabase
    .from("availability_exceptions")
    .select("id")
    .eq("newsletter_id", tier.newsletter_id)
    .eq("date", dateStr)
    .single();

  if (exception) {
    return { success: false, message: "This date is closed for bookings." };
  }
  // --- VALIDATION END ---

  const { data, error } = await supabase.rpc("create_booking", {
    p_tier_id: tierId,
    p_target_date: dateStr,
    p_newsletter_slug: slug,
  });

  if (error) {
    console.error("Booking Error:", error);
    // Handle the "Duplicate Key" error gracefully
    // Database enforces uniqueness - catch unique_violation
    if (error.code === "23505") {
      return {
        success: false,
        message: "Sorry, this date was just taken!",
      };
    }
    return { success: false, message: error.message };
  }

  return { success: true, bookingId: data };
}

export async function saveAdCreative(
  bookingId: string,
  content: {
    headline: string;
    body: string;
    link: string;
    sponsorName: string;
    imagePath?: string | null;
  }
) {
  const supabase = await createClient();

  // 1. Fetch the booking and tier info using RPC function (bypasses RLS)
  const { data: bookingData, error: bookingError } = await supabase.rpc(
    "get_booking_for_validation",
    { p_booking_id: bookingId }
  );

  if (bookingError || !bookingData || bookingData.length === 0) {
    console.error("Booking fetch error:", bookingError);
    return {
      success: false,
      error: "Booking not found. Please try again.",
    };
  }

  const booking = bookingData[0];
  const tier = {
    specs_headline_limit: booking.specs_headline_limit,
    specs_body_limit: booking.specs_body_limit,
    specs_image_ratio: booking.specs_image_ratio,
  };

  const errors: string[] = [];

  // Validate headline length
  if (content.headline.length > tier.specs_headline_limit) {
    errors.push(
      `Headline exceeds limit: ${content.headline.length}/${tier.specs_headline_limit} characters`
    );
  }

  // Validate body length
  if (content.body.length > tier.specs_body_limit) {
    errors.push(
      `Body text exceeds limit: ${content.body.length}/${tier.specs_body_limit} characters`
    );
  }

  // Validate image requirement
  if (tier.specs_image_ratio !== "no_image" && !content.imagePath) {
    errors.push("An image is required for this ad type.");
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join(" "),
    };
  }

  // 3. Call the updated RPC function
  // We pass the new imagePath argument.
  const { error } = await supabase.rpc("update_booking_content", {
    booking_id: bookingId,
    new_headline: content.headline,
    new_body: content.body,
    new_link: content.link,
    new_sponsor_name: content.sponsorName,
    new_image_path: content.imagePath || null,
  });

  if (error) {
    console.error("Error saving creative:", error);
    return {
      success: false,
      error: "Failed to save ad content. Please try again.",
    };
  }

  // Return success (no payment redirect)
  return { success: true };
}

// Create Stripe checkout session for payment
export async function createBookingCheckout(bookingId: string) {
  const checkoutResult = await createCheckoutSession(bookingId);

  if (!checkoutResult.url) {
    return { success: false, error: "Failed to initialize payment." };
  }

  return { success: true, url: checkoutResult.url };
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
  // Only show bookings that have been paid for (exclude draft and pending_payment)
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
        ad_image_path,
        newsletter_id,
        inventory_tiers (
            name,
            price,
            specs_headline_limit,
            specs_body_limit,
            specs_image_ratio
        )
    `
    )
    .in("newsletter_id", newsletterIds)
    .in("status", ["paid", "approved", "rejected"]) // Only show completed bookings
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
