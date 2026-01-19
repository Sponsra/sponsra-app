"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createCheckoutSession } from "./stripe";
import { redirect } from "next/navigation";
import { getNewsletterSchedule, getTierAvailability } from "./inventory";
import {
  DateAvailabilityStatus,
  PublicationSchedule,
  AvailabilitySchedule,
} from "@/app/types/inventory";
import {
  getCanonicalDate,
  iterateDates,
  matchesPattern,
} from "@/app/utils/date-patterns";

// 1. Get Blocked Dates (for the Calendar) - Backward compatibility
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

// 1a. Get Bookings in Date Range (CRITICAL: Bounded query to avoid fetching years of history)
// Excludes rejected bookings since they don't block availability
// Uses RPC function to bypass RLS since public users can't read bookings directly
export async function getBookingsInRange(
  tierId: string,
  startDate: string,
  endDate: string
): Promise<Array<{ target_date: string }>> {
  const supabase = await createClient();

  console.log("[getBookingsInRange] Fetching bookings for:", {
    tierId,
    startDate,
    endDate,
  });

  // Use RPC function to bypass RLS (public users can't read bookings directly)
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_blocked_dates",
    {
      queried_tier_id: tierId,
    }
  );

  if (rpcError) {
    console.error("[getBookingsInRange] RPC error:", rpcError);
    console.error(
      "[getBookingsInRange] RPC error details:",
      JSON.stringify(rpcError, null, 2)
    );

    // Fallback to direct query (may fail due to RLS, but worth trying)
    console.log("[getBookingsInRange] Attempting fallback direct query...");
    const { data, error } = await supabase
      .from("bookings")
      .select("target_date, status, tier_id")
      .eq("tier_id", tierId)
      .neq("status", "rejected")
      .gte("target_date", startDate)
      .lte("target_date", endDate);

    if (error) {
      console.error("[getBookingsInRange] Direct query also failed:", error);
      console.error(
        "[getBookingsInRange] This is likely due to RLS policies blocking public access"
      );
      return [];
    }

    console.log(
      "[getBookingsInRange] Direct query returned:",
      data?.length || 0,
      "bookings"
    );
    if (data && data.length > 0) {
      console.log(
        "[getBookingsInRange] Booking details:",
        data.map((b) => ({
          date: b.target_date,
          status: b.status,
        }))
      );
    }
    return (data || []).map((b) => ({
      target_date: b.target_date,
    }));
  }

  // Filter RPC results by date range (RPC doesn't support date filtering)
  const filtered = (rpcData || []).filter((b: { target_date: string }) => {
    return b.target_date >= startDate && b.target_date <= endDate;
  });

  console.log(
    "[getBookingsInRange] RPC returned:",
    rpcData?.length || 0,
    "total bookings for tier"
  );
  console.log("[getBookingsInRange] Date range:", startDate, "to", endDate);
  console.log(
    "[getBookingsInRange] After date range filter:",
    filtered.length,
    "bookings"
  );
  if (filtered.length > 0) {
    console.log(
      "[getBookingsInRange] Filtered booking dates:",
      filtered.map((b: { target_date: string }) => b.target_date)
    );
  } else if (rpcData && rpcData.length > 0) {
    console.log(
      "[getBookingsInRange] All bookings (outside range):",
      rpcData.map((b: { target_date: string }) => b.target_date)
    );
  }

  return filtered.map((b: { target_date: string }) => ({
    target_date: b.target_date,
  }));
}

// 1b. Get Available Dates with Full Status (Core function)
export async function getAvailableDates(
  tierId: string,
  startDate: string,
  endDate: string
): Promise<DateAvailabilityStatus[]> {
  const supabase = await createClient();

  // Get newsletter_id from tier_id
  const { data: tier, error: tierError } = await supabase
    .from("inventory_tiers")
    .select("newsletter_id")
    .eq("id", tierId)
    .single();

  if (tierError || !tier) {
    console.error("Error fetching tier:", tierError);
    return [];
  }

  const newsletterId = tier.newsletter_id;

  // 1. Fetch Data (3 parallel queries)
  // CRITICAL: Bound bookings query by date range to avoid fetching years of history
  const [globalSchedule, tierSchedule, bookings] = await Promise.all([
    getNewsletterSchedule(newsletterId),
    getTierAvailability(tierId),
    getBookingsInRange(tierId, startDate, endDate),
  ]);

  // ===== COMPREHENSIVE SCHEDULE COMPARISON LOGGING =====
  console.log("=".repeat(80));
  console.log("[SCHEDULE COMPARISON] Starting availability calculation");
  console.log("=".repeat(80));

  console.log("\n[1] NEWSLETTER PUBLICATION SCHEDULE:");
  console.log("  Newsletter ID:", newsletterId);
  if (globalSchedule) {
    console.log("  ✓ Schedule found");
    console.log("  Schedule Type:", globalSchedule.schedule_type);
    console.log("  Pattern Type:", globalSchedule.pattern_type);
    console.log("  Days of Week:", globalSchedule.days_of_week);
    console.log("  Day of Month:", globalSchedule.day_of_month);
    console.log("  Monthly Week Number:", globalSchedule.monthly_week_number);
    console.log("  Start Date:", globalSchedule.start_date);
    console.log("  End Date:", globalSchedule.end_date || "None (indefinite)");
    console.log("  Specific Dates:", globalSchedule.specific_dates || "None");
    console.log(
      "  Full Schedule Object:",
      JSON.stringify(globalSchedule, null, 2)
    );
  } else {
    console.log("  ✗ NO SCHEDULE FOUND - This is the problem!");
    console.log("  Newsletter has no publication schedule configured.");
  }

  console.log("\n[2] TIER AVAILABILITY SCHEDULE:");
  console.log("  Tier ID:", tierId);
  if (tierSchedule) {
    console.log("  ✓ Schedule found");
    console.log("  Schedule Type:", tierSchedule.schedule_type);
    console.log("  Pattern Type:", tierSchedule.pattern_type);
    console.log("  Days of Week:", tierSchedule.days_of_week);
    console.log("  Day of Month:", tierSchedule.day_of_month);
    console.log("  Monthly Week Number:", tierSchedule.monthly_week_number);
    console.log("  Start Date:", tierSchedule.start_date || "None");
    console.log("  End Date:", tierSchedule.end_date || "None");
    console.log("  Specific Dates:", tierSchedule.specific_dates || "None");
    console.log("  Is Available:", tierSchedule.is_available);
    console.log("  Capacity:", tierSchedule.capacity);
    console.log(
      "  Full Schedule Object:",
      JSON.stringify(tierSchedule, null, 2)
    );
  } else {
    console.log("  ✓ No tier schedule - will inherit from newsletter");
    console.log("  This means: use all dates from newsletter schedule");
  }

  console.log("\n[3] DATE RANGE FOR CALCULATION:");
  console.log("  Start Date:", startDate);
  console.log("  End Date:", endDate);
  console.log("  Bookings Count:", bookings.length);
  if (bookings.length > 0) {
    console.log(
      "  Booked Dates:",
      bookings.map((b) => b.target_date).slice(0, 10),
      bookings.length > 10 ? "..." : ""
    );
  }

  console.log("\n" + "=".repeat(80));

  // 2. Generate Base Candidates (from Global Schedule)
  console.log("\n[4] GENERATING CANDIDATE DATES FROM NEWSLETTER SCHEDULE:");
  const candidates = new Set<string>();
  if (globalSchedule) {
    // A. Recurring Pattern
    let patternMatches = 0;
    const sampleMatches: string[] = [];
    iterateDates(startDate, endDate, (date) => {
      if (matchesPattern(date, globalSchedule)) {
        const dateStr = date.toISOString().split("T")[0];
        candidates.add(dateStr);
        patternMatches++;
        if (sampleMatches.length < 10) {
          sampleMatches.push(dateStr);
        }
      }
    });
    console.log("  Pattern matches from recurring pattern:", patternMatches);
    if (sampleMatches.length > 0) {
      console.log("  Sample matching dates:", sampleMatches);
    }

    // B. Explicit One-Offs (UNION with recurring pattern)
    // Scenario: Weekly on Mondays + Special Holiday Edition on Thursday
    let oneOffMatches = 0;
    const oneOffDates: string[] = [];
    globalSchedule.specific_dates?.forEach((d) => {
      // specific_dates is always string[] from database (DATE type)
      const dateStr = String(d);
      // Only add if within our date range
      if (dateStr >= startDate && dateStr <= endDate) {
        candidates.add(dateStr);
        oneOffMatches++;
        oneOffDates.push(dateStr);
      }
    });
    console.log("  One-off dates added:", oneOffMatches);
    if (oneOffDates.length > 0) {
      console.log("  One-off date list:", oneOffDates);
    }
  } else {
    console.log("  ✗ NO NEWSLETTER SCHEDULE - Cannot generate candidate dates");
    console.log("  This means NO dates will be available!");
  }
  console.log("  Total candidate dates:", candidates.size);
  if (candidates.size > 0 && candidates.size <= 20) {
    console.log("  All candidate dates:", Array.from(candidates).sort());
  } else if (candidates.size > 20) {
    console.log(
      "  First 20 candidate dates:",
      Array.from(candidates).sort().slice(0, 20)
    );
  }

  // 3. Filter by Tier Schedule (STRICT INTERSECTION)
  console.log("\n[5] FILTERING BY TIER SCHEDULE:");
  const tierFiltered = new Set<string>();
  if (tierSchedule && tierSchedule.schedule_type !== "all_dates") {
    console.log("  Tier has custom schedule - filtering candidates");
    let tierPatternMatches = 0;
    const tierSampleMatches: string[] = [];
    candidates.forEach((dateStr) => {
      // CRITICAL: Use UTC-based date parsing
      const date = getCanonicalDate(dateStr);
      if (matchesPattern(date, tierSchedule)) {
        if (tierSchedule.is_available !== false) {
          tierFiltered.add(dateStr);
          tierPatternMatches++;
          if (tierSampleMatches.length < 10) {
            tierSampleMatches.push(dateStr);
          }
        } else {
          console.log(
            `  ⚠️ Date ${dateStr} matches pattern but is_available=false`
          );
        }
      }
    });
    console.log("  Tier pattern matches:", tierPatternMatches);
    if (tierSampleMatches.length > 0) {
      console.log("  Sample tier-filtered dates:", tierSampleMatches);
    }

    // Also add tier-specific one-off dates (UNION)
    let tierOneOffMatches = 0;
    const tierOneOffDates: string[] = [];
    tierSchedule.specific_dates?.forEach((d) => {
      // specific_dates is always string[] from database (DATE type)
      const dateStr = String(d);
      if (dateStr >= startDate && dateStr <= endDate) {
        tierFiltered.add(dateStr);
        tierOneOffMatches++;
        tierOneOffDates.push(dateStr);
      }
    });
    console.log("  Tier one-off dates added:", tierOneOffMatches);
    if (tierOneOffDates.length > 0) {
      console.log("  Tier one-off date list:", tierOneOffDates);
    }
  } else if (tierSchedule?.schedule_type === "all_dates") {
    // If tier allows all dates, keep all candidates
    candidates.forEach((d) => tierFiltered.add(d));
    console.log(
      "  Tier schedule is 'all_dates' - keeping all",
      candidates.size,
      "candidates"
    );
  } else {
    // No tier schedule = inherit from newsletter (use all candidates from newsletter schedule)
    // This handles the "inherit from newsletter" case where no tier schedule is saved
    candidates.forEach((d) => tierFiltered.add(d));
    console.log("  ✓ No tier schedule - inheriting from newsletter");
    console.log(
      "  Keeping all",
      candidates.size,
      "candidates from newsletter schedule"
    );
  }
  console.log("  Total tier-filtered dates:", tierFiltered.size);
  if (tierFiltered.size > 0 && tierFiltered.size <= 20) {
    console.log("  All tier-filtered dates:", Array.from(tierFiltered).sort());
  } else if (tierFiltered.size > 20) {
    console.log(
      "  First 20 tier-filtered dates:",
      Array.from(tierFiltered).sort().slice(0, 20)
    );
  }

  // 4. Subtract Bookings
  console.log("\n[6] SUBTRACTING BOOKINGS:");
  const bookedDates = new Set(bookings.map((b) => b.target_date));
  const available = Array.from(tierFiltered).filter((d) => !bookedDates.has(d));
  console.log("  Booked dates count:", bookedDates.size);
  if (bookedDates.size > 0) {
    console.log("  Booked dates:", Array.from(bookedDates).sort());
  }
  console.log(
    "  Available dates (after subtracting bookings):",
    available.length
  );
  if (available.length > 0 && available.length <= 20) {
    console.log("  Available date list:", available.sort());
  } else if (available.length > 20) {
    console.log("  First 20 available dates:", available.sort().slice(0, 20));
  }

  // 5. Build Result with Status
  console.log("\n[7] BUILDING FINAL CALENDAR AVAILABILITY RESULT:");
  const result: DateAvailabilityStatus[] = [];
  let availableCount = 0;
  let bookedCount = 0;
  let unavailableCount = 0;
  const unavailableReasons: Record<string, number> = {};

  iterateDates(startDate, endDate, (date) => {
    // CRITICAL: Use UTC-based date string conversion
    const dateStr = date.toISOString().split("T")[0];
    const canonicalDate = getCanonicalDate(dateStr);

    if (bookedDates.has(dateStr)) {
      result.push({ date: dateStr, status: "booked", reason: "Sold Out" });
      bookedCount++;
    } else if (tierFiltered.has(dateStr)) {
      result.push({ date: dateStr, status: "available" });
      availableCount++;
    } else if (
      globalSchedule &&
      !matchesPattern(canonicalDate, globalSchedule) &&
      !globalSchedule.specific_dates?.includes(dateStr)
    ) {
      result.push({
        date: dateStr,
        status: "unavailable",
        reason: "No newsletter this day",
      });
      unavailableCount++;
      unavailableReasons["No newsletter this day"] =
        (unavailableReasons["No newsletter this day"] || 0) + 1;
    } else {
      result.push({
        date: dateStr,
        status: "unavailable",
        reason: "Tier unavailable",
      });
      unavailableCount++;
      unavailableReasons["Tier unavailable"] =
        (unavailableReasons["Tier unavailable"] || 0) + 1;
    }
  });

  console.log("\n[8] FINAL CALENDAR AVAILABILITY SUMMARY:");
  console.log("  Total dates in range:", result.length);
  console.log("  ✓ Available:", availableCount);
  console.log("  ✗ Booked:", bookedCount);
  console.log("  ✗ Unavailable:", unavailableCount);
  console.log("  Unavailable reasons:", unavailableReasons);

  if (availableCount > 0) {
    const availableDates = result
      .filter((r) => r.status === "available")
      .map((r) => r.date);
    if (availableDates.length <= 20) {
      console.log("  Available dates:", availableDates.sort());
    } else {
      console.log(
        "  First 20 available dates:",
        availableDates.sort().slice(0, 20)
      );
    }
  } else {
    console.log("  ⚠️ WARNING: NO AVAILABLE DATES!");
    console.log("  This could mean:");
    console.log("    - No newsletter schedule is configured");
    console.log("    - Tier schedule is filtering out all dates");
    console.log("    - All dates are already booked");
  }

  console.log("\n" + "=".repeat(80));
  console.log("[SCHEDULE COMPARISON] Complete");
  console.log("=".repeat(80) + "\n");

  return result;
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
    imagePath?: string | null; // <--- Added type definition
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
    new_image_path: content.imagePath || null, // <--- Pass the path
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
