"use client";

import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { InventoryTier } from "@/app/types/inventory";

interface InventoryTableProps {
  tiers: InventoryTier[];
  onEdit: (tier: InventoryTier) => void;
  onDelete: (tier: InventoryTier) => void;
}

export default function InventoryTable({
  tiers,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value / 100);
  };

  const priceBody = (rowData: InventoryTier) => formatCurrency(rowData.price);

  const statusBody = (rowData: InventoryTier) => (
    <Tag
      value={rowData.is_active ? "Active" : "Inactive"}
      severity={rowData.is_active ? "success" : "danger"}
    />
  );

  const actionBody = (rowData: InventoryTier) => (
    <div className="flex gap-2 justify-content-end">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        onClick={() => onEdit(rowData)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        onClick={() => onDelete(rowData)}
      />
    </div>
  );

  return (
    <DataTable
      value={tiers}
      dataKey="id"
      emptyMessage="No tiers found. Create one to get started!"
    >
      <Column field="name" header="Name" sortable style={{ width: "30%" }} />
      <Column field="type" header="Type" sortable style={{ width: "15%" }} />
      <Column
        field="price"
        header="Price"
        body={priceBody}
        sortable
        style={{ width: "15%" }}
      />
      <Column
        field="is_active"
        header="Status"
        body={statusBody}
        sortable
        style={{ width: "15%" }}
      />
      <Column body={actionBody} exportable={false} style={{ width: "15%" }} />
    </DataTable>
  );
}
