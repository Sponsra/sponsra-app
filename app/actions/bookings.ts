// app/actions/bookings.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createCheckoutSession } from "./stripe";
import { Product } from "@/app/types/product";

/**
 * Create a new booking with assets (Step 2 of Wizard)
 */
export async function createBookingWithAssets(
  bookingId: string,
  slotId: string,
  product: Product,
  newsletterSlug: string,
  sponsorInfo: {
    name: string;
    email: string;
    link: string;
  },
  assets: {
    headline: string;
    body: string;
    imagePath?: string | null;
  }
) {
  const supabase = await createClient();

  // 1. Validate Input
  if (!sponsorInfo.email || !sponsorInfo.name) {
    return { success: false, error: "Missing sponsor information." };
  }

  // 2. Fetch Slot to verify availability/hold
  const { data: slot, error: slotError } = await supabase
    .from("inventory_slots")
    .select("*")
    .eq("id", slotId)
    .single();

  if (slotError || !slot) {
    return { success: false, error: "Slot not found." };
  }

  // We allow booking if status is 'available' OR 'held' (assuming held by this session, verified by caller ideally)
  // For now, we trust the flow. Strict check would verify session ID.
  if (slot.status === "booked" || slot.status === "locked") {
    return { success: false, error: "Slot is no longer available." };
  }

  // 3. Insert Booking Record
  const { error: bookingError } = await supabase
    .from("bookings")
    .insert({
      id: bookingId, // Use pre-generated ID
      newsletter_id: product.newsletter_id,
      product_id: product.id,
      slot_id: slotId,
      sponsor_email: sponsorInfo.email,
      sponsor_name: sponsorInfo.name,
      target_date: slot.slot_date, // Duplicate date for easy query
      status: "draft",
    });

  if (bookingError) {
    console.error("Error creating booking:", bookingError);
    return { success: false, error: bookingError.message };
  }

  // 4. Update Slot to link to Booking (still 'held' until paid)
  // We don't change status to 'booked' yet.
  const { error: slotUpdateError } = await supabase
    .from("inventory_slots")
    .update({
      booking_id: bookingId,
    })
    .eq("id", slotId);

  if (slotUpdateError) {
    console.error("Error linking slot:", slotUpdateError);
    // Should rollback booking?
    return { success: false, error: "Failed to link slot to booking." };
  }

  // 5. Insert Asset Requirements
  // We need to map assets to requirement IDs.
  // The product object should have asset_requirements populated.
  // For simplicity, we assume standard requirements for now, or we look them up.
  // Ideally, valid asset submission requires knowing requirement IDs.
  // But our UI just has 'headline', 'body', 'image'.
  // We should match them by 'kind'.

  const assetReqs = product.asset_requirements || [];
  const assetsToInsert = [];

  // Headline
  const headlineReq = assetReqs.find((r) => r.kind === "headline");
  if (headlineReq && assets.headline) {
    assetsToInsert.push({
      booking_id: bookingId,
      asset_requirement_id: headlineReq.id,
      value: assets.headline,
    });
  }

  // Body
  const bodyReq = assetReqs.find((r) => r.kind === "body");
  if (bodyReq && assets.body) {
    assetsToInsert.push({
      booking_id: bookingId,
      asset_requirement_id: bodyReq.id,
      value: assets.body,
    });
  }

  // Link (usually explicit requirement, or part of logic)
  const linkReq = assetReqs.find((r) => r.kind === "link");
  if (linkReq && sponsorInfo.link) {
    assetsToInsert.push({
      booking_id: bookingId,
      asset_requirement_id: linkReq.id,
      value: sponsorInfo.link,
    });
  }

  // Image
  const imageReq = assetReqs.find((r) => r.kind === "image");
  if (imageReq && assets.imagePath) {
    assetsToInsert.push({
      booking_id: bookingId,
      asset_requirement_id: imageReq.id,
      value: assets.imagePath,
    });
  }

  if (assetsToInsert.length > 0) {
    const { error: assetsError } = await supabase
      .from("booking_assets")
      .insert(assetsToInsert);

    if (assetsError) {
      console.error("Error saving assets:", assetsError);
      return { success: false, error: "Failed to save booking assets." };
    }
  }

  return { success: true, bookingId };
}

/**
 * Get Booking Details for Checkout
 */
export async function getBookingForCheckout(bookingId: string) {
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
            *,
            products (
                name,
                price
            ),
            newsletters (
                slug,
                owner_id
            )
        `)
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return null;
  }

  // Fetch stripe account separately or join profiles?
  // Profiles is on 'owner_id'
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", booking.newsletters.owner_id)
    .single();

  return {
    booking,
    product: booking.products,
    newsletter: booking.newsletters,
    stripeAccountId: profile?.stripe_account_id
  };
}

// Create Stripe checkout session for payment
export async function createBookingCheckout(bookingId: string) {
  const checkoutResult = await createCheckoutSession(bookingId);

  if (!checkoutResult.url) {
    return { success: false, error: "Failed to initialize payment." };
  }

  return { success: true, url: checkoutResult.url };
}

/**
 * Get Owner's Dashboard Data (Updated for new schema)
 */
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

  // Fetch Bookings with join on products and slots
  const { data, error } = await supabase
    .from("bookings")
    .select(`
        id,
        created_at,
        target_date,
        status,
        sponsor_name,
        sponsor_email,
        amount_paid,
        product: products (
            name,
            price,
            product_type
        ),
        slot: inventory_slots (
            slot_date,
            slot_index
        ),
        assets: booking_assets (
            value,
            asset_requirement_id
        )
    `)
    .in("newsletter_id", newsletterIds)
    .in("status", ["paid", "approved", "completed", "rejected"]) // Only show relevant bookings
    .order("target_date", { ascending: true });

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  return data || [];
}

/**
 * Approve Booking
 */
export async function approveBooking(bookingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "approved" })
    .eq("id", bookingId);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Reject Booking
 */
export async function rejectBooking(bookingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status: "rejected" })
    .eq("id", bookingId);

  if (error) return { success: false, message: error.message };

  // Should we free the slot?
  // Ideally yes.
  // Fetch booking to get slot_id
  const { data: booking } = await supabase
    .from("bookings")
    .select("slot_id")
    .eq("id", bookingId)
    .single();

  if (booking?.slot_id) {
    await supabase
      .from("inventory_slots")
      .update({ status: "available", booking_id: null })
      .eq("id", booking.slot_id);
  }

  revalidatePath("/dashboard");
  return { success: true };
}

