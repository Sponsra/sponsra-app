"use server";

import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";
// Remove 'redirect' import, we don't need it here anymore
// import { redirect } from 'next/navigation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any,
});

export async function createCheckoutSession(bookingId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_checkout_data", {
    p_booking_id: bookingId,
  });

  if (error) {
    console.error("Checkout Data Error:", error);
    throw new Error(`Could not retrieve booking details: ${error.message}`);
  }

  if (!data) {
    console.error(
      "Checkout Data Error: No data returned for booking",
      bookingId
    );
    throw new Error(
      "Could not retrieve booking details. Booking may not exist or be missing required information."
    );
  }

  const { price, tier_name, stripe_account_id, newsletter_slug } = data as {
    price: number;
    tier_name: string;
    stripe_account_id: string;
    newsletter_slug: string;
  };

  if (!stripe_account_id)
    throw new Error("Creator has not connected a payout account.");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: tier_name },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    payment_intent_data: {
      application_fee_amount: Math.round(price * 0.1),
      transfer_data: { destination: stripe_account_id },
    },
    metadata: { booking_id: bookingId },
    success_url: `${baseUrl}/${newsletter_slug}/ad?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${newsletter_slug}/ad`,
  });

  // CHANGE: Return the URL object instead of redirecting
  return { url: session.url };
}
