"use server";

import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";
// Remove 'redirect' import, we don't need it here anymore
// import { redirect } from 'next/navigation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any,
});

import { getBookingForCheckout } from "@/app/actions/bookings";

// ... existing imports

export async function createCheckoutSession(bookingId: string) {
  // Fetch booking details using the new helper
  const bookingData = await getBookingForCheckout(bookingId);

  if (!bookingData) {
    throw new Error(
      "Could not retrieve booking details. Booking may not exist or be missing required information."
    );
  }

  const { booking, product, newsletter, stripeAccountId } = bookingData;

  if (!stripeAccountId)
    throw new Error("Creator has not connected a payout account.");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: product.name }, // Use product name
          unit_amount: product.price, // Use product price
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    payment_intent_data: {
      application_fee_amount: Math.round(product.price * 0.1), // 10% fee
      transfer_data: { destination: stripeAccountId },
    },
    metadata: { booking_id: bookingId },
    success_url: `${baseUrl}/${newsletter.slug}/booking?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${newsletter.slug}/booking`,
  });

  return { url: session.url };
}
