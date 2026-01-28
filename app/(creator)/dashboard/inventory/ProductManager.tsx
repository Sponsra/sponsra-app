"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { Product } from "@/app/types/product";
import { deleteProduct } from "@/app/actions/products";
import ProductTable from "./ProductTable";
import sharedStyles from "../settings/shared.module.css";

interface ProductManagerProps {
    initialProducts: Product[];
    newsletterId: string;
}

export default function ProductManager({
    initialProducts,
    newsletterId,
}: ProductManagerProps) {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Partial<Product>>({});
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);

    // --- Actions ---

    const openNew = () => {
        router.push("/dashboard/products/create");
    };

    const openEdit = (product: Product) => {
        router.push(`/dashboard/products/${product.id}/edit`);
    };

    const openDelete = (product: Product) => {
        setSelectedProduct({
            id: product.id,
            name: product.name,
        });
        setDeleteDialog(true);
    };

    const handleDelete = async () => {
        if (!selectedProduct.id) return;
        setLoading(true);

        try {
            const result = await deleteProduct(selectedProduct.id);

            if (result.success) {
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Product archived",
                });
                setDeleteDialog(false);
                // Remove from local state
                setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
            } else {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: result.error,
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete product",
            });
        } finally {
            setLoading(false);
        }
    };

    // --- Render ---

    const leftToolbar = (
        <div className="flex flex-wrap gap-2">
            <Button
                label="New Product"
                icon="pi pi-plus"
                onClick={openNew}
                className="modern-button"
            />
        </div>
    );

    return (
        <div className={sharedStyles.section}>
            <Toast ref={toast} />
            <div className={sharedStyles.sectionHeader}>
                <h2>Products</h2>
                <p>Manage your sponsorship products</p>
            </div>

            <Toolbar className="mb-4" left={leftToolbar} />

            <ProductTable products={products} onEdit={openEdit} onDelete={openDelete} />

            {/* Delete Confirmation Dialog */}
            <Dialog
                visible={deleteDialog}
                style={{ width: "32rem" }}
                breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                header="Confirm"
                modal
                footer={
                    <div>
                        <Button
                            label="No"
                            icon="pi pi-times"
                            outlined
                            onClick={() => setDeleteDialog(false)}
                        />
                        <Button
                            label="Yes"
                            icon="pi pi-check"
                            severity="danger"
                            onClick={handleDelete}
                            loading={loading}
                        />
                    </div>
                }
                onHide={() => setDeleteDialog(false)}
            >
                <div className="confirmation-content">
                    <i
                        className="pi pi-exclamation-triangle mr-3"
                        style={{ fontSize: "2rem" }}
                    />
                    <span>
                        Are you sure you want to archive <b>{selectedProduct.name}</b>?
                    </span>
                </div>
            </Dialog>
        </div>
    );
}
