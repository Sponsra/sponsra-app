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

  // A. Create an Express Account for this user (if they don't have one)
  // Ideally, check DB first. If 'stripe_account_id' exists, skip this.
  const account = await stripe.accounts.create({
    type: "express",
    email: user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  // B. Save this 'acct_...' ID to your Supabase Profile
  // This binds the user to this Stripe wallet.
  await supabase
    .from("profiles")
    .update({ stripe_account_id: account.id })
    .eq("id", user.id);

  // C. Create the "Onboarding Link"
  // This is the URL where they enter their bank details.
  // Ensure URLs have proper protocol (http:// or https://)
  const getBaseUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    // If it already starts with http:// or https://, use it as-is
    if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
      return baseUrl;
    }
    // Otherwise, prepend https:// (or http:// for localhost)
    return baseUrl.includes("localhost")
      ? `http://${baseUrl}`
      : `https://${baseUrl}`;
  };

  const baseUrl = getBaseUrl();
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${baseUrl}/dashboard`, // If they fail/reload
    return_url: `${baseUrl}/dashboard`, // If they succeed
    type: "account_onboarding",
  });

  // D. Send them to Stripe
  redirect(accountLink.url);
}

// 2. Check Status (To show "Connected" or "Not Connected" badge)
export async function getStripeStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", user.id)
    .single();

  if (!data?.stripe_account_id) return false;

  // Optional: Check with Stripe if they actually finished onboarding
  const account = await stripe.accounts.retrieve(data.stripe_account_id);
  return account.charges_enabled;
}
