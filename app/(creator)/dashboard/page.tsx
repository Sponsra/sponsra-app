import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "primereact/button";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import PulseCards from "./PulseCards";
import RequiresAttention from "./RequiresAttention";
import UpNext from "./UpNext";
import {
  createStripeConnectAccount,
  getStripeStatus,
} from "@/app/actions/stripe-connect";
import type { InventoryTier } from "@/app/types/inventory";
import type { Booking } from "@/app/types/booking";

export default async function Dashboard() {
  const supabase = await createClient();

  // 1. Check Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // 2. Fetch Newsletter + Inventory + Bookings
  // We use a single query to get everything related to this creator
  const { data: newsletter } = await supabase
    .from("newsletters")
    .select(
      `
        id, name, slug, brand_color,
        inventory_tiers(*),
        bookings(
            id, created_at, target_date, status, ad_headline, ad_body, ad_link, sponsor_name, ad_image_path,
            inventory_tiers(price, name)
        )
    `
    )
    .eq("owner_id", user.id)
    .single();

  // 3. Check Stripe Status (for the Warning Banner)
  const stripeStatus = await getStripeStatus();
  const isStripeActive = stripeStatus === "active";

  const tiers: InventoryTier[] = newsletter?.inventory_tiers || [];
  const bookings: Booking[] = newsletter?.bookings || [];



  // Date helpers
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59
  );
  const next30DaysEnd = new Date(now);
  next30DaysEnd.setDate(next30DaysEnd.getDate() + 30);

  // Helper to get tier price
  const getTierPrice = (booking: Booking) => {
    const tier = Array.isArray(booking.inventory_tiers)
      ? booking.inventory_tiers[0]
      : booking.inventory_tiers;
    return tier?.price || 0;
  };

  // 1. Revenue This Month
  const revenueThisMonth = bookings
    .filter((b) => {
      if (b.status !== "paid" && b.status !== "approved") return false;
      if (!b.created_at) return false;
      const createdDate = new Date(b.created_at);
      return createdDate >= currentMonthStart && createdDate <= currentMonthEnd;
    })
    .reduce((sum, b) => sum + getTierPrice(b), 0);

  // 2. Revenue Last Month
  const revenueLastMonth = bookings
    .filter((b) => {
      if (b.status !== "paid" && b.status !== "approved") return false;
      if (!b.created_at) return false;
      const createdDate = new Date(b.created_at);
      return createdDate >= lastMonthStart && createdDate <= lastMonthEnd;
    })
    .reduce((sum, b) => sum + getTierPrice(b), 0);

  // 3. Requests Count (status = 'paid')
  const requestsCount = bookings.filter((b) => b.status === "paid").length;

  // 4. Occupancy Data (Next 30 Days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next30Days = new Date(today);
  next30Days.setDate(next30Days.getDate() + 30);

  const bookingsInNext30Days = bookings.filter((b) => {
    if (b.status !== "approved") return false;
    const targetDate = new Date(b.target_date);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate >= today && targetDate <= next30Days;
  });

  // Calculate total available slots from active inventory tiers
  // For simplicity, we'll assume each tier can have one slot per day
  // In a more complex system, you'd track max slots per tier
  const activeTiers = tiers.filter((t) => t.is_active);
  const totalSlots = activeTiers.length * 30; // 30 days * number of active tiers
  const filledSlots = bookingsInNext30Days.length;
  const occupancyPercentage =
    totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0;

  // 5. Requires Attention (only paid bookings need review)
  const requiresAttention = bookings.filter((b) => b.status === "paid");

  // 6. Up Next (Next 3 approved bookings)
  const upNext = bookings
    .filter((b) => {
      if (b.status !== "approved") return false;
      const targetDate = new Date(b.target_date);
      targetDate.setHours(0, 0, 0, 0);
      return targetDate >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.target_date).getTime();
      const dateB = new Date(b.target_date).getTime();
      return dateA - dateB;
    })
    .slice(0, 3);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        {/* STRIPE ALERT: If not fully active, show granular warning */}
        {stripeStatus !== "active" && (
          <div className="modern-alert">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <i
                className="pi pi-exclamation-triangle text-2xl"
                style={{ color: "#ea580c" }}
              ></i>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "1rem",
                    marginBottom: "0.25rem",
                    color: "#9a3412",
                  }}
                >
                  {stripeStatus === "none"
                    ? "Payout Setup Required"
                    : "Action Required: Stripe Restricted"}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#c2410c" }}>
                  {stripeStatus === "none"
                    ? "Connect your Stripe account to start accepting sponsorships."
                    : "Your account is connected but needs attention (e.g. verify bank info) before you can receive payouts."}
                </div>
              </div>
              <form action={createStripeConnectAccount}>
                <Button
                  label={
                    stripeStatus === "none" ? "Setup Payouts" : "Update Stripe"
                  }
                  severity="warning"
                  icon="pi pi-wallet"
                  className="modern-button"
                />
              </form>
            </div>
          </div>
        )}

        <DashboardHeader
          newsletterName={newsletter?.name || "Creator"}
          newsletterSlug={newsletter?.slug || ""}
          tiers={tiers}
          isStripeConnected={isStripeActive}
          stripeStatus={stripeStatus}
        />

        {/* Row 1: The Pulse */}
        <PulseCards
          revenueThisMonth={revenueThisMonth}
          revenueLastMonth={revenueLastMonth}
          requestsCount={requestsCount}
          occupancyData={{
            filled: filledSlots,
            total: totalSlots,
            percentage: occupancyPercentage,
          }}
        />

        {/* Row 2: Requires Attention */}
        <div style={{ marginBottom: "2rem" }}>
          <RequiresAttention
            bookings={requiresAttention}
            brandColor={newsletter?.brand_color || "#6366f1"}
          />
        </div>

        {/* Row 3: Up Next */}
        <UpNext bookings={upNext} />
      </div>
    </div>
  );
}
