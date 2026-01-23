"use server";

import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";
import { redirect } from "next/navigation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

// 1. Create the Account & Link
export async function createStripeConnectAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;
  const baseUrl = getBaseUrl();

  // A. Check if they already have a Stripe ID in DB
  console.log("Checking Stripe ID for user:", user.id);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.warn("Profile fetch error (could be no profile yet):", profileError.message);
  }

  let stripeAccountId = profile?.stripe_account_id;
  console.log("Found stripeAccountId in DB:", stripeAccountId);

  if (!stripeAccountId) {
    console.log("No Stripe account found. Creating a new one...");
    // B. Create an Express Account for this user if they don't have one
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email || undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    stripeAccountId = account.id;
    console.log("New Stripe account created:", stripeAccountId);

    // C. Save this 'acct_...' ID to your Supabase Profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ stripe_account_id: stripeAccountId })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update profile with Stripe ID:", updateError.message);
    }
  } else {
    console.log("Reusing existing Stripe account:", stripeAccountId);
  }

  // D. Create the "Onboarding Link" (works for new or incomplete accounts)
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${baseUrl}/dashboard`,
    return_url: `${baseUrl}/dashboard`,
    type: "account_onboarding",
  });

  // E. Send them to Stripe
  redirect(accountLink.url);
}

// Helper for protocol handling
const getBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
    return baseUrl;
  }
  return baseUrl.includes("localhost")
    ? `http://${baseUrl}`
    : `https://${baseUrl}`;
};

// 2. Check Status (To show granular status)
export type StripeStatus = "none" | "restricted" | "active";

export async function getStripeStatus(): Promise<StripeStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "none";

  const { data } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single();

  if (!data?.stripe_account_id) return "none";

  try {
    const account = await stripe.accounts.retrieve(data.stripe_account_id);
    return account.charges_enabled ? "active" : "restricted";
  } catch (error) {
    console.error("Stripe Retrieve Error:", error);
    return "none";
  }
}

// 3. Create a Login Link (for existing Express accounts)
export async function createStripeLoginLink() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single();

  if (!data?.stripe_account_id) return;

  const loginLink = await stripe.accounts.createLoginLink(data.stripe_account_id);
  redirect(loginLink.url);
}
