"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveBooking, rejectBooking } from "@/app/actions/bookings";

export default function BookingsTable({ bookings }: { bookings: any[] }) {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const router = useRouter();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value / 100);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${Number(month)}/${Number(day)}/${year}`;
  };

  // Helper to build the image URL
  const getImageUrl = (path: string) => {
    if (!path) return null;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ad-creatives/${path}`;
  };

  // COLUMN 1: PAYMENT STATUS
  const paymentStatusTemplate = (rowData: any) => {
    const isPaid = ["paid", "approved", "rejected"].includes(rowData.status);
    if (isPaid) {
      return <Tag value="PAID" severity="success" icon="pi pi-dollar" />;
    }
    return <Tag value="PENDING" severity="secondary" />;
  };

  // COLUMN 2: REVIEW STATUS
  const reviewStatusTemplate = (rowData: any) => {
    switch (rowData.status) {
      case "paid":
        return (
          <Tag
            value="NEEDS REVIEW"
            severity="warning"
            icon="pi pi-exclamation-circle"
          />
        );
      case "approved":
        return <Tag value="APPROVED" severity="success" icon="pi pi-check" />;
      case "rejected":
        return <Tag value="REJECTED" severity="danger" icon="pi pi-times" />;
      default:
        return <span className="text-500">-</span>;
    }
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

  return (
    <>
      <DataTable
        value={bookings}
        sortField="target_date"
        sortOrder={1}
        paginator
        rows={10}
        className="modern-table"
        selectionMode="single"
        emptyMessage="No bookings found"
      >
        <Column
          field="target_date"
          header="Date"
          sortable
          body={(data) => (
            <div style={{ fontWeight: 600, color: "var(--text-color)" }}>
              {formatDate(data.target_date)}
            </div>
          )}
          style={{ minWidth: "120px" }}
        />
        <Column
          field="sponsor_name"
          header="Sponsor"
          body={(data) => (
            <div
              style={{
                fontWeight: 600,
                fontSize: "0.9375rem",
                color: "var(--text-color)",
              }}
            >
              {data.sponsor_name || "Unknown"}
            </div>
          )}
          style={{ minWidth: "150px" }}
        />
        <Column
          header="Payment"
          body={paymentStatusTemplate}
          style={{ minWidth: "120px" }}
        />
        <Column
          header="Review Status"
          body={reviewStatusTemplate}
          style={{ minWidth: "140px" }}
        />
        <Column
          field="inventory_tiers.price"
          header="Value"
          body={(data) => (
            <div
              style={{
                fontWeight: 700,
                color: "var(--primary-color)",
                fontSize: "0.9375rem",
              }}
            >
              {formatCurrency(data.inventory_tiers?.price || 0)}
            </div>
          )}
          style={{ minWidth: "100px" }}
        />
        <Column
          body={(rowData) => (
            <Button
              icon="pi pi-eye"
              rounded
              text
              aria-label="View Details"
              onClick={() => setSelectedBooking(rowData)}
              className="modern-button"
              style={{
                color: "var(--primary-color)",
                padding: "0.5rem",
              }}
            />
          )}
          header=""
          style={{ width: "80px", textAlign: "center" }}
        />
      </DataTable>

      {/* REVIEW DIALOG */}
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
        style={{ width: "50vw", minWidth: "400px" }}
        onHide={() => setSelectedBooking(null)}
        className="modern-dialog"
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
            {/* --- NEW: IMAGE PREVIEW BLOCK --- */}
            {selectedBooking.ad_image_path && (
              <div
                className="modern-card"
                style={{ padding: "1.25rem", background: "var(--surface-50)" }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--text-color-secondary)",
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
            {/* --------------------------------- */}

            <div
              className="modern-card"
              style={{ padding: "1.25rem", background: "var(--surface-50)" }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--text-color-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "0.75rem",
                }}
              >
                Headline
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: "var(--text-color)",
                  lineHeight: "1.5",
                }}
              >
                {selectedBooking.ad_headline || "No headline provided"}
              </div>
            </div>

            <div
              className="modern-card"
              style={{ padding: "1.25rem", background: "var(--surface-50)" }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--text-color-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "0.75rem",
                }}
              >
                Body Copy
              </div>
              <div
                style={{
                  lineHeight: "1.75",
                  color: "var(--text-color)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedBooking.ad_body || "No body text provided"}
              </div>
            </div>

            <div
              className="modern-card"
              style={{ padding: "1.25rem", background: "var(--surface-50)" }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--text-color-secondary)",
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
                <span style={{ color: "var(--text-color-secondary)" }}>
                  No link provided
                </span>
              )}
            </div>

            {/* Action Buttons */}
            {selectedBooking.status === "paid" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "1rem",
                  paddingTop: "1.25rem",
                  borderTop: "1px solid var(--surface-border)",
                }}
              >
                <Button
                  label="Reject"
                  severity="danger"
                  icon="pi pi-times"
                  outlined
                  loading={loadingAction}
                  onClick={handleReject}
                  className="modern-button"
                />
                <Button
                  label="Approve & Schedule"
                  severity="success"
                  icon="pi pi-check"
                  loading={loadingAction}
                  onClick={handleApprove}
                  className="modern-button"
                />
              </div>
            )}

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
