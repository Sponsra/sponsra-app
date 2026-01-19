"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Accordion, AccordionTab } from "primereact/accordion"; // <--- Import Accordion
import { TierFormData, AvailabilitySchedule } from "@/app/types/inventory";
import TierAvailabilitySection from "./TierAvailabilitySection";
import styles from "./settings.module.css";

interface TierFormDialogProps {
  visible: boolean;
  onHide: () => void;
  onSave: (data: TierFormData) => Promise<void>;
  initialData?: Partial<TierFormData>;
  loading: boolean;
  newsletterId: string;
  onScheduleChange?: (schedule: AvailabilitySchedule | null) => void;
}

export default function TierFormDialog({
  visible,
  onHide,
  onSave,
  initialData,
  loading,
  newsletterId,
  onScheduleChange,
}: TierFormDialogProps) {
  // Initialize with defaults including the new specs
  const [formData, setFormData] = useState<TierFormData>({
    name: "",
    type: "ad",
    price: 0,
    description: "",
    is_active: true,
    specs_headline_limit: 60,
    specs_body_limit: 280,
    specs_image_ratio: "any",
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
        // Load existing specs or fall back to defaults
        specs_headline_limit: initialData?.specs_headline_limit || 60,
        specs_body_limit: initialData?.specs_body_limit || 280,
        specs_image_ratio: initialData?.specs_image_ratio || "any",
      });
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    if (!formData.name || formData.price <= 0) return;
    onSave(formData);
  };

  const typeOptions = [
    { label: "Ad Slot", value: "ad" },
    { label: "Sponsorship", value: "sponsor" },
  ];

  const imageRatioOptions = [
    { label: "Any Aspect Ratio", value: "any" },
    { label: "Square (1:1)", value: "1:1" },
    { label: "Landscape (1.91:1)", value: "1.91:1" },
    { label: "No Image Allowed", value: "no_image" },
  ];

  return (
    <Dialog
      visible={visible}
      style={{ width: "35rem" }} // Slightly wider for the accordion
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
      {/* --- Main Settings --- */}
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

      {/* --- Advanced Rules (New Section) --- */}
      <Accordion className="mt-4" activeIndex={null}>
        <AccordionTab header="Ad Constraints (The Rules)">
          <div className="flex flex-column gap-3">
            <div className="grid">
              <div className="col-6">
                <div className={styles.field}>
                  <label htmlFor="headlineLimit">Headline Length</label>
                  <InputNumber
                    id="headlineLimit"
                    value={formData.specs_headline_limit}
                    onValueChange={(e) =>
                      setFormData({
                        ...formData,
                        specs_headline_limit: e.value || 60,
                      })
                    }
                    min={10}
                    max={200}
                    suffix=" chars"
                  />
                </div>
              </div>
              <div className="col-6">
                <div className={styles.field}>
                  <label htmlFor="bodyLimit">Body Length</label>
                  <InputNumber
                    id="bodyLimit"
                    value={formData.specs_body_limit}
                    onValueChange={(e) =>
                      setFormData({
                        ...formData,
                        specs_body_limit: e.value || 280,
                      })
                    }
                    min={50}
                    max={5000}
                    suffix=" chars"
                  />
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="imageRatio">Image Requirement</label>
              <Dropdown
                id="imageRatio"
                value={formData.specs_image_ratio}
                options={imageRatioOptions}
                onChange={(e) =>
                  setFormData({ ...formData, specs_image_ratio: e.value })
                }
                optionLabel="label"
              />
              <small className="text-500 mt-1">
                We will validate uploaded images against this rule.
              </small>
            </div>
          </div>
        </AccordionTab>

        <AccordionTab header="Availability Schedule">
          <TierAvailabilitySection
            tierId={formData.id}
            newsletterId={newsletterId}
            onScheduleChange={onScheduleChange}
          />
        </AccordionTab>
      </Accordion>

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
