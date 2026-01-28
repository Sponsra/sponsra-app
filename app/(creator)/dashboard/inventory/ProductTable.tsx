"use client";

import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Product, PRODUCT_TYPE_LABELS, FREQUENCY_LABELS } from "@/app/types/product";

interface ProductTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export default function ProductTable({
    products,
    onEdit,
    onDelete,
}: ProductTableProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(value / 100);
    };

    const priceBody = (rowData: Product) => formatCurrency(rowData.price);

    const typeBody = (rowData: Product) => {
        const label = PRODUCT_TYPE_LABELS[rowData.product_type] || rowData.product_type;
        let iconClass = "pi pi-star";
        if (rowData.product_type === "secondary") iconClass = "pi pi-align-left";
        if (rowData.product_type === "classified") iconClass = "pi pi-link";

        return (
            <div className="flex align-items-center">
                <i className={`${iconClass} mr-2 text-primary`} />
                <span>{label}</span>
            </div>
        );
    };

    const frequencyBody = (rowData: Product) => {
        const label = FREQUENCY_LABELS[rowData.frequency] || rowData.frequency;
        return <span style={{ textTransform: "capitalize" }}>{label}</span>;
    };

    const statusBody = (rowData: Product) => (
        <Tag
            value={rowData.is_active ? "Active" : "Inactive"}
            severity={rowData.is_active ? "success" : "danger"}
        />
    );

    const assetsBody = (rowData: Product) => {
        const count = rowData.asset_requirements?.length || 0;
        return (
            <span className="text-muted">
                {count} field{count !== 1 ? "s" : ""}
            </span>
        );
    };

    const actionBody = (rowData: Product) => (
        <div className="flex gap-2 justify-content-end">
            <Button
                icon="pi pi-pencil"
                rounded
                text
                severity="info"
                onClick={() => onEdit(rowData)}
                tooltip="Edit product"
            />
            <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                onClick={() => onDelete(rowData)}
                tooltip="Archive product"
            />
        </div>
    );

    return (
        <DataTable
            value={products}
            dataKey="id"
            emptyMessage="No products found. Create one to get started!"
            stripedRows
        >
            <Column field="name" header="Name" sortable style={{ width: "25%" }} />
            <Column
                field="product_type"
                header="Type"
                body={typeBody}
                sortable
                style={{ width: "15%" }}
            />
            <Column
                field="frequency"
                header="Frequency"
                body={frequencyBody}
                sortable
                style={{ width: "12%" }}
            />
            <Column
                field="price"
                header="Price"
                body={priceBody}
                sortable
                style={{ width: "12%" }}
            />
            <Column
                header="Fields"
                body={assetsBody}
                style={{ width: "10%" }}
            />
            <Column
                field="is_active"
                header="Status"
                body={statusBody}
                sortable
                style={{ width: "10%" }}
            />
            <Column body={actionBody} exportable={false} style={{ width: "12%" }} />
        </DataTable>
    );
}
