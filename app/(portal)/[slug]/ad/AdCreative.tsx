"use client";

import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { saveAdCreative } from "@/app/actions/bookings";
import { createCheckoutSession } from "@/app/actions/stripe";

interface AdContent {
  headline: string;
  body: string;
  link: string;
  sponsorName: string; // <--- New Field
}

export default function AdCreative({
  newsletterName,
  bookingId,
}: {
  newsletterName: string;
  bookingId: string;
}) {
  const [content, setContent] = useState<AdContent>({
    headline: "",
    body: "",
    link: "",
    sponsorName: "",
  });
  const [loading, setLoading] = useState(false);

  const maxHeadline = 60;
  const maxBody = 280;

  const handleSaveAndPay = async () => {
    // Basic validation
    if (
      !content.headline ||
      !content.body ||
      !content.link ||
      !content.sponsorName
    ) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    // 1. Save the Ad Content to Database first
    const result = await saveAdCreative(bookingId, content);

    if (result.success) {
      // 2. If save works, immediately launch Stripe
      try {
        // We await the URL from the server
        const session = await createCheckoutSession(bookingId);

        if (session?.url) {
          // We manually navigate the browser to the Stripe Checkout URL
          window.location.href = session.url;
        } else {
          throw new Error("No payment URL returned");
        }
      } catch (error) {
        console.error("Stripe Error:", error);
        alert("Payment system error. Please try again.");
        setLoading(false);
      }
    } else {
      alert(`Error saving ad content: ${result.message}`);
      setLoading(false);
    }
  };

  return (
    <div
      className="grid mt-4"
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
    >
      {/* LEFT: Input Form */}
      <div>
        <Card title="Step 3: Ad Content">
          <div className="flex flex-column gap-3">
            {/* Company Name */}
            <div className="flex flex-column gap-2">
              <label className="font-bold">Company / Sponsor Name</label>
              <InputText
                value={content.sponsorName}
                onChange={(e) =>
                  setContent({ ...content, sponsorName: e.target.value })
                }
                placeholder="e.g. Acme Corp"
                autoFocus
              />
            </div>

            {/* Headline */}
            <div className="flex flex-column gap-2">
              <label className="font-bold">Headline</label>
              <InputText
                value={content.headline}
                onChange={(e) =>
                  setContent({ ...content, headline: e.target.value })
                }
                className={
                  content.headline.length > maxHeadline ? "p-invalid" : ""
                }
                placeholder="e.g. The Best CRM for Creators"
              />
              <small className="text-secondary">
                {content.headline.length}/{maxHeadline}
              </small>
            </div>

            {/* Body Copy */}
            <div className="flex flex-column gap-2">
              <label className="font-bold">Ad Copy</label>
              <InputTextarea
                value={content.body}
                onChange={(e) =>
                  setContent({ ...content, body: e.target.value })
                }
                rows={5}
                className={content.body.length > maxBody ? "p-invalid" : ""}
                placeholder="Describe your product..."
              />
              <small className="text-secondary">
                {content.body.length}/{maxBody}
              </small>
            </div>

            {/* URL */}
            <div className="flex flex-column gap-2">
              <label className="font-bold">Destination URL</label>
              <InputText
                value={content.link}
                onChange={(e) =>
                  setContent({ ...content, link: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            {/* Submit Button */}
            <Button
              label={loading ? "Redirecting to Payment..." : "Submit & Pay"}
              icon="pi pi-credit-card"
              className="mt-3"
              loading={loading}
              onClick={handleSaveAndPay}
            />
            <small className="block mt-2 text-secondary text-center">
              You will be redirected to Stripe to complete your purchase.
            </small>
          </div>
        </Card>
      </div>

      {/* RIGHT: Live Preview */}
      <div>
        <Card title="Live Preview" className="surface-100">
          <div
            className="p-3"
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontFamily: "serif",
            }}
          >
            <div className="text-center mb-4 pb-3 border-bottom-1 surface-border">
              <span className="font-bold text-2xl">{newsletterName}</span>
            </div>
            <p className="text-sm line-height-3">
              Here is some example content from the newsletter to show context.
            </p>

            {/* The Ad Block */}
            <div
              style={{
                background: "#f8f9fa",
                padding: "1.5rem",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
                margin: "1.5rem 0",
              }}
            >
              <div className="text-xs text-500 uppercase font-bold mb-2">
                Sponsor: {content.sponsorName || "Your Company"}
              </div>
              <h3 className="text-xl font-bold m-0 mb-2 text-primary">
                {content.headline || "Your Headline Here"}
              </h3>
              <p className="m-0 mb-3 text-700 line-height-3">
                {content.body ||
                  "Your ad copy will appear here. As you type in the box on the left, this preview will update in real-time."}
              </p>
              <span className="text-primary font-bold cursor-pointer">
                Learn More &rarr;
              </span>
            </div>

            <p className="text-sm line-height-3">
              More content continues here...
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
