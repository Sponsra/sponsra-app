import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "../Sidebar";
import BookingsTable from "../BookingsTable";
import BookingsCalendar from "./BookingsCalendar";
import type { Booking } from "@/app/types/booking";
import type { NewsletterTheme } from "@/app/types/inventory";
import styles from "./bookings.module.css";

export default async function BookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: newsletter } = await supabase
    .from("newsletters")
    .select(
      `
        id, name, theme_config,
        bookings(
          id, target_date, status, ad_headline, ad_body, ad_link, sponsor_name, ad_image_path,
          inventory_tiers(price, name, specs_headline_limit, specs_body_limit)
        )
      `
    )
    .eq("owner_id", user.id)
    .single();

  const bookings: Booking[] = newsletter?.bookings || [];

  const theme: NewsletterTheme = {
    primary_color: newsletter?.theme_config?.primary_color || "#3b82f6",
    font_family: newsletter?.theme_config?.font_family || "sans",
    layout_style: newsletter?.theme_config?.layout_style || "minimal",
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header mb-6">
          <div>
            <h1>Bookings</h1>
            <p className="dashboard-header-subtitle">
              View all bookings and scheduled dates
            </p>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.calendarCard}>
            <BookingsCalendar bookings={bookings} />
          </div>
          <div className={styles.tableCard}>
            <div className={styles.sectionHeader}>
              <h2>All Bookings</h2>
              <p>Complete list of sponsorship bookings</p>
            </div>
            <BookingsTable bookings={bookings} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}
