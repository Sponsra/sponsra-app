"use client";

import { Calendar } from "primereact/calendar";
import type {
  CalendarDateTemplateEvent,
  CalendarSelectEvent,
} from "primereact/calendar";
import { Tag } from "primereact/tag";
import { useMemo, useState } from "react";
import type { Booking } from "@/app/types/booking";
import classes from "./BookingsCalendar.module.css";

interface BookingsCalendarProps {
  bookings: Booking[];
}

const toDateKey = (year?: number, month?: number, day?: number) => {
  if (!year || !month || !day) return "";
  const monthValue = `${month}`.padStart(2, "0");
  const dayValue = `${day}`.padStart(2, "0");
  return `${year}-${monthValue}-${dayValue}`;
};

export default function BookingsCalendar({ bookings }: BookingsCalendarProps) {
  const bookedDates = useMemo(
    () => new Set(bookings.map((booking) => booking.target_date).filter(Boolean)),
    [bookings]
  );
  const bookingByDate = useMemo(() => {
    const map = new Map<string, Booking>();
    bookings.forEach((booking) => {
      if (booking.target_date && !map.has(booking.target_date)) {
        map.set(booking.target_date, booking);
      }
    });
    return map;
  }, [bookings]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const dateTemplate = (event: CalendarDateTemplateEvent) => {
    const key = toDateKey(event.year, event.month + 1, event.day);
    const isBooked = key ? bookedDates.has(key) : false;

    return (
      <div className={isBooked ? classes.bookedDate : undefined}>
        {event.day}
      </div>
    );
  };

  const handleSelect = (event: CalendarSelectEvent) => {
    const dateValue = event.value instanceof Date ? event.value : null;
    if (!dateValue) {
      setSelectedBooking(null);
      return;
    }
    const key = toDateKey(
      dateValue.getFullYear(),
      dateValue.getMonth() + 1,
      dateValue.getDate()
    );
    setSelectedBooking(key ? bookingByDate.get(key) ?? null : null);
  };

  return (
    <div className={classes.calendarCard}>
      <div className={classes.header}>
        <h2>Schedule Overview</h2>
        <p>Highlighted days have bookings scheduled</p>
      </div>
      <div className={classes.calendarLayout}>
        <div className={classes.calendarPane}>
          <Calendar inline dateTemplate={dateTemplate} onSelect={handleSelect} />
        </div>
        <div className={classes.previewPane}>
          {selectedBooking ? (
            <BookingPreview booking={selectedBooking} />
          ) : (
            <div className={classes.previewEmpty}>
              Select a highlighted date to preview the booking.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const getImageUrl = (path?: string | null) => {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ad-creatives/${path}`;
};

const statusLabel = (status: Booking["status"]) => {
  switch (status) {
    case "paid":
      return { label: "Needs Review", severity: "warning" as const };
    case "approved":
      return { label: "Approved", severity: "success" as const };
    case "rejected":
      return { label: "Rejected", severity: "danger" as const };
    case "pending_payment":
      return { label: "Pending Payment", severity: "secondary" as const };
    default:
      return { label: "Draft", severity: "secondary" as const };
  }
};

function BookingPreview({ booking }: { booking: Booking }) {
  const status = statusLabel(booking.status);
  const imageUrl = getImageUrl(booking.ad_image_path);

  return (
    <div className={classes.previewCard}>
      <div className={classes.previewHeader}>
        <div>
          <h3>{booking.sponsor_name || "Unknown Sponsor"}</h3>
          <p>{formatDate(booking.target_date)}</p>
        </div>
        <Tag value={status.label} severity={status.severity} />
      </div>

      {imageUrl && (
        <div className={classes.previewImage}>
          <img src={imageUrl} alt="Ad Creative" />
        </div>
      )}

      <div className={classes.previewSection}>
        <span>Headline</span>
        <strong>{booking.ad_headline || "No headline provided"}</strong>
      </div>

      <div className={classes.previewSection}>
        <span>Body</span>
        <p>{booking.ad_body || "No body text provided"}</p>
      </div>

      <div className={classes.previewSection}>
        <span>Link</span>
        {booking.ad_link ? (
          <a href={booking.ad_link} target="_blank" rel="noopener noreferrer">
            {booking.ad_link}
          </a>
        ) : (
          <p>No link provided</p>
        )}
      </div>
    </div>
  );
}
