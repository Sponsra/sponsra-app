// app/(portal)/[slug]/ad/BookingForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import AdCreative from "./AdCreative"; // Import the updated component
import { createBooking, getBookedDates } from "@/app/actions/bookings";
import { InventoryTierPublic, NewsletterTheme } from "@/app/types/inventory";

type BookedDateItem = { target_date?: string | null } | string;

const toDateFromBookedItem = (item: BookedDateItem) => {
  const dateStr = typeof item === "string" ? item : item.target_date || "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export default function BookingForm({
  tiers,
  newsletterName,
  slug,
  theme,
}: {
  tiers: InventoryTierPublic[];
  newsletterName: string;
  slug: string;
  theme: NewsletterTheme;
}) {
  const [selectedTier, setSelectedTier] = useState<InventoryTierPublic | null>(
    null
  );
  const [date, setDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [prefilledSponsor, setPrefilledSponsor] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const tierId = searchParams.get("tier");
    if (tierId && tiers.length > 0) {
      const foundTier = tiers.find((tier) => tier.id === tierId);
      if (foundTier) {
        setSelectedTier(foundTier);
      }
    }

    const sponsor = searchParams.get("sponsor");
    if (sponsor) {
      setPrefilledSponsor(sponsor);
    }
  }, [searchParams, tiers]);

  // 1. Fetch Blocked Dates whenever the User picks a Tier
  useEffect(() => {
    if (selectedTier) {
      setLoading(true);
      getBookedDates(selectedTier.id)
        .then((data: BookedDateItem[]) => {
          const dateObjects = data.map(toDateFromBookedItem);
          setDisabledDates(dateObjects);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedTier]);

  const handleSubmit = async () => {
    if (!date || !selectedTier) return;
    setLoading(true);

    const result = await createBooking(selectedTier.id, date, slug);

    if (result.success && result.bookingId) {
      setBookingId(result.bookingId);
      setBookingComplete(true);
    } else {
      alert(
        result.message || "This date was just taken. Please choose another."
      );

      // Refresh blocked dates
      const dates = (await getBookedDates(selectedTier.id)) as BookedDateItem[];
      const dateObjects = dates.map(toDateFromBookedItem);
      setDisabledDates(dateObjects);
      setDate(null);
    }
    setLoading(false);
  };

  // --- STEP 2: RENDER CREATIVE FORM WITH RULES ---
  if (bookingComplete && selectedTier) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--surface-ground)",
        }}
      >
        <div
          style={{
            padding: "2rem 0",
            textAlign: "center",
            background:
              "linear-gradient(to bottom, var(--surface-0), var(--surface-ground))",
            borderBottom: "1px solid var(--surface-border)",
            marginBottom: "1rem",
          }}
        >
          <h1 className="text-3xl font-bold mb-2 text-900">{newsletterName}</h1>
          <p className="text-lg text-600">Create Your Ad</p>
        </div>
        <AdCreative
          newsletterName={newsletterName}
          bookingId={bookingId}
          tier={selectedTier} // <--- PASSING THE TIER (RULES) HERE
          theme={theme}
          initialSponsorName={prefilledSponsor}
        />
      </div>
    );
  }

  // --- STEP 1: RENDER BOOKING SELECTION ---
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "3rem 1rem",
      }}
    >
      <div style={{ maxWidth: "600px", width: "100%" }}>
        <div className="text-center mb-5">
          <h1 className="text-3xl font-bold mb-2 text-900">{newsletterName}</h1>
          <p className="text-xl text-600">Booking Portal</p>
        </div>
        <Card
          title={`Book an Ad in ${newsletterName}`}
          style={{
            border: "none",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
            borderRadius: "12px",
          }}
          pt={{
            body: { style: { padding: "2rem" } },
            title: {
              style: {
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid var(--surface-border)",
              },
            },
          }}
        >
          <div className="flex flex-column" style={{ gap: "1.5rem" }}>
            {/* Tier Selection */}
            <div className="flex flex-column" style={{ gap: "0.75rem" }}>
              <label
                className="font-semibold"
                style={{ fontSize: "0.875rem", color: "var(--text-color)" }}
              >
                Select Ad Type
              </label>
              <Dropdown
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.value)}
                options={tiers}
                optionLabel="name"
                placeholder="Choose a placement"
                className="w-full"
                emptyMessage="No ad slots available."
                style={{ padding: "0.75rem" }}
              />
              {selectedTier && (
                <div
                  className="text-600"
                  style={{
                    padding: "1.25rem",
                    background: "var(--surface-50)",
                    borderRadius: "8px",
                    border: "1px solid var(--surface-border)",
                    marginTop: "0.5rem",
                  }}
                >
                  <div
                    className="font-bold text-green-600"
                    style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}
                  >
                    ${(selectedTier.price / 100).toFixed(2)}
                  </div>
                  <div style={{ marginBottom: "1rem", fontSize: "0.9375rem" }}>
                    {selectedTier.description || "No description available"}
                  </div>

                  {/* Show Rules Preview to User */}
                  <div
                    className="text-500"
                    style={{
                      fontSize: "0.8125rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--surface-border)",
                    }}
                  >
                    <div
                      className="font-semibold mb-2"
                      style={{ color: "var(--text-color)" }}
                    >
                      Ad Requirements:
                    </div>
                    <div style={{ lineHeight: "1.75" }}>
                      <div>
                        • Headline: {selectedTier.specs_headline_limit}{" "}
                        characters max
                      </div>
                      <div>
                        • Body: {selectedTier.specs_body_limit} characters max
                      </div>
                      {selectedTier.specs_image_ratio === "no_image" ? (
                        <div>• No image required</div>
                      ) : selectedTier.specs_image_ratio === "1:1" ? (
                        <div>• Image: Square (1:1) aspect ratio required</div>
                      ) : selectedTier.specs_image_ratio === "1.91:1" ? (
                        <div>
                          • Image: Landscape (1.91:1) aspect ratio required
                        </div>
                      ) : (
                        <div>• Image: Any aspect ratio</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div className="flex flex-column" style={{ gap: "0.75rem" }}>
              <label
                className="font-semibold"
                style={{ fontSize: "0.875rem", color: "var(--text-color)" }}
              >
                Select Date
              </label>
              <div
                style={{
                  background: "var(--surface-0)",
                  borderRadius: "8px",
                  padding: "1rem",
                  border: "1px solid var(--surface-border)",
                }}
              >
                <Calendar
                  value={date}
                  onChange={(e) => setDate(e.value as Date)}
                  inline
                  minDate={new Date()}
                  disabledDates={disabledDates}
                  disabled={!selectedTier}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              label={loading ? "Checking Availability..." : "Continue"}
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={handleSubmit}
              loading={loading}
              disabled={!date || !selectedTier}
              style={{
                marginTop: "0.5rem",
                padding: "0.875rem",
                fontSize: "1rem",
                fontWeight: 600,
              }}
              className="w-full"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
