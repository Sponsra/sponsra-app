/**
 * Manual Stripe Account Status Sync Script
 * 
 * This script manually syncs Stripe account status for a specific user.
 * Useful for debugging or one-time fixes when webhooks were missed.
 * 
 * Usage:
 * 1. Set the USER_ID below to your user's ID
 * 2. Run: npx tsx scripts/sync-stripe-status.ts
 */

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const USER_ID = "YOUR_USER_ID_HERE"; // Replace with actual user ID

async function syncStripeStatus() {
    // Initialize Supabase with service role key
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-12-15.clover",
    });

    console.log(`🔄 Syncing Stripe status for user: ${USER_ID}`);

    // Get user's Stripe account ID
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("stripe_account_id, stripe_charges_enabled, stripe_details_submitted")
        .eq("id", USER_ID)
        .single();

    if (profileError) {
        console.error("❌ Error fetching profile:", profileError);
        return;
    }

    if (!profile?.stripe_account_id) {
        console.log("⚠️ No Stripe account found for this user");
        return;
    }

    console.log("📊 Current cached status:", {
        stripe_account_id: profile.stripe_account_id,
        charges_enabled: profile.stripe_charges_enabled,
        details_submitted: profile.stripe_details_submitted,
    });

    try {
        // Fetch latest from Stripe API
        const account = await stripe.accounts.retrieve(profile.stripe_account_id);

        console.log("🔍 Stripe API status:", {
            charges_enabled: account.charges_enabled,
            details_submitted: account.details_submitted,
            payouts_enabled: account.payouts_enabled,
        });

        // Update database
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                stripe_charges_enabled: account.charges_enabled,
                stripe_details_submitted: account.details_submitted,
            })
            .eq("id", USER_ID);

        if (updateError) {
            console.error("❌ Error updating profile:", updateError);
            return;
        }

        console.log("✅ Successfully synced Stripe status!");

        if (account.charges_enabled) {
            console.log("🎉 Account is ACTIVE - user can accept payments");
        } else {
            console.log("⚠️ Account is RESTRICTED - user needs to complete onboarding");
            if (account.requirements?.currently_due?.length) {
                console.log("📋 Requirements currently due:", account.requirements.currently_due);
            }
        }
    } catch (error) {
        console.error("❌ Error syncing from Stripe:", error);
    }
}

syncStripeStatus();
