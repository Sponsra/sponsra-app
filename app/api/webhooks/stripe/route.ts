import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// 1. Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any,
});

export async function POST(req: Request) {
  // 2. SAFETY CHECK: Ensure keys are loaded
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing.");
    return NextResponse.json({ error: "Server Config Error" }, { status: 500 });
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("❌ CRITICAL: STRIPE_WEBHOOK_SECRET is missing.");
    return NextResponse.json({ error: "Server Config Error" }, { status: 500 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const body = await req.text();

  // FIX: await headers() before getting the value
  const headerPayload = await headers();
  const signature = headerPayload.get("stripe-signature");

  if (!signature) {
    console.error("⚠️ No stripe-signature header found.");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error(`⚠️ Webhook Signature Verification Failed: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // 3. Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    console.log(`✅ Payment confirmed for Booking ID: ${bookingId}`);

    if (bookingId) {
      const { error } = await supabaseAdmin
        .from("bookings")
        .update({ status: "paid" })
        .eq("id", bookingId);

      if (error) {
        console.error("❌ Supabase Update Failed:", error);
        return NextResponse.json(
          { error: "Database update failed" },
          { status: 500 }
        );
      } else {
        console.log("🎉 Database successfully updated to PAID");
      }
    }
  }

  return NextResponse.json({ received: true });
}
