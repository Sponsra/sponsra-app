"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { SplitButton } from "primereact/splitbutton";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { approveBooking, rejectBooking } from "@/app/actions/bookings";
import {
  generateHTML,
  generateMarkdown,
  generatePlainText,
} from "@/utils/supabase/ad-export";
import type { NewsletterTheme } from "@/app/types/inventory";
import type { Booking } from "@/app/types/booking";
import EmptyState from "./EmptyState";
import classes from "./RequiresAttention.module.css";

interface RequiresAttentionProps {
  bookings: Booking[];
  theme: NewsletterTheme;
}

export default function RequiresAttention({
  bookings,
  theme,
}: RequiresAttentionProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const router = useRouter();
  const toast = useRef<Toast>(null);

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

  const getInventoryTier = (booking: Booking | null) => {
    if (!booking?.inventory_tiers) return null;
    return Array.isArray(booking.inventory_tiers)
      ? booking.inventory_tiers[0] || null
      : booking.inventory_tiers;
  };

  const handleApprove = async () => {
    if (!selectedBooking) return;
    setLoadingAction(true);
    await approveBooking(selectedBooking.id);
    setLoadingAction(false);
    setSelectedBooking(null);
    router.refresh();
  };

  const handleReject = async () => {
    if (!selectedBooking) return;
    if (!confirm("Are you sure you want to reject this ad?")) return;
    setLoadingAction(true);
    await rejectBooking(selectedBooking.id);
    setLoadingAction(false);
    setSelectedBooking(null);
    router.refresh();
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.current?.show({
        severity: "success",
        summary: "Copied!",
        detail: `${format} copied to clipboard. Ready to paste!`,
        life: 3000,
      });
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Copy failed",
        detail: "Unable to copy to clipboard. Please try again.",
        life: 3000,
      });
    }
  };

  const buildAdContent = (booking: Booking) => ({
    sponsorName: booking.sponsor_name || "Unknown Sponsor",
    headline: booking.ad_headline || "",
    body: booking.ad_body || "",
    link: booking.ad_link || "",
    imageUrl: getImageUrl(booking.ad_image_path),
  });

  const handleExportHtml = () => {
    if (!selectedBooking) return;
    const code = generateHTML(
      buildAdContent(selectedBooking),
      theme.primary_color
    );
    void copyToClipboard(code, "HTML");
  };

  const handleExportMarkdown = () => {
    if (!selectedBooking) return;
    const code = generateMarkdown(buildAdContent(selectedBooking));
    void copyToClipboard(code, "Markdown");
  };

  const handleExportPlainText = () => {
    if (!selectedBooking) return;
    const code = generatePlainText(buildAdContent(selectedBooking));
    void copyToClipboard(code, "Plain Text");
  };

  const getExportItems = () => [
    {
      label: "Copy Markdown",
      icon: "pi pi-file-edit",
      command: handleExportMarkdown,
    },
    {
      label: "Copy Plain Text",
      icon: "pi pi-align-left",
      command: handleExportPlainText,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className={classes.badgeWarning}>
            <i className="pi pi-exclamation-circle"></i>
            Needs Review
          </span>
        );
      case "draft":
        return (
          <span className={classes.badgeSecondary}>
            <i className="pi pi-clock"></i>
            Stale Draft
          </span>
        );
      default:
        return null;
    }
  };

  const renderDialogFooter = () => {
    if (!selectedBooking) return null;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          gap: "1rem",
        }}
      >
        <div>
          {selectedBooking.status === "approved" && (
            <SplitButton
              label="Export HTML"
              icon="pi pi-copy"
              onClick={handleExportHtml}
              model={getExportItems()}
              severity="secondary"
              size="small"
              outlined
            />
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          {selectedBooking.status === "paid" && (
            <>
              <Button
                label="Reject"
                severity="danger"
                icon="pi pi-times"
                outlined
                onClick={handleReject}
                loading={loadingAction}
                className="modern-button"
              />
              <Button
                label="Approve"
                severity="success"
                icon="pi pi-check"
                onClick={handleApprove}
                loading={loadingAction}
                className="modern-button"
              />
            </>
          )}
          <Button
            label="Close"
            icon="pi pi-times"
            text
            onClick={() => setSelectedBooking(null)}
          />
        </div>
      </div>
    );
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
            Requires Attention
          </h2>
          <p
            style={{
              margin: "0.25rem 0 0 0",
              fontSize: "0.875rem",
              color: "var(--color-text-body)",
            }}
          >
            Bookings that need your review or action
          </p>
        </div>
        <EmptyState
          icon="pi pi-check-circle"
          title="All caught up! 🎉"
          message="You have no bookings requiring attention right now."
        />
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
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
            Requires Attention
          </h2>
          <p
            style={{
              margin: "0.25rem 0 0 0",
              fontSize: "0.875rem",
              color: "var(--color-text-body)",
            }}
          >
            Bookings that need your review or action
          </p>
        </div>
        <div className={classes.list}>
          {bookings.map((booking) => (
            <div key={booking.id} className={classes.listItem}>
              <div className={classes.listItemContent}>
                <div className={classes.listItemMain}>
                  <div className={classes.listItemTitle}>
                    {booking.sponsor_name || "Unknown Sponsor"}
                  </div>
                  <div className={classes.listItemMeta}>
                    <span className={classes.listItemDate}>
                      {formatDate(booking.target_date)}
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
                <Button
                  label="Review"
                  icon="pi pi-eye"
                  size="small"
                  onClick={() => setSelectedBooking(booking)}
                  className="modern-button"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REVIEW DIALOG - Reused from BookingsTable */}
      <Dialog
        header={
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <i className="pi pi-file-edit text-primary"></i>
            <span>
              Review Ad: {selectedBooking?.sponsor_name || "Unknown Sponsor"}
            </span>
          </div>
        }
        visible={!!selectedBooking}
        style={{ 
          width: "90vw", 
          maxWidth: "50vw", 
          minWidth: "320px",
          maxHeight: "90vh"
        }}
        onHide={() => setSelectedBooking(null)}
        className="modern-dialog"
        footer={renderDialogFooter()}
        pt={{
          header: {
            style: {
              background: "var(--surface-0)",
              borderBottom: "1px solid var(--surface-border)",
              padding: "1.5rem",
            },
          },
          content: { style: { padding: "1.5rem" } },
        }}
      >
        {selectedBooking && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {selectedBooking.ad_image_path && (
              <div
                className="modern-card"
                style={{ padding: "1.25rem", background: "var(--surface-50)" }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--color-text-body)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "0.75rem",
                  }}
                >
                  Ad Creative
                </div>
                <div style={{ textAlign: "center" }}>
                  <img
                    src={getImageUrl(selectedBooking.ad_image_path)!}
                    alt="Ad Creative"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: "8px",
                      objectFit: "contain",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      background: "white",
                    }}
                  />
                  <div style={{ marginTop: "0.5rem", textAlign: "right" }}>
                    <a
                      href={getImageUrl(selectedBooking.ad_image_path)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--primary-color)",
                        fontSize: "0.875rem",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      View Full Size{" "}
                      <i className="pi pi-external-link text-xs ml-1"></i>
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div
              className="modern-card"
              style={{ padding: "1.25rem", background: "var(--surface-50)" }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--color-text-body)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Headline</span>
                {getInventoryTier(selectedBooking)?.specs_headline_limit && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color:
                        (selectedBooking.ad_headline?.length || 0) >
                        (getInventoryTier(selectedBooking)
                          ?.specs_headline_limit || Infinity)
                          ? "var(--red-500)"
                          : "var(--color-text-body)",
                    }}
                  >
                    {selectedBooking.ad_headline?.length || 0}/
                    {getInventoryTier(selectedBooking)?.specs_headline_limit}{" "}
                    chars
                    {(selectedBooking.ad_headline?.length || 0) >
                      (getInventoryTier(selectedBooking)
                        ?.specs_headline_limit || Infinity) && (
                      <i className="pi pi-exclamation-triangle ml-1" />
                    )}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: "var(--color-text-heading)",
                  lineHeight: "1.5",
                }}
              >
                {selectedBooking.ad_headline || "No headline provided"}
              </div>
              {(selectedBooking.ad_headline?.length || 0) >
                (getInventoryTier(selectedBooking)?.specs_headline_limit ||
                  Infinity) && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.5rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    borderRadius: "4px",
                    color: "var(--red-600)",
                    fontSize: "0.875rem",
                  }}
                >
                  <i className="pi pi-exclamation-triangle mr-1" />
                  Headline exceeds limit by{" "}
                  {(selectedBooking.ad_headline?.length || 0) -
                    (getInventoryTier(selectedBooking)?.specs_headline_limit ||
                      0)}{" "}
                  characters
                </div>
              )}
            </div>

            <div
              className="modern-card"
              style={{ padding: "1.25rem", background: "var(--surface-50)" }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--color-text-body)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Body Copy</span>
                {getInventoryTier(selectedBooking)?.specs_body_limit && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color:
                        (selectedBooking.ad_body?.length || 0) >
                        (getInventoryTier(selectedBooking)?.specs_body_limit ||
                          Infinity)
                          ? "var(--red-500)"
                          : "var(--color-text-body)",
                    }}
                  >
                    {selectedBooking.ad_body?.length || 0}/
                    {getInventoryTier(selectedBooking)?.specs_body_limit} chars
                    {(selectedBooking.ad_body?.length || 0) >
                      (getInventoryTier(selectedBooking)?.specs_body_limit ||
                        Infinity) && (
                      <i className="pi pi-exclamation-triangle ml-1" />
                    )}
                  </span>
                )}
              </div>
              <div
                style={{
                  lineHeight: "1.75",
                  color: "var(--color-text-heading)",
                  whiteSpace: "pre-wrap",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {selectedBooking.ad_body || "No body text provided"}
              </div>
              {(selectedBooking.ad_body?.length || 0) >
                (getInventoryTier(selectedBooking)?.specs_body_limit ||
                  Infinity) && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.5rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    borderRadius: "4px",
                    color: "var(--red-600)",
                    fontSize: "0.875rem",
                  }}
                >
                  <i className="pi pi-exclamation-triangle mr-1" />
                  Body text exceeds limit by{" "}
                  {(selectedBooking.ad_body?.length || 0) -
                    (getInventoryTier(selectedBooking)?.specs_body_limit ||
                      0)}{" "}
                  characters
                </div>
              )}
            </div>

            <div
              className="modern-card"
              style={{ padding: "1.25rem", background: "var(--surface-50)" }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--color-text-body)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "0.75rem",
                }}
              >
                Link
              </div>
              {selectedBooking.ad_link ? (
                <a
                  href={selectedBooking.ad_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--primary-color)",
                    textDecoration: "none",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {selectedBooking.ad_link}
                  <i className="pi pi-external-link text-xs"></i>
                </a>
              ) : (
                <span style={{ color: "var(--color-text-body)" }}>
                  No link provided
                </span>
              )}
            </div>

            {selectedBooking.status === "approved" && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background:
                    "linear-gradient(135deg, rgba(220, 252, 231, 0.8) 0%, rgba(187, 247, 208, 0.8) 100%)",
                  borderRadius: "8px",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  textAlign: "center",
                  fontWeight: 600,
                  color: "#15803d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <i className="pi pi-check-circle"></i>
                <span>This ad is approved and scheduled</span>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
