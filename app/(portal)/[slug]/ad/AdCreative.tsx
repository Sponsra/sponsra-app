"use client";

import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { saveAdCreative } from "@/app/actions/bookings"; // You need to update this action next!
import ImageUpload from "./ImageUpload"; // <--- Import new component

interface AdCreativeProps {
  newsletterName: string;
  bookingId: string;
}

export default function AdCreative({
  newsletterName,
  bookingId,
}: AdCreativeProps) {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [imagePath, setImagePath] = useState<string | null>(null); // <--- New State
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    // Call server action with ALL data including imagePath
    const result = await saveAdCreative(bookingId, {
      headline,
      body,
      link,
      sponsorName,
      imagePath, // <--- Pass this
    });

    if (result.success && result.url) {
      window.location.href = result.url; // Redirect to Stripe
    } else {
      alert("Error: " + result.error);
      setLoading(false);
    }
  };

  return (
    <div className="grid">
      {/* LEFT COLUMN: Input Form */}
      <div className="col-12 md:col-6">
        <Card title="Ad Content">
          <div className="flex flex-column gap-4">
            <div className="flex flex-column gap-2">
              <label htmlFor="sponsor" className="font-bold">
                Sponsor Name
              </label>
              <InputText
                id="sponsor"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div className="flex flex-column gap-2">
              <label htmlFor="headline" className="font-bold">
                Headline (max 60)
              </label>
              <InputText
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={60}
                placeholder="Catchy title"
              />
            </div>

            <div className="flex flex-column gap-2">
              <label htmlFor="body" className="font-bold">
                Body Text (max 280)
              </label>
              <InputTextarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                maxLength={280}
                placeholder="Your main message..."
              />
            </div>

            <div className="flex flex-column gap-2">
              <label htmlFor="link" className="font-bold">
                Link URL
              </label>
              <InputText
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* NEW: Image Upload Section */}
            <ImageUpload
              bookingId={bookingId}
              onUploadComplete={(path) => setImagePath(path)}
            />

            <Button
              label="Proceed to Payment"
              icon="pi pi-credit-card"
              onClick={handlePayment}
              loading={loading}
            />
          </div>
        </Card>
      </div>

      {/* RIGHT COLUMN: Live Preview */}
      <div className="col-12 md:col-6">
        <div className="sticky top-0" style={{ top: "2rem" }}>
          <h3 className="text-xl font-bold mb-3 text-center">Live Preview</h3>
          <div className="surface-card p-4 shadow-2 border-round">
            <div className="border-bottom-1 surface-border pb-3 mb-3">
              <span className="text-sm text-500 uppercase font-bold">
                Sponsor
              </span>
            </div>

            {/* Image Preview */}
            {imagePath ? (
              // Use a public URL helper or direct bucket URL
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ad-creatives/${imagePath}`}
                alt="Ad Preview"
                className="w-full mb-3 border-round"
                style={{ maxHeight: "200px", objectFit: "cover" }}
              />
            ) : (
              <div className="w-full h-10rem surface-100 mb-3 border-round flex align-items-center justify-content-center text-500">
                No Image
              </div>
            )}

            <h4 className="text-xl font-bold mb-2 text-900">
              {headline || "Your Headline Here"}
            </h4>
            <p
              className="line-height-3 text-700 mb-3"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {body ||
                "Your ad body text will appear here. It allows for up to 280 characters of detailed copy."}
            </p>
            <div className="text-primary font-bold hover:underline cursor-pointer">
              {link || "https://your-website.com"}
            </div>

            <div className="mt-3 text-sm text-500 text-right">
              Sponsored by {sponsorName || "..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
