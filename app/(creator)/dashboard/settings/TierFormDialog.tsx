"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { TierFormData } from "@/app/types/inventory";
import styles from "./settings.module.css";

interface TierFormDialogProps {
  visible: boolean;
  onHide: () => void;
  onSave: (data: TierFormData) => Promise<void>;
  initialData?: Partial<TierFormData>;
  loading: boolean;
}

export default function TierFormDialog({
  visible,
  onHide,
  onSave,
  initialData,
  loading,
}: TierFormDialogProps) {
  const [formData, setFormData] = useState<TierFormData>({
    name: "",
    type: "ad",
    price: 0,
    description: "",
    is_active: true,
  });

  // Reset form when dialog opens/data changes
  useEffect(() => {
    if (visible) {
      setFormData({
        id: initialData?.id,
        name: initialData?.name || "",
        type: initialData?.type || "ad",
        price: initialData?.price || 0,
        description: initialData?.description || "",
        is_active: initialData?.is_active ?? true,
      });
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    if (!formData.name || formData.price <= 0) return; // Basic validation
    onSave(formData);
  };

  const typeOptions = [
    { label: "Ad Slot", value: "ad" },
    { label: "Sponsorship", value: "sponsor" },
  ];

  return (
    <Dialog
      visible={visible}
      style={{ width: "32rem" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
      header={formData.id ? "Edit Tier" : "New Tier"}
      modal
      className="p-fluid"
      footer={
        <div>
          <Button
            label="Cancel"
            icon="pi pi-times"
            outlined
            onClick={onHide}
            disabled={loading}
          />
          <Button
            label="Save"
            icon="pi pi-check"
            onClick={handleSubmit}
            loading={loading}
            autoFocus
          />
        </div>
      }
      onHide={onHide}
    >
      <div className={styles.field}>
        <label htmlFor="name" style={{ fontWeight: "bold" }}>
          Name
        </label>
        <InputText
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          autoFocus
        />
      </div>

      <div className={styles.formGrid} style={{ marginTop: "1rem" }}>
        <div className={styles.field}>
          <label htmlFor="type" style={{ fontWeight: "bold" }}>
            Type
          </label>
          <Dropdown
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.value })}
            options={typeOptions}
            optionLabel="label"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="price" style={{ fontWeight: "bold" }}>
            Price (USD)
          </label>
          <InputNumber
            id="price"
            value={formData.price ? formData.price / 100 : 0}
            onValueChange={(e) =>
              setFormData({ ...formData, price: (e.value || 0) * 100 })
            }
            mode="currency"
            currency="USD"
            locale="en-US"
          />
        </div>
      </div>

      <div className={styles.field} style={{ marginTop: "1rem" }}>
        <label htmlFor="description" style={{ fontWeight: "bold" }}>
          Description
        </label>
        <InputTextarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          cols={20}
        />
      </div>

      <div className="flex align-items-center mt-3 gap-2">
        <Checkbox
          inputId="is_active"
          onChange={(e) =>
            setFormData({ ...formData, is_active: e.checked || false })
          }
          checked={formData.is_active}
        />
        <label htmlFor="is_active">Active (Visible in Portal)</label>
      </div>
    </Dialog>
  );
}
