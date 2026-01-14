import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import BookingsTable from "./BookingsTable";
import {
  createStripeConnectAccount,
  getStripeStatus,
} from "@/app/actions/stripe-connect";

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
        id, name, slug, 
        inventory_tiers(*),
        bookings(
            id, target_date, status, ad_headline, ad_body, ad_link, sponsor_name,
            inventory_tiers(price, name)
        )
    `
    )
    .eq("owner_id", user.id)
    .single();

  // 3. Check Stripe Status (for the Warning Banner)
  const isStripeConnected = await getStripeStatus();

  // 4. Calculate Stats
  const bookings = newsletter?.bookings || [];

  const pendingCount = bookings.filter(
    (b: any) => b.status === "draft" || b.status === "pending_payment"
  ).length;

  const revenueCents = bookings
    .filter((b: any) => b.status === "paid" || b.status === "approved")
    .reduce((sum: number, b: any) => sum + (b.inventory_tiers?.price || 0), 0);

  // Helper for top-level currency display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value / 100);
  };

  return (
    <div className="p-4" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* 5. STRIPE ALERT: If not connected, show big warning */}
      {!isStripeConnected && (
        <div className="mb-5">
          <Message
            severity="warn"
            style={{ width: "100%" }}
            content={
              <div className="flex align-items-center gap-4 w-full p-2">
                <i className="pi pi-exclamation-triangle text-2xl text-orange-500"></i>
                <div className="flex-1">
                  <div className="font-bold text-lg">Payout Setup Required</div>
                  <div className="text-700">
                    Connect with Stripe to receive sponsorship money. You cannot
                    accept payments until this is done.
                  </div>
                </div>
                <form action={createStripeConnectAccount}>
                  <Button
                    label="Setup Payouts"
                    severity="warning"
                    icon="pi pi-wallet"
                  />
                </form>
              </div>
            }
          />
        </div>
      )}

      {/* HEADER */}
      <div
        className="flex justify-content-between align-items-center mb-4"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 className="text-3xl font-bold m-0" style={{ margin: 0 }}>
            {newsletter?.name || "Creator Office"}
          </h1>
          <p className="text-secondary m-0" style={{ opacity: 0.6 }}>
            {newsletter
              ? `sponsra.link/${newsletter.slug}`
              : "Set up your newsletter to start"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Button label="New Booking" icon="pi pi-plus" />
        </div>
      </div>

      {/* STATS ROW */}
      <div
        className="grid mb-5"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <Card title="Revenue" subTitle="All Time">
          <h2 className="text-4xl m-0 text-primary">
            {formatCurrency(revenueCents)}
          </h2>
        </Card>
        <Card title="Needs Review" subTitle="Pending Actions">
          <h2
            className={`text-4xl m-0 ${
              pendingCount > 0 ? "text-orange-500" : ""
            }`}
          >
            {pendingCount}
          </h2>
        </Card>
        <Card title="Total Bookings" subTitle="All Statuses">
          <h2 className="text-4xl m-0">{bookings.length}</h2>
        </Card>
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <Card title="Recent Orders" className="mb-4">
        {bookings.length === 0 ? (
          <div className="text-center p-5 surface-50 border-round">
            <i className="pi pi-inbox text-4xl text-400 mb-3"></i>
            <p className="text-xl m-0 text-600">No bookings yet.</p>
            <p className="text-sm text-500">
              Share your link to get your first sponsor!
            </p>
          </div>
        ) : (
          // Pass data to Client Component
          <BookingsTable bookings={bookings} />
        )}
      </Card>
    </div>
  );
}
