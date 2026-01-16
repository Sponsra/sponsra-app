import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "primereact/button";
import BookingsTable from "./BookingsTable";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import {
  createStripeConnectAccount,
  getStripeStatus,
} from "@/app/actions/stripe-connect";
import type { InventoryTier, NewsletterTheme } from "@/app/types/inventory";
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
        id, name, slug, theme_config,
        inventory_tiers(*),
        bookings(
            id, target_date, status, ad_headline, ad_body, ad_link, sponsor_name, ad_image_path,
            inventory_tiers(price, name)
        )
    `
    )
    .eq("owner_id", user.id)
    .single();

  // 3. Check Stripe Status (for the Warning Banner)
  const isStripeConnected = await getStripeStatus();

  const tiers: InventoryTier[] = newsletter?.inventory_tiers || [];

  // 4. Calculate Stats
  const bookings: Booking[] = newsletter?.bookings || [];
  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.target_date).getTime() - new Date(a.target_date).getTime()
    )
    .slice(0, 5);

  const theme: NewsletterTheme = {
    primary_color: newsletter?.theme_config?.primary_color || "#3b82f6",
    font_family: newsletter?.theme_config?.font_family || "sans",
    layout_style: newsletter?.theme_config?.layout_style || "minimal",
  };

  const pendingCount = bookings.filter(
    (b) => b.status === "draft" || b.status === "pending_payment"
  ).length;

  const revenueCents = bookings
    .filter((b) => b.status === "paid" || b.status === "approved")
    .reduce((sum, b) => {
      const tier = Array.isArray(b.inventory_tiers)
        ? b.inventory_tiers[0]
        : b.inventory_tiers;
      return sum + (tier?.price || 0);
    }, 0);

  // Helper for top-level currency display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value / 100);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        {/* STRIPE ALERT: If not connected, show big warning */}
        {!isStripeConnected && (
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
                  Payout Setup Required
                </div>
                <div style={{ fontSize: "0.875rem", color: "#c2410c" }}>
                  Connect with Stripe to receive sponsorship money. You cannot
                  accept payments until this is done.
                </div>
              </div>
              <form action={createStripeConnectAccount}>
                <Button
                  label="Setup Payouts"
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
        />

        {/* STATS ROW */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-title">Revenue</div>
            <div className="stat-card-subtitle">All Time</div>
            <div
              className="stat-card-value"
              style={{ color: "var(--primary-color)" }}
            >
              {formatCurrency(revenueCents)}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Needs Review</div>
            <div className="stat-card-subtitle">Pending Actions</div>
            <div
              className="stat-card-value"
              style={{
                color: pendingCount > 0 ? "#ea580c" : "var(--text-color)",
              }}
            >
              {pendingCount}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-title">Total Bookings</div>
            <div className="stat-card-subtitle">All Statuses</div>
            <div className="stat-card-value">{bookings.length}</div>
          </div>
        </div>

        {/* RECENT BOOKINGS TABLE */}
        <div className="modern-card">
          <div style={{ marginBottom: "1.5rem" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-color)",
              }}
            >
              Recent Orders
            </h2>
            <p
              style={{
                margin: "0.25rem 0 0 0",
                fontSize: "0.875rem",
                color: "var(--text-color-secondary)",
              }}
            >
              Manage and review your sponsorship bookings
            </p>
          </div>
          {recentBookings.length === 0 ? (
            <div className="empty-state">
              <i className="pi pi-inbox"></i>
              <h3>No bookings yet</h3>
              <p>Share your link to get your first sponsor!</p>
            </div>
          ) : (
            <BookingsTable bookings={recentBookings} theme={theme} />
          )}
        </div>
      </div>
    </div>
  );
}
