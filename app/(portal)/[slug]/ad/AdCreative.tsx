// app/(portal)/[slug]/ad/AdCreative.tsx
"use client";

import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { saveAdCreative } from "@/app/actions/bookings";
import { InventoryTierPublic, NewsletterTheme } from "@/app/types/inventory"; // Updated type
import ImageUpload from "./ImageUpload";
import NewsletterMockup from "@/app/components/NewsletterMockup";

interface AdCreativeProps {
  newsletterName: string;
  bookingId: string;
  tier: InventoryTierPublic; // <--- NEW PROP: We need the rules!
  theme: NewsletterTheme;
  initialSponsorName?: string;
}

export default function AdCreative({
  newsletterName,
  bookingId,
  tier,
  theme,
  initialSponsorName = "",
}: AdCreativeProps) {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [sponsorName, setSponsorName] = useState(initialSponsorName);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSponsorName(initialSponsorName);
  }, [initialSponsorName]);

  const handlePayment = async () => {
    // Basic validation before sending
    if (!headline || !body || !link || !sponsorName) {
      alert("Please fill in all fields.");
      return;
    }

    // Validate character limits
    const errors: string[] = [];

    if (headline.length > tier.specs_headline_limit) {
      errors.push(
        `Headline exceeds limit: ${headline.length}/${tier.specs_headline_limit} characters`
      );
    }

    if (body.length > tier.specs_body_limit) {
      errors.push(
        `Body text exceeds limit: ${body.length}/${tier.specs_body_limit} characters`
      );
    }

    // Validate image requirements
    if (tier.specs_image_ratio !== "no_image" && !imagePath) {
      errors.push("An image is required for this ad type.");
    }

    if (errors.length > 0) {
      alert("Please fix the following errors:\n\n" + errors.join("\n"));
      return;
    }

    setLoading(true);

    const result = await saveAdCreative(bookingId, {
      headline,
      body,
      link,
      sponsorName,
      imagePath,
    });

    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      alert("Error: " + result.error);
      setLoading(false);
    }
  };

  // Helper to check aspect ratio label
  const getImageRatioLabel = (ratio: string) => {
    switch (ratio) {
      case "1:1":
        return "Square (1:1)";
      case "1.91:1":
        return "Landscape (1.91:1)";
      default:
        return "Any Size";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        position: "relative",
        padding: "3rem 1rem",
        overflow: "hidden",
      }}
    >
      {/* Subtle glowing orbs in background */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(147, 197, 253, 0.15) 0%, rgba(147, 197, 253, 0) 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "-10%",
          width: "700px",
          height: "700px",
          background:
            "radial-gradient(circle, rgba(165, 243, 252, 0.12) 0%, rgba(165, 243, 252, 0) 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "30%",
          width: "550px",
          height: "550px",
          background:
            "radial-gradient(circle, rgba(186, 230, 253, 0.18) 0%, rgba(186, 230, 253, 0) 70%)",
          filter: "blur(45px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "10%",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(103, 232, 249, 0.1) 0%, rgba(103, 232, 249, 0) 70%)",
          filter: "blur(35px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Content wrapper with relative positioning */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "2rem",
            maxWidth: "1400px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* LEFT COLUMN: Input Form */}
          <div
            style={{
              flex: "1 1 450px",
              minWidth: "320px",
            }}
          >
            <Card
              style={{
                border: "none",
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                borderRadius: "16px",
                background: "#ffffff",
              }}
              pt={{
                body: { style: { padding: "2rem" } },
                title: {
                  style: {
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    paddingBottom: "1.25rem",
                    borderBottom: "2px solid var(--surface-border)",
                    color: "#0f172a",
                  },
                },
              }}
              title="Create Your Ad"
            >
              <p
                className="text-600 mb-4"
                style={{ fontSize: "0.9375rem", marginBottom: "1.5rem" }}
              >
                Customizing for:{" "}
                <span className="font-bold text-primary">{tier.name}</span>
              </p>

              <div className="flex flex-column" style={{ gap: "1.75rem" }}>
                <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                  <label
                    htmlFor="sponsor"
                    className="font-semibold"
                    style={{ fontSize: "0.875rem", color: "var(--text-color)" }}
                  >
                    Sponsor Name
                  </label>
                  <InputText
                    id="sponsor"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    style={{ padding: "0.75rem" }}
                  />
                </div>

                <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                  <div
                    className="flex justify-content-between align-items-center"
                    style={{ marginBottom: "0.25rem" }}
                  >
                    <label
                      htmlFor="headline"
                      className="font-semibold"
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-color)",
                      }}
                    >
                      Headline
                    </label>
                    <small
                      className={
                        headline.length >= tier.specs_headline_limit
                          ? "text-red-500 font-semibold"
                          : "text-500"
                      }
                      style={{ fontSize: "0.75rem" }}
                    >
                      {headline.length}/{tier.specs_headline_limit}
                    </small>
                  </div>
                  <InputText
                    id="headline"
                    value={headline}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= tier.specs_headline_limit) {
                        setHeadline(value);
                      }
                    }}
                    placeholder="Catchy title"
                    className={
                      headline.length > tier.specs_headline_limit
                        ? "p-invalid"
                        : ""
                    }
                    style={{ padding: "0.75rem" }}
                  />
                  {headline.length > tier.specs_headline_limit && (
                    <small
                      className="text-red-500"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Headline exceeds limit by{" "}
                      {headline.length - tier.specs_headline_limit} characters
                    </small>
                  )}
                </div>

                <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                  <div
                    className="flex justify-content-between align-items-center"
                    style={{ marginBottom: "0.25rem" }}
                  >
                    <label
                      htmlFor="body"
                      className="font-semibold"
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-color)",
                      }}
                    >
                      Body Text
                    </label>
                    <small
                      className={
                        body.length >= tier.specs_body_limit
                          ? "text-red-500 font-semibold"
                          : "text-500"
                      }
                      style={{ fontSize: "0.75rem" }}
                    >
                      {body.length}/{tier.specs_body_limit}
                    </small>
                  </div>
                  <InputTextarea
                    id="body"
                    value={body}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= tier.specs_body_limit) {
                        setBody(value);
                      }
                    }}
                    rows={5}
                    placeholder="Your main message..."
                    className={`w-full ${
                      body.length > tier.specs_body_limit ? "p-invalid" : ""
                    }`}
                    style={{ padding: "0.75rem", resize: "vertical" }}
                  />
                  {body.length > tier.specs_body_limit && (
                    <small
                      className="text-red-500"
                      style={{ fontSize: "0.75rem" }}
                    >
                      Body text exceeds limit by{" "}
                      {body.length - tier.specs_body_limit} characters
                    </small>
                  )}
                </div>

                <div className="flex flex-column" style={{ gap: "0.5rem" }}>
                  <label
                    htmlFor="link"
                    className="font-semibold"
                    style={{ fontSize: "0.875rem", color: "var(--text-color)" }}
                  >
                    Link URL
                  </label>
                  <InputText
                    id="link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://..."
                    style={{ padding: "0.75rem" }}
                  />
                </div>

                {/* DYNAMIC IMAGE UPLOAD SECTION */}
                {tier.specs_image_ratio !== "no_image" ? (
                  <div
                    className="flex flex-column"
                    style={{
                      gap: "0.75rem",
                      padding: "1.25rem",
                      background: "var(--surface-50)",
                      borderRadius: "8px",
                      border: "1px solid var(--surface-border)",
                    }}
                  >
                    <div
                      className="font-semibold"
                      style={{ fontSize: "0.875rem" }}
                    >
                      Ad Image
                    </div>
                    <div
                      className="text-500"
                      style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}
                    >
                      Required Ratio:{" "}
                      {getImageRatioLabel(tier.specs_image_ratio)}
                    </div>
                    <ImageUpload
                      bookingId={bookingId}
                      onUploadComplete={(path) => setImagePath(path)}
                      requiredAspectRatio={tier.specs_image_ratio}
                    />
                  </div>
                ) : (
                  <Message
                    severity="info"
                    text="This tier is text-only. No image required."
                    style={{ margin: 0 }}
                  />
                )}

                <Button
                  label="Proceed to Payment"
                  icon="pi pi-credit-card"
                  onClick={handlePayment}
                  loading={loading}
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

          {/* RIGHT COLUMN: Browser-Style Preview */}
          <div
            style={{
              flex: "1 1 550px",
              minWidth: "320px",
            }}
          >
            <div style={{ position: "sticky", top: "2rem" }}>
              {/* Preview Label */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: "0.5rem",
                  }}
                >
                  Live Preview
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#475569",
                    margin: 0,
                  }}
                >
                  See how your ad will look in the newsletter
                </p>
              </div>

              {/* Browser Window Container */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  boxShadow:
                    "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                  overflow: "hidden",
                }}
              >
                {/* Browser Chrome/Header */}
                <div
                  style={{
                    background:
                      "linear-gradient(to bottom, #f5f5f7 0%, #e8e8ea 100%)",
                    borderBottom: "1px solid #d1d1d6",
                    padding: "0.875rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  {/* Traffic Lights */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#ff5f57",
                        border: "0.5px solid #e0443e",
                        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3)",
                      }}
                    />
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#ffbd2e",
                        border: "0.5px solid #dea123",
                        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3)",
                      }}
                    />
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: "#28ca42",
                        border: "0.5px solid #1aab29",
                        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3)",
                      }}
                    />
                  </div>

                  {/* Address Bar */}
                  <div
                    style={{
                      flex: 1,
                      background: "white",
                      borderRadius: "6px",
                      padding: "0.5rem 0.875rem",
                      fontSize: "0.8125rem",
                      color: "#666",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      border: "1px solid #d1d1d6",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    <i
                      className="pi pi-lock"
                      style={{ fontSize: "0.75rem", color: "#34c759" }}
                    />
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}
                    >
                      {newsletterName.toLowerCase().replace(/\s+/g, "")}
                      .com/newsletter
                    </span>
                    <i
                      className="pi pi-refresh"
                      style={{ fontSize: "0.75rem", color: "#999" }}
                    />
                  </div>
                </div>

                {/* Newsletter Content - Scrollable */}
                <div
                  style={{
                    background: "#ffffff",
                    maxHeight: "600px",
                    overflowY: "auto",
                    padding: "0",
                  }}
                >
                  <NewsletterMockup
                    theme={theme}
                    newsletterName={newsletterName}
                    content={{
                      sponsorName: sponsorName || "Your Sponsor",
                      headline: headline || "Your Headline Here",
                      body: body || "Your ad body text will appear here...",
                      link: link,
                      imagePath:
                        tier.specs_image_ratio !== "no_image"
                          ? imagePath
                          : null,
                    }}
                  />
                </div>
              </div>

              {/* Helper Text */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "1.25rem",
                  fontSize: "0.875rem",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <i className="pi pi-eye" style={{ fontSize: "0.875rem" }} />
                <span>Updates in real-time as you type</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
