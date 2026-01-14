import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import BookingsTable from "./BookingsTable"; // <--- Import the new component

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // 1. Fetch Newsletter + Inventory + Bookings
  const { data: newsletter } = await supabase
    .from("newsletters")
    .select(
      `
        id, name, slug, 
        inventory_tiers(*),
        bookings(
            id, target_date, status, ad_headline,
            inventory_tiers(price, name)
        )
    `
    )
    .eq("owner_id", user.id)
    .single();

  // 2. Calculate Stats
  const bookings = newsletter?.bookings || [];

  const pendingCount = bookings.filter(
    (b: any) => b.status === "draft" || b.status === "pending_payment"
  ).length;

  const revenueCents = bookings
    .filter((b: any) => b.status === "paid" || b.status === "approved")
    .reduce((sum: number, b: any) => sum + (b.inventory_tiers?.price || 0), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value / 100);
  };

  return (
    <div className="p-4" style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
            sponsra.link/{newsletter?.slug}
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
          <h2 className="text-4xl m-0 text-orange-500">{pendingCount}</h2>
        </Card>
        <Card title="Total Bookings" subTitle="All Statuses">
          <h2 className="text-4xl m-0">{bookings.length}</h2>
        </Card>
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <Card title="Recent Orders" className="mb-4">
        {bookings.length === 0 ? (
          <div className="text-center p-4">No bookings yet.</div>
        ) : (
          /* Pass the raw data to the Client Component */
          <BookingsTable bookings={bookings} />
        )}
      </Card>
    </div>
  );
}
