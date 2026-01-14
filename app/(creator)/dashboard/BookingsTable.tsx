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

  // COLUMN 1: PAYMENT STATUS
  const paymentStatusTemplate = (rowData: any) => {
    // If it is paid, approved, or rejected, the money was collected.
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
        // This is the specific state where money is in, but work is not done
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
        // For unpaid/draft items, review status is N/A
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
        rows={5}
        // Important: Pass row data to state even if column is hidden
        selectionMode="single"
      >
        <Column
          field="target_date"
          header="Date"
          sortable
          body={(data) => formatDate(data.target_date)}
        />
        <Column
          field="sponsor_name"
          header="Sponsor"
          body={(data) => (
            <span className="font-bold">{data.sponsor_name || "Unknown"}</span>
          )}
        />

        {/* NEW: Split Columns */}
        <Column header="Payment" body={paymentStatusTemplate} />
        <Column header="Review Status" body={reviewStatusTemplate} />

        <Column
          field="inventory_tiers.price"
          header="Value"
          body={(data) => formatCurrency(data.inventory_tiers?.price || 0)}
        />

        <Column
          body={(rowData) => (
            <Button
              icon="pi pi-search"
              rounded
              text
              aria-label="View Details"
              onClick={() => setSelectedBooking(rowData)}
            />
          )}
          header="Action"
          style={{ width: "10%" }}
        />
      </DataTable>

      {/* REVIEW DIALOG */}
      <Dialog
        header={`Review Ad: ${
          selectedBooking?.sponsor_name || "Unknown Sponsor"
        }`}
        visible={!!selectedBooking}
        style={{ width: "50vw", minWidth: "350px" }}
        onHide={() => setSelectedBooking(null)}
      >
        {/* TEMPORARY DEBUGGER: Delete this after it works */}
        <div
          className="bg-gray-900 text-green-400 p-3 text-xs font-mono overflow-auto mb-4"
          style={{ maxHeight: "100px" }}
        >
          {JSON.stringify(selectedBooking, null, 2)}
        </div>
        {selectedBooking && (
          <div className="flex flex-column gap-3">
            {/* Debug check: If this shows empty, the data isn't reaching the client */}
            {/* <small>{JSON.stringify(selectedBooking)}</small> */}

            <div className="surface-100 p-3 border-round">
              <div className="text-xs text-500 uppercase font-bold mb-1">
                Headline
              </div>
              <div className="font-bold text-xl">
                {selectedBooking.ad_headline || "No headline provided"}
              </div>
            </div>

            <div className="surface-100 p-3 border-round">
              <div className="text-xs text-500 uppercase font-bold mb-1">
                Body Copy
              </div>
              <div className="line-height-3" style={{ whiteSpace: "pre-wrap" }}>
                {selectedBooking.ad_body || "No body text provided"}
              </div>
            </div>

            <div className="surface-100 p-3 border-round">
              <div className="text-xs text-500 uppercase font-bold mb-1">
                Link
              </div>
              {selectedBooking.ad_link ? (
                <a
                  href={selectedBooking.ad_link}
                  target="_blank"
                  className="text-primary hover:underline font-bold"
                >
                  {selectedBooking.ad_link}
                  <i className="pi pi-external-link ml-2 text-xs"></i>
                </a>
              ) : (
                <span>No link provided</span>
              )}
            </div>

            {/* Action Buttons */}
            {selectedBooking.status === "paid" && (
              <div className="flex justify-content-end gap-2 mt-4 pt-3 border-top-1 surface-border">
                <Button
                  label="Reject"
                  severity="danger"
                  icon="pi pi-times"
                  outlined
                  loading={loadingAction}
                  onClick={handleReject}
                />
                <Button
                  label="Approve & Schedule"
                  severity="success"
                  icon="pi pi-check"
                  loading={loadingAction}
                  onClick={handleApprove}
                />
              </div>
            )}

            {selectedBooking.status === "approved" && (
              <div className="mt-4 p-2 bg-green-100 text-green-700 border-round text-center font-bold">
                <i className="pi pi-check-circle mr-2"></i> This ad is approved.
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
