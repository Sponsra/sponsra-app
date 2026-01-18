"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Badge } from "primereact/badge";

interface InventoryTier {
  id: string;
  name: string;
  type: string;
  price: number;
  is_active: boolean;
}

interface InventoryTableProps {
  tiers: InventoryTier[];
}

export default function InventoryTable({ tiers }: InventoryTableProps) {
  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value / 100);
  };

  const typeBodyTemplate = (rowData: InventoryTier) => {
    return (
      <Badge
        value={rowData.type.toUpperCase()}
        severity={rowData.type === "sponsor" ? "info" : "warning"}
      />
    );
  };

  return (
    <DataTable
      value={tiers}
      className="modern-table"
      tableStyle={{ minWidth: "50rem" }}
    >
      <Column
        field="name"
        header="Product Name"
        style={{ fontWeight: 600 }}
      ></Column>
      <Column field="type" header="Type" body={typeBodyTemplate}></Column>
      <Column
        field="price"
        header="Price"
        body={(data: InventoryTier) => (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 300,
              color: "var(--primary-color)",
            }}
          >
            {formatCurrency(data.price)}
          </div>
        )}
      ></Column>
      <Column
        field="is_active"
        header="Status"
        body={(data: InventoryTier) =>
          data.is_active ? (
            <i className="pi pi-check-circle text-green-500"></i>
          ) : (
            <i className="pi pi-times-circle text-red-500"></i>
          )
        }
      ></Column>
    </DataTable>
  );
}
