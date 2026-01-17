"use client";

import EmptyState from "./EmptyState";
import classes from "./UpNext.module.css";
import type { Booking } from "@/app/types/booking";

interface UpNextProps {
  bookings: Booking[];
}

export default function UpNext({ bookings }: UpNextProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays === 2) {
      return "Day After Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }
  };

  const getTierName = (booking: Booking) => {
    if (!booking.inventory_tiers) return "";
    const tier = Array.isArray(booking.inventory_tiers)
      ? booking.inventory_tiers[0]
      : booking.inventory_tiers;
    return tier?.name || "";
  };

  if (bookings.length === 0) {
    return (
      <div className="modern-card">
        <div style={{ marginBottom: "1.5rem" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--color-text-heading)",
            }}
          >
            Up Next
          </h2>
          <p
            style={{
              margin: "0.25rem 0 0 0",
              fontSize: "0.875rem",
              color: "var(--color-text-body)",
            }}
          >
            Your upcoming scheduled ads
          </p>
        </div>
        <EmptyState
          icon="pi pi-calendar"
          title="No upcoming ads scheduled"
          message="Approved bookings will appear here."
        />
      </div>
    );
  }

  return (
    <div className="modern-card">
      <div style={{ marginBottom: "1.5rem" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--color-text-heading)",
          }}
        >
          Up Next
        </h2>
        <p
          style={{
            margin: "0.25rem 0 0 0",
            fontSize: "0.875rem",
            color: "var(--color-text-body)",
          }}
        >
          Your upcoming scheduled ads
        </p>
      </div>
      <div className={classes.scheduleList}>
        {bookings.map((booking) => (
          <div key={booking.id} className={classes.scheduleItem}>
            <div className={classes.scheduleDate}>
              {formatDate(booking.target_date)}
            </div>
            <div className={classes.scheduleContent}>
              <div className={classes.scheduleSponsor}>
                {booking.sponsor_name || "Unknown Sponsor"}
              </div>
              {getTierName(booking) && (
                <div className={classes.scheduleTier}>
                  {getTierName(booking)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
