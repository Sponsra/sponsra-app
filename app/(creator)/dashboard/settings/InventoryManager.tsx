"use client";

import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InventoryTier, TierFormData } from "@/app/types/inventory";
import { upsertTier, deleteTier } from "@/app/actions/inventory";
import InventoryTable from "./InventoryTable"; // The new table we just made
import TierFormDialog from "./TierFormDialog"; // The new dialog we just made
import styles from "./settings.module.css";

interface InventoryManagerProps {
  initialTiers: InventoryTier[];
}

export default function InventoryManager({
  initialTiers,
}: InventoryManagerProps) {
  const [tiers, setTiers] = useState<InventoryTier[]>(initialTiers);
  const [tierDialog, setTierDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Partial<TierFormData>>({});
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  // --- Actions ---

  const openNew = () => {
    setSelectedTier({});
    setTierDialog(true);
  };

  const openEdit = (tier: InventoryTier) => {
    // Convert InventoryTier to TierFormData format (null -> undefined for description)
    setSelectedTier({
      id: tier.id,
      name: tier.name,
      type: tier.type,
      price: tier.price,
      description: tier.description ?? "",
      is_active: tier.is_active,
    });
    setTierDialog(true);
  };

  const openDelete = (tier: InventoryTier) => {
    // Convert InventoryTier to TierFormData format (null -> undefined for description)
    setSelectedTier({
      id: tier.id,
      name: tier.name,
      type: tier.type,
      price: tier.price,
      description: tier.description ?? "",
      is_active: tier.is_active,
    });
    setDeleteDialog(true);
  };

  const handleSave = async (data: TierFormData) => {
    setLoading(true);
    try {
      const result = await upsertTier(data);

      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Tier saved successfully",
        });
        setTierDialog(false);
        // In a production app, we might use router.refresh() here
        // to re-fetch server data, but for now we rely on the redirect/revalidate
        // or we could optimistically update local state here if needed.
        // For simplicity:
        window.location.reload();
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
        detail: "Failed to save tier",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTier.id) return;
    setLoading(true);

    try {
      const result = await deleteTier(selectedTier.id);

      if (result.success) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "Tier deleted",
        });
        setDeleteDialog(false);
        window.location.reload();
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
        detail: "Failed to delete tier",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---

  const leftToolbar = (
    <div className="flex flex-wrap gap-2">
      <Button
        label="New Tier"
        icon="pi pi-plus"
        onClick={openNew}
        className="modern-button"
      />
    </div>
  );

  return (
    <div className={styles.section}>
      <Toast ref={toast} />
      <div className={styles.sectionHeader}>
        <h2>Inventory Tiers</h2>
        <p>Manage your ad slots and pricing</p>
      </div>

      <Toolbar className="mb-4" left={leftToolbar} />

      <InventoryTable tiers={tiers} onEdit={openEdit} onDelete={openDelete} />

      {/* Create/Edit Dialog */}
      <TierFormDialog
        visible={tierDialog}
        onHide={() => setTierDialog(false)}
        onSave={handleSave}
        initialData={selectedTier}
        loading={loading}
      />

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
            Are you sure you want to delete <b>{selectedTier.name}</b>?
          </span>
        </div>
      </Dialog>
    </div>
  );
}
