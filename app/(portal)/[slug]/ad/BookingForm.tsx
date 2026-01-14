"use client";

import { useState, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { createBooking } from "@/app/actions";
import { useParams } from "next/navigation";
import AdCreative from "./AdCreative"; // Import the new component

interface Tier {
  id: string;
  name: string;
  price: number;
  description: string;
}

// Update props to accept newsletterName
export default function BookingForm({
  tiers,
  newsletterName,
}: {
  tiers: Tier[];
  newsletterName: string;
}) {
  const params = useParams();
  const slug = params.slug as string;

  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    success: boolean;
    msg: string;
  } | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // NEW: Track if we have moved past the calendar phase
  const [bookingComplete, setBookingComplete] = useState(false);

  // TIMEZONE FIX
  const parseDateString = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
  };

  const handleSubmit = async () => {
    if (!selectedTier || !date) return;
    setLoading(true);
    setStatus(null);

    const result = await createBooking(selectedTier.id, date, slug);

    if (result.success && result.bookingId) {
      setBookingId(result.bookingId);
      // SUCCESS: Switch the UI to the "AdCreative" component
      setBookingComplete(true);
    } else {
      setStatus({ success: false, msg: result.message });
      setLoading(false);
    }
  };

  // VIEW 2: THE BOUNCER (Asset Upload)
  if (bookingComplete && bookingId) {
    return <AdCreative newsletterName={newsletterName} bookingId={bookingId} />;
  }

  // VIEW 1: THE CALENDAR (Booking)
  return (
    <div className="flex flex-column gap-4">
      {status && (
        <Message
          severity={status.success ? "success" : "error"}
          text={status.msg}
          className="w-full"
        />
      )}

      <div className="flex flex-column gap-2">
        <label className="font-bold">1. Select Ad Type</label>
        <Dropdown
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.value)}
          options={tiers}
          optionLabel="name"
          placeholder="Choose an option"
          className="w-full"
          itemTemplate={(option) => (
            <div className="flex justify-content-between w-full gap-4">
              <span>{option.name}</span>
              <span className="font-bold text-primary">
                ${(option.price / 100).toFixed(2)}
              </span>
            </div>
          )}
        />
      </div>

      <div className="flex flex-column gap-2">
        <label className="font-bold">2. Select Date</label>
        <Calendar
          value={date}
          onChange={(e) => setDate(e.value as Date)}
          inline
          minDate={new Date()}
          disabledDates={bookedDates}
          disabled={!selectedTier || loading}
          className="w-full"
        />
        {!selectedTier && (
          <small className="text-500">Please select an ad type first.</small>
        )}
      </div>

      <div className="mt-2">
        <Button
          label={
            loading
              ? "Processing..."
              : date
              ? `Book for ${date.toLocaleDateString()}`
              : "Select a Date"
          }
          icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
          disabled={!date || !selectedTier || loading}
          onClick={handleSubmit}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
