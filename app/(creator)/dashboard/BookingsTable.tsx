"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";

export default function BookingsTable({ bookings }: { bookings: any[] }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value / 100);
  };

  // FIX: Parse string manually to avoid Timezone Shift
  // "2026-01-17" -> "1/17/2026"
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    // Note: We don't use new Date() here to avoid the timezone conversion entirely
    return `${Number(month)}/${Number(day)}/${year}`;
  };

  const statusTemplate = (rowData: any) => {
    const map: any = {
      draft: "warning",
      pending_payment: "info",
      paid: "success",
      approved: "success",
      rejected: "danger",
    };
    return (
      <Tag
        value={rowData.status.replace("_", " ").toUpperCase()}
        severity={map[rowData.status]}
      />
    );
  };

  return (
    <DataTable
      value={bookings}
      sortField="target_date"
      sortOrder={1}
      paginator
      rows={5}
    >
      <Column
        field="target_date"
        header="Date"
        sortable
        // Use the new safe formatter
        body={(data) => formatDate(data.target_date)}
      />
      <Column field="inventory_tiers.name" header="Product" />
      <Column
        field="ad_headline"
        header="Ad Headline"
        body={(data) => (
          <span className="text-sm">{data.ad_headline || "(No Content)"}</span>
        )}
      />
      <Column
        field="inventory_tiers.price"
        header="Value"
        body={(data) => formatCurrency(data.inventory_tiers?.price || 0)}
      />
      <Column field="status" header="Status" body={statusTemplate} />
    </DataTable>
  );
}
