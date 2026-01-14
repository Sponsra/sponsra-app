"use client";

import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { saveAdCreative } from "@/app/actions"; // Import action

interface AdContent {
  headline: string;
  body: string;
  link: string;
}

// Add bookingId to props
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
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const maxHeadline = 60;
  const maxBody = 280;

  const handleSave = async () => {
    setLoading(true);
    const result = await saveAdCreative(bookingId, content);
    if (result.success) {
      setSubmitted(true);
    } else {
      alert("Error saving ad");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="text-center p-5">
        <Card className="shadow-4">
          <i className="pi pi-check-circle text-green-500 text-6xl mb-4"></i>
          <h1 className="text-3xl font-bold">Request Received!</h1>
          <p className="text-xl">The creator will review your ad shortly.</p>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="grid mt-4"
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
    >
      {/* LEFT: Input Form */}
      <div>
        <Card title="Step 3: Ad Content">
          <div className="flex flex-column gap-3">
            {/* ... Inputs remain the same ... */}

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
              />
            </div>

            <div className="flex flex-column gap-2">
              <label className="font-bold">Ad Copy</label>
              <InputTextarea
                value={content.body}
                onChange={(e) =>
                  setContent({ ...content, body: e.target.value })
                }
                rows={5}
                className={content.body.length > maxBody ? "p-invalid" : ""}
              />
            </div>

            <div className="flex flex-column gap-2">
              <label className="font-bold">Destination URL</label>
              <InputText
                value={content.link}
                onChange={(e) =>
                  setContent({ ...content, link: e.target.value })
                }
              />
            </div>

            <Button
              label={loading ? "Saving..." : "Submit for Approval"}
              icon="pi pi-send"
              className="mt-2"
              loading={loading}
              onClick={handleSave} // <--- Wire the button
            />
          </div>
        </Card>
      </div>

      {/* RIGHT: Preview (Keep your existing preview code here) */}
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
            <p>Standard newsletter content...</p>
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
                Sponsor
              </div>
              <h3 className="text-xl font-bold m-0 mb-2 text-primary">
                {content.headline || "Headline"}
              </h3>
              <p className="m-0 mb-3">{content.body || "Ad text..."}</p>
              <span className="text-primary font-bold">Learn More &rarr;</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
