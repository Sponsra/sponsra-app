"use client";

import { useState, useEffect } from "react";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import AdCreative from "./AdCreative";
import { createBooking, getBookedDates } from "@/app/actions/bookings";
import { InventoryTierPublic } from "@/app/types/inventory";

export default function BookingForm({
  tiers,
  newsletterName,
  slug,
}: {
  tiers: InventoryTierPublic[];
  newsletterName: string;
  slug: string;
}) {
  const [selectedTier, setSelectedTier] = useState<InventoryTierPublic | null>(
    null
  );
  const [date, setDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);

  // 1. Fetch Blocked Dates whenever the User picks a Tier
  useEffect(() => {
    if (selectedTier) {
      setLoading(true);
      getBookedDates(selectedTier.id)
        .then((data: any[]) => {
          // We cast to any[] to safely handle whether Supabase returns
          // ["2026-01-01"] or [{ target_date: "2026-01-01" }]
          const dateObjects = data.map((item) => {
            const dateStr = item.target_date || item; // Handle object or string
            const [y, m, d] = dateStr.split("-").map(Number);
            return new Date(y, m - 1, d);
          });
          setDisabledDates(dateObjects);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedTier]);

  const handleSubmit = async () => {
    if (!date || !selectedTier) return;
    setLoading(true);

    // 2. Attempt to Book
    const result = await createBooking(selectedTier.id, date, slug);

    if (result.success && result.bookingId) {
      // Success: Move to Step 2 (Ad Content)
      setBookingId(result.bookingId);
      setBookingComplete(true);
    } else {
      // Failure (Likely "Date Taken"): Show error and refresh calendar
      alert(
        result.message || "This date was just taken. Please choose another."
      );

      // Re-fetch the dates immediately so the user sees the greyed-out slot
      const dates = await getBookedDates(selectedTier.id);
      const dateObjects = dates.map((d: any) => {
        const [y, m, d_str] = d.split("-").map(Number);
        return new Date(y, m - 1, d_str);
      });
      setDisabledDates(dateObjects);

      // Clear their invalid selection
      setDate(null);
    }
    setLoading(false);
  };

  // If Step 1 is done, render Step 2 (The Creative Form)
  if (bookingComplete) {
    return <AdCreative newsletterName={newsletterName} bookingId={bookingId} />;
  }

  // Step 1: The Booking Form
  return (
    <div className="grid">
      <div className="col-12 md:col-6 md:col-offset-3">
        <Card title={`Book an Ad in ${newsletterName}`}>
          <div className="flex flex-column gap-4">
            {/* Tier Selection */}
            <div className="flex flex-column gap-2">
              <label className="font-bold">Select Ad Type</label>
              <Dropdown
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.value)}
                options={tiers}
                optionLabel="name"
                placeholder="Choose a placement"
                className="w-full"
              />
              {selectedTier && (
                <div className="text-sm text-600 surface-100 p-2 border-round">
                  {selectedTier.description || "No description available"} —
                  <span className="font-bold text-green-600">
                    {" "}
                    ${(selectedTier.price / 100).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div className="flex flex-column gap-2">
              <label className="font-bold">Select Date</label>
              <Calendar
                value={date}
                onChange={(e) => setDate(e.value as Date)}
                inline
                minDate={new Date()}
                disabledDates={disabledDates} // <--- The magic blocking array
                disabled={!selectedTier}
              />
              {!selectedTier && (
                <small className="text-secondary">
                  Please select an ad type first.
                </small>
              )}
            </div>

            {/* Submit Button */}
            <Button
              label={loading ? "Checking Availability..." : "Continue"}
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={handleSubmit}
              loading={loading}
              disabled={!date || !selectedTier}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
